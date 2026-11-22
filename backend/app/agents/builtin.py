"""Built-in agent definitions.

These are *seed data*, not special cases. The orchestrator and executor read the
registry, not this module, so an operator can add, disable, or replace an agent by
changing rows instead of engine code. Display-name helpers are the one exception the
API uses so the graph shows "Security Agent" rather than a stripped id.

Capability sets are deliberately disjoint where the domains are distinct: overlapping
declarations would make selection ambiguous and risk activating two agents for one need.

Agents declare *traits*, not vendor model ids. Any connected compatible model can power
any agent; Fixed bindings are optional operator overrides, never part of the role.
"""

from __future__ import annotations

from app.domain.enums import Capability, ModelTrait
from app.schemas.agent import AgentDefinition, AgentLimits, ModelPreference, RetryPolicy

# Reusable JSON Schema fragments. Every output schema is an object so downstream input
# can be built from named fields.
_STRING_ARRAY = {"type": "array", "items": {"type": "string"}}

# Shared shape of what the executor validates before calling a model (TC_49).
_UPSTREAM_ITEM = {
    "type": "object",
    "required": ["node_key", "agent_id", "payload"],
    "properties": {
        "node_key": {"type": "string", "minLength": 1},
        "agent_id": {"type": "string", "minLength": 1},
        "payload": {"type": "object"},
    },
    "additionalProperties": False,
}


def _input_schema(
    *,
    description: str,
    parameter_properties: dict[str, object] | None = None,
    require_upstream: bool = False,
) -> dict[str, object]:
    """JSON Schema for the agent hand-off document the executor validates."""
    required = ["objective"]
    if require_upstream:
        required.append("upstream")
    return {
        "type": "object",
        "description": description,
        "required": required,
        "additionalProperties": False,
        "properties": {
            "objective": {
                "type": "string",
                "minLength": 1,
                "description": "Natural-language objective for this agent step.",
            },
            "parameters": {
                "type": "object",
                "description": "Operator or planner parameters for this step.",
                "properties": parameter_properties or {},
                "additionalProperties": True,
            },
            "upstream": {
                "type": "array",
                "description": "Validated payloads from upstream workflow nodes.",
                "items": _UPSTREAM_ITEM,
                "minItems": 1 if require_upstream else 0,
            },
            "feedback": {
                "type": ["string", "null"],
                "description": "Retry feedback from a prior failed attempt, if any.",
            },
            "context_notes": {
                "type": ["string", "null"],
                "description": "Hive/memory excerpts assembled for this attempt.",
            },
        },
    }


PLANNING_AGENT = AgentDefinition(
    id="planning-agent",
    name="Planning Agent",
    description=(
        "Decomposes a complex request into discrete steps and identifies the "
        "capabilities each step requires."
    ),
    capabilities=frozenset({Capability.TASK_DECOMPOSITION}),
    instructions=(
        "You are a planning agent. Break the user's request into the smallest set of "
        "concrete steps that satisfies it. For each step, state the single capability "
        "it requires. Do not invent work the request does not ask for. If one step is "
        "enough, return one step."
    ),
    input_schema=_input_schema(
        description=(
            "Decomposes the operator brief into capability-tagged steps. Requires a "
            "non-empty objective; optional max_steps bounds the plan size."
        ),
        parameter_properties={
            "max_steps": {
                "type": "integer",
                "minimum": 1,
                "maximum": 32,
                "description": "Optional upper bound on plan steps.",
            },
        },
    ),
    output_schema={
        "type": "object",
        "required": ["steps"],
        "additionalProperties": False,
        "properties": {
            "steps": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["description", "capability"],
                    "properties": {
                        "description": {"type": "string"},
                        "capability": {"type": "string"},
                        "depends_on": _STRING_ARRAY,
                    },
                },
            },
            "rationale": {"type": "string"},
        },
    },
    model_preference=ModelPreference(
        required_traits=(ModelTrait.REASONING,),
        preferred_traits=(ModelTrait.STRUCTURED_OUTPUT,),
        temperature=0.1,
    ),
    limits=AgentLimits(timeout_seconds=90.0, max_cost_usd=0.25),
)


RESEARCH_AGENT = AgentDefinition(
    id="research-agent",
    name="Research Agent",
    description="Gathers external information, summarises it, and extracts sources.",
    capabilities=frozenset(
        {
            Capability.WEB_RESEARCH,
            Capability.SUMMARISATION,
            Capability.SOURCE_EXTRACTION,
        }
    ),
    instructions=(
        "You are a research agent. Answer the objective carefully.\n"
        "- Put the direct user-facing answer in `answer` (complete prose the operator "
        "should read). Use `summary` as a one-line label only.\n"
        "- For who holds office now or other current facts, state the present holder "
        "and as-of timing; never present a past holder as current.\n"
        "- Separate established facts from inference; attribute claims when you can.\n"
        "- Do not invent customers, revenue, acquisitions, partnerships, or product "
        "details. If something is rumoured or unknown, label it as such or omit it.\n"
        "- Prefer fewer accurate findings over a long speculative list.\n"
        "- State explicitly what you could not determine."
    ),
    input_schema=_input_schema(
        description=(
            "Gathers findings for a research objective. Accepts an optional query and "
            "seed URLs in parameters; upstream payloads are optional context."
        ),
        parameter_properties={
            "query": {"type": "string", "description": "Override search query."},
            "urls": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Seed URLs to prioritise.",
            },
        },
    ),
    output_schema={
        "type": "object",
        "required": ["findings"],
        "properties": {
            "answer": {
                "type": "string",
                "description": "Full prose answer the operator should read.",
            },
            "findings": {"type": "array", "items": {"type": "string"}},
            "summary": {"type": "string"},
            "sources": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "url": {"type": "string"},
                        "reliability": {"type": "string"},
                    },
                },
            },
            "unresolved": _STRING_ARRAY,
        },
    },
    model_preference=ModelPreference(
        # Prefer Perplexity Sonar when configured so current-fact asks are search-grounded.
        preferred_provider="perplexity",
        preferred_traits=(ModelTrait.LONG_CONTEXT, ModelTrait.FAST),
        min_context_tokens=32_000,
    ),
    tools=("web_search",),
    permissions=("network:read",),
    limits=AgentLimits(timeout_seconds=180.0, max_cost_usd=0.40),
)


SECURITY_AGENT = AgentDefinition(
    id="security-agent",
    name="Security Agent",
    description=(
        "Code Auditor — analyses code and dependencies for vulnerabilities and "
        "recommends remediation (Review-Fix-Test pipeline)."
    ),
    capabilities=frozenset(
        {
            Capability.VULNERABILITY_ANALYSIS,
            Capability.SECURITY_RECOMMENDATION,
            Capability.DEPENDENCY_AUDIT,
        }
    ),
    instructions=(
        "You are a security analysis agent. Report only vulnerabilities you can point "
        "to in the supplied material. For each, give severity, location, the issue, and "
        "a concrete remediation. If you find nothing, return an empty findings list — "
        "an empty result is a valid and useful answer, and inventing issues is worse "
        "than finding none."
    ),
    input_schema=_input_schema(
        description=(
            "Audits code for vulnerabilities. Supply code inline via parameters.code "
            "and/or file paths via parameters.files; upstream coding payloads are also "
            "accepted."
        ),
        parameter_properties={
            "code": {"type": "string", "description": "Source text to audit."},
            "files": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Repository paths in scope.",
            },
            "language": {"type": "string"},
        },
    ),
    output_schema={
        "type": "object",
        "required": ["findings"],
        "properties": {
            "findings": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["severity", "issue"],
                    "properties": {
                        "severity": {
                            "type": "string",
                            "enum": ["critical", "high", "medium", "low", "info"],
                        },
                        "file": {"type": "string"},
                        "line": {"type": "integer"},
                        "issue": {"type": "string"},
                        "recommendation": {"type": "string"},
                        "cwe": {"type": "string"},
                    },
                },
            },
            "summary": {"type": "string"},
            "scanned": _STRING_ARRAY,
        },
    },
    model_preference=ModelPreference(
        required_traits=(ModelTrait.REASONING,),
        preferred_traits=(ModelTrait.CODING,),
        temperature=0.0,
    ),
    permissions=("repo:read",),
    limits=AgentLimits(timeout_seconds=240.0, max_cost_usd=0.75),
    retry_policy=RetryPolicy(max_attempts=3),
)


CODING_AGENT = AgentDefinition(
    id="coding-agent",
    name="Coding Agent",
    description=(
        "Code Fixer — writes, modifies, and debugs code in response to a concrete "
        "objective (Review-Fix-Test pipeline)."
    ),
    capabilities=frozenset(
        {
            Capability.CODE_GENERATION,
            Capability.CODE_MODIFICATION,
            Capability.DEBUGGING,
        }
    ),
    instructions=(
        "You are a coding agent. Satisfy the objective with real, runnable deliverables. "
        "For create/modify actions, ALWAYS fill `changes[].content` with the COMPLETE "
        "file body (not a sketch, not 'code goes here', not only a summary). "
        "Use `diff` only when a precise patch is clearer than a full file. "
        "`summary` is a one-line label for the office UI. "
        "If upstream feedback describes a test failure, fix that specific failure rather "
        "than rewriting unrelated code."
    ),
    input_schema=_input_schema(
        description=(
            "Produces code changes for the objective. Optional parameters.language and "
            "parameters.target_files refine scope; upstream security/review findings are "
            "consumed when present."
        ),
        parameter_properties={
            "language": {"type": "string"},
            "target_files": {
                "type": "array",
                "items": {"type": "string"},
            },
            "framework": {"type": "string"},
        },
    ),
    output_schema={
        "type": "object",
        "required": ["changes", "summary"],
        "properties": {
            "changes": {
                "type": "array",
                "minItems": 1,
                "items": {
                    "type": "object",
                    "required": ["file", "action"],
                    "properties": {
                        "file": {"type": "string"},
                        "action": {
                            "type": "string",
                            "enum": ["create", "modify", "delete"],
                        },
                        "content": {
                            "type": "string",
                            "description": "Full file contents for create/modify; empty for delete.",
                        },
                        "diff": {"type": "string"},
                        "explanation": {"type": "string"},
                    },
                },
            },
            "summary": {"type": "string"},
            "follow_ups": _STRING_ARRAY,
        },
    },
    model_preference=ModelPreference(
        required_traits=(ModelTrait.CODING,),
        preferred_traits=(ModelTrait.REASONING,),
        min_context_tokens=64_000,
        max_output_tokens=16_384,
        temperature=0.1,
    ),
    permissions=("repo:read", "repo:write"),
    limits=AgentLimits(timeout_seconds=300.0, max_cost_usd=1.50),
    retry_policy=RetryPolicy(max_attempts=3, initial_backoff_seconds=2.0),
)


TESTING_AGENT = AgentDefinition(
    id="testing-agent",
    name="Testing Agent",
    description=(
        "Automated Test Writer — generates tests, analyses failures, and reports "
        "outcomes (Review-Fix-Test pipeline)."
    ),
    capabilities=frozenset(
        {
            Capability.TEST_GENERATION,
            Capability.TEST_ANALYSIS,
            Capability.TEST_EXECUTION,
        }
    ),
    instructions=(
        "You are a testing agent. Write tests that would fail without the change under "
        "test, covering at least one failure path. When analysing failures, identify the "
        "root cause and say which file must change — that message is routed back to the "
        "coding agent, so be specific."
    ),
    input_schema=_input_schema(
        description=(
            "Writes or analyses tests for upstream code changes. Prefer upstream coding "
            "payloads that include a changes array; parameters.test_framework is optional."
        ),
        parameter_properties={
            "test_framework": {"type": "string"},
            "focus": {"type": "string"},
        },
    ),
    output_schema={
        "type": "object",
        "required": ["passed"],
        "properties": {
            "passed": {"type": "boolean"},
            "tests": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["name"],
                    "properties": {
                        "name": {"type": "string"},
                        "file": {"type": "string"},
                        "content": {"type": "string"},
                        "status": {
                            "type": "string",
                            "enum": ["passed", "failed", "skipped", "generated"],
                        },
                    },
                },
            },
            "failures": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "test": {"type": "string"},
                        "message": {"type": "string"},
                        "suspected_file": {"type": "string"},
                    },
                },
            },
            "summary": {"type": "string"},
        },
    },
    model_preference=ModelPreference(
        required_traits=(ModelTrait.CODING,),
        temperature=0.1,
        max_output_tokens=8_192,
    ),
    permissions=("repo:read", "repo:write", "process:execute"),
    limits=AgentLimits(timeout_seconds=300.0, max_cost_usd=0.90),
    retry_policy=RetryPolicy(max_attempts=3),
)


REVIEW_AGENT = AgentDefinition(
    id="review-agent",
    name="Review Agent",
    description="Reviews work produced by other agents and assesses whether it is acceptable.",
    capabilities=frozenset({Capability.CODE_REVIEW, Capability.QUALITY_ASSESSMENT}),
    instructions=(
        "You are a review agent. Judge the upstream work against the original "
        "objective. Report concrete defects with their location and severity. Approve "
        "only if the objective is met; say plainly what is missing when it is not."
    ),
    input_schema=_input_schema(
        description=(
            "Reviews upstream work against the original objective. Expects at least one "
            "upstream payload (code, tests, or findings) when used in a pipeline."
        ),
        parameter_properties={
            "strictness": {
                "type": "string",
                "enum": ["lenient", "standard", "strict"],
            },
        },
    ),
    output_schema={
        "type": "object",
        "required": ["approved"],
        "properties": {
            "approved": {"type": "boolean"},
            "issues": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["severity", "description"],
                    "properties": {
                        "severity": {
                            "type": "string",
                            "enum": ["blocker", "major", "minor", "nit"],
                        },
                        "file": {"type": "string"},
                        "description": {"type": "string"},
                    },
                },
            },
            "assessment": {"type": "string"},
        },
    },
    model_preference=ModelPreference(
        required_traits=(ModelTrait.REASONING,),
        preferred_traits=(ModelTrait.CODING,),
        temperature=0.0,
    ),
    limits=AgentLimits(timeout_seconds=180.0, max_cost_usd=0.80),
)


DOCUMENTATION_AGENT = AgentDefinition(
    id="documentation-agent",
    name="Documentation Agent",
    description="Writes documentation and assembles reports from upstream agent results.",
    capabilities=frozenset({Capability.DOCUMENTATION, Capability.REPORT_GENERATION}),
    instructions=(
        "You are a documentation agent. Write for a reader who did not watch the work "
        "happen. Use only what upstream agents actually reported; if something was not "
        "done or was skipped, say so rather than omitting it."
    ),
    input_schema=_input_schema(
        description=(
            "Assembles a reader-facing document from upstream agent results. Upstream "
            "payloads should carry the findings to include; parameters.format selects "
            "markdown/text/html."
        ),
        parameter_properties={
            "format": {"type": "string", "enum": ["markdown", "text", "html"]},
            "audience": {"type": "string"},
        },
    ),
    output_schema={
        "type": "object",
        "required": ["document"],
        "properties": {
            "document": {"type": "string"},
            "format": {"type": "string", "enum": ["markdown", "text", "html"]},
            "sections": _STRING_ARRAY,
            "omissions": _STRING_ARRAY,
        },
    },
    model_preference=ModelPreference(
        preferred_traits=(ModelTrait.FAST, ModelTrait.LONG_CONTEXT),
        min_context_tokens=32_000,
        max_output_tokens=8_192,
        temperature=0.3,
    ),
    limits=AgentLimits(timeout_seconds=180.0, max_cost_usd=0.40),
)


DATA_CLEANER_AGENT = AgentDefinition(
    id="data-cleaner-agent",
    name="Data Cleaner Agent",
    description=(
        "Cleans tabular data such as CSV files: fixes types and formats, removes "
        "duplicates, handles missing values, and reports every change it made."
    ),
    capabilities=frozenset({Capability.DATA_CLEANING}),
    instructions=(
        "You are a data cleaning agent. Clean only the dataset supplied in the objective "
        "or upstream context. Normalise formats and types, remove exact duplicate rows, "
        "and handle missing values conservatively (never invent data). Return the full "
        "cleaned dataset in `cleaned_data` in the same format it arrived in, a readable "
        "`change_summary`, and one entry per change in `changes`. If no dataset was "
        "supplied, say so in `change_summary` and return `cleaned_data` empty."
    ),
    input_schema=_input_schema(
        description=(
            "Cleans tabular data. Pass CSV/JSON text in parameters.dataset (or embed it "
            "in the objective). Upstream datasets are also accepted."
        ),
        parameter_properties={
            "dataset": {
                "type": "string",
                "description": "Raw CSV or JSON dataset to clean.",
            },
            "format": {"type": "string", "enum": ["csv", "json", "tsv"]},
        },
    ),
    output_schema={
        "type": "object",
        "required": ["summary", "cleaned_data", "change_summary"],
        "properties": {
            "summary": {"type": "string"},
            "cleaned_data": {"type": "string"},
            "change_summary": {"type": "string"},
            "changes": _STRING_ARRAY,
            "rows_before": {"type": "integer", "minimum": 0},
            "rows_after": {"type": "integer", "minimum": 0},
        },
    },
    model_preference=ModelPreference(
        preferred_traits=(ModelTrait.STRUCTURED_OUTPUT, ModelTrait.LONG_CONTEXT),
        min_context_tokens=32_000,
        max_output_tokens=8_192,
        temperature=0.0,
    ),
    limits=AgentLimits(timeout_seconds=180.0, max_cost_usd=0.40),
    retry_policy=RetryPolicy(max_attempts=3),
)


DATA_ANALYST_AGENT = AgentDefinition(
    id="data-analyst-agent",
    name="Data Analyst Agent",
    description=(
        "Analyses cleaned tabular data: distributions, trends, correlations, and "
        "structured insights for downstream reporting (Sprint 2 data pipeline)."
    ),
    capabilities=frozenset({Capability.DATA_ANALYSIS}),
    instructions=(
        "You are a data analyst. Prefer the cleaned dataset from upstream "
        "(`cleaned_data`) when present; otherwise use the objective or context. "
        "Produce concrete, evidence-backed insights — do not invent numbers. "
        "Put a short office label in `summary`, the main narrative in `analysis`, "
        "bullet insights in `insights`, and any metrics in `metrics` as "
        "name/value pairs. If no dataset is available, say so clearly in "
        "`analysis` and leave `insights` empty."
    ),
    input_schema=_input_schema(
        description=(
            "Analyses cleaned tabular data. Prefer upstream data-cleaner payloads with "
            "cleaned_data; parameters.dataset is a fallback when no upstream exists."
        ),
        parameter_properties={
            "dataset": {"type": "string"},
            "questions": {
                "type": "array",
                "items": {"type": "string"},
            },
        },
    ),
    output_schema={
        "type": "object",
        "required": ["summary", "analysis", "insights"],
        "properties": {
            "summary": {"type": "string"},
            "analysis": {"type": "string"},
            "insights": _STRING_ARRAY,
            "metrics": {
                "type": "array",
                "items": {
                    "type": "object",
                    "required": ["name", "value"],
                    "properties": {
                        "name": {"type": "string"},
                        "value": {"type": "string"},
                    },
                },
            },
            "limitations": _STRING_ARRAY,
        },
    },
    model_preference=ModelPreference(
        preferred_traits=(ModelTrait.REASONING, ModelTrait.STRUCTURED_OUTPUT),
        min_context_tokens=32_000,
        max_output_tokens=8_192,
        temperature=0.1,
    ),
    limits=AgentLimits(timeout_seconds=240.0, max_cost_usd=0.60),
    retry_policy=RetryPolicy(max_attempts=3),
)


GENERAL_AGENT = AgentDefinition(
    id="general-agent",
    name="General Agent",
    description=(
        "Handles arbitrary tasks that do not require a specialised desk — coding, "
        "research, writing, planning, debugging, or analysis in one place."
    ),
    capabilities=frozenset({Capability.GENERAL_ASSISTANCE}),
    instructions=(
        "You are a general-purpose assistant for this office — respond like a strong "
        "ChatGPT-style model: clear, accurate, and directly useful.\n"
        "- Questions / explanations / advice: write the full reply in `answer` "
        "(clean markdown allowed inside the JSON string). The operator reads `answer`.\n"
        "- Do not invent facts. For company or product overviews, stick to well-known "
        "points and say when details are uncertain instead of fabricating tables.\n"
        "- Prefer a concise, readable reply over padded reports.\n"
        "- Code or files: put complete source in `answer` AND add each file under "
        "`artifacts` with `name`, `kind` (e.g. code), and full `content`.\n"
        "- Never claim you provided code, a file, or an explanation without including "
        "it. `summary` is only a one-line office label.\n"
        "If a specialist desk is clearly needed later, note that in follow_ups."
    ),
    input_schema=_input_schema(
        description=(
            "General-purpose assistance for briefs that do not require a specialist. "
            "Requires a non-empty objective; optional tone/format parameters."
        ),
        parameter_properties={
            "tone": {"type": "string"},
            "format": {"type": "string"},
        },
    ),
    output_schema={
        "type": "object",
        "required": ["summary", "answer"],
        "properties": {
            "summary": {"type": "string"},
            "answer": {"type": "string"},
            "findings": {"type": "array", "items": {"type": "string"}},
            "recommendations": _STRING_ARRAY,
            "follow_ups": _STRING_ARRAY,
            "artifacts": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "kind": {"type": "string"},
                        "content": {"type": "string"},
                    },
                },
            },
        },
    },
    model_preference=ModelPreference(
        preferred_traits=(ModelTrait.REASONING, ModelTrait.STRUCTURED_OUTPUT),
        temperature=0.2,
    ),
    limits=AgentLimits(timeout_seconds=240.0, max_cost_usd=0.75),
)


BUILTIN_AGENTS: tuple[AgentDefinition, ...] = (
    PLANNING_AGENT,
    RESEARCH_AGENT,
    SECURITY_AGENT,
    CODING_AGENT,
    TESTING_AGENT,
    REVIEW_AGENT,
    DOCUMENTATION_AGENT,
    DATA_CLEANER_AGENT,
    DATA_ANALYST_AGENT,
    GENERAL_AGENT,
)

BUILTIN_NAMES: dict[str, str] = {agent.id: agent.name for agent in BUILTIN_AGENTS}


def agent_display_name(agent_id: str) -> str:
    """Original display name for a built-in id; title-case fallback for others."""
    known = BUILTIN_NAMES.get(agent_id)
    if known is not None:
        return known
    if agent_id.endswith("-agent"):
        stem = agent_id.removesuffix("-agent").replace("-", " ").title()
        return f"{stem} Agent"
    return agent_id
