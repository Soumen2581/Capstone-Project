"use client";

import type { WorkflowView } from "@/lib/types";
import { formatWhen } from "@/lib/office";
import { BrandLogo } from "@/components/BrandLogo";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { FileDeliverables } from "@/components/FileDeliverables";
import {
  extractDeliverableFiles,
  fileReplySummary,
  requestWantsFile,
  shortDescription,
} from "@/lib/deliverables";
import { BRAND_NAME } from "@/lib/brand";

function resultText(workflow: WorkflowView, asFile: boolean): string | null {
  const result = workflow.final_result;
  if (asFile) {
    const files = extractDeliverableFiles(
      result,
      ...workflow.nodes.map((node) => node.result),
    );
    if (files.length > 0 || (result && typeof result.summary === "string")) {
      return fileReplySummary(result, files);
    }
  }

  // Trust the workflow's synthesised `answer` — do not swap in a longer intermediate
  // node body (that often mixes drafts and invents details).
  if (result && Object.keys(result).length > 0) {
    if (typeof result.answer === "string" && result.answer.trim()) {
      if (asFile) {
        return fileReplySummary(result, extractDeliverableFiles(result));
      }
      return result.answer.trim();
    }
    if (typeof result.summary === "string" && result.summary.trim()) {
      if (asFile) {
        return shortDescription(result.summary);
      }
      return result.summary.trim();
    }
  }

  const fromNodes = workflow.nodes
    .map((node) => nodeBody(node.result, asFile))
    .filter((text): text is string => Boolean(text && text.trim()));
  if (fromNodes[0]) {
    return fromNodes[0];
  }
  if (result && Object.keys(result).length > 0) {
    return asFile ? fileReplySummary(result, []) : JSON.stringify(result, null, 2);
  }
  return null;
}

function nodeBody(result: Record<string, unknown>, asFile: boolean): string | null {
  if (asFile) {
    const files = extractDeliverableFiles(result);
    if (files.length > 0 || typeof result.summary === "string") {
      return fileReplySummary(result, files);
    }
  }

  for (const key of ["answer", "document", "content", "code"] as const) {
    const value = result[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  const changes = result.changes;
  if (Array.isArray(changes) && changes.length > 0) {
    const blocks: string[] = [];
    for (const raw of changes) {
      if (!raw || typeof raw !== "object") {
        continue;
      }
      const change = raw as Record<string, unknown>;
      const file = String(change.file ?? "file");
      const content = typeof change.content === "string" ? change.content : null;
      const diff = typeof change.diff === "string" ? change.diff : null;
      if (content?.trim()) {
        blocks.push(`### ${file}\n\n\`\`\`\n${content.trimEnd()}\n\`\`\``);
      } else if (diff?.trim()) {
        blocks.push(`### ${file}\n\n\`\`\`diff\n${diff.trimEnd()}\n\`\`\``);
      }
    }
    if (blocks.length > 0) {
      const summary =
        typeof result.summary === "string" && result.summary.trim()
          ? shortDescription(result.summary)
          : "";
      return summary ? `${summary}\n\n${blocks.join("\n\n")}` : blocks.join("\n\n");
    }
  }

  const artifacts = result.artifacts;
  if (Array.isArray(artifacts) && artifacts.length > 0) {
    const blocks: string[] = [];
    for (const raw of artifacts) {
      if (!raw || typeof raw !== "object") {
        continue;
      }
      const artifact = raw as Record<string, unknown>;
      const name = String(artifact.name ?? "artifact");
      const content = typeof artifact.content === "string" ? artifact.content : null;
      if (content?.trim()) {
        blocks.push(`### ${name}\n\n\`\`\`\n${content.trimEnd()}\n\`\`\``);
      }
    }
    if (blocks.length > 0) {
      const summary =
        typeof result.summary === "string" && result.summary.trim()
          ? shortDescription(result.summary)
          : "";
      return summary ? `${summary}\n\n${blocks.join("\n\n")}` : blocks.join("\n\n");
    }
  }

  if (typeof result.summary === "string" && result.summary.trim()) {
    return asFile ? shortDescription(result.summary) : result.summary;
  }
  return null;
}

function TurnView({
  turn,
  active,
  busy,
}: {
  turn: WorkflowView;
  active: boolean;
  busy: boolean;
}) {
  const asFile = requestWantsFile(turn.request);
  const answer = resultText(turn, asFile);
  const live =
    turn.status === "running" ||
    turn.status === "pending" ||
    turn.status === "awaiting_approval";

  const files = asFile
    ? extractDeliverableFiles(
        turn.final_result,
        ...turn.nodes.map((node) => node.result),
      )
    : [];
  const showResult =
    turn.status === "completed" && (Boolean(answer) || (asFile && files.length > 0));
  const failedMessage =
    turn.status === "failed"
      ? turn.error ||
        turn.nodes.map((node) => node.executions.at(-1)?.error_message).find(Boolean) ||
        null
      : null;

  return (
    <section className="chat-turn">
      <article className="chat-bubble user">
        <div className="chat-body">{turn.request}</div>
      </article>

      {active && (live || busy) && (
        <article className="chat-bubble agent thinking">
          <div className="chat-body">
            <span className="status-dot info" aria-hidden /> Working…
          </div>
        </article>
      )}

      {showResult && (
        <article className="chat-bubble agent result">
          {asFile ? (
            files.length > 0 ? (
              <FileDeliverables
                files={files}
                description={answer ?? fileReplySummary(turn.final_result, files)}
              />
            ) : answer ? (
              <div className="chat-body">{answer}</div>
            ) : null
          ) : (
            <ChatMarkdown content={answer ?? ""} />
          )}
          <div className="chat-turn-meta">
            <span>{formatWhen(turn.created_at)}</span>
            {turn.total_cost_usd > 0 && <span>${turn.total_cost_usd.toFixed(4)}</span>}
          </div>
        </article>
      )}

      {failedMessage && (
        <article className="chat-bubble agent">
          <p className="banner-err">{failedMessage}</p>
        </article>
      )}
    </section>
  );
}

export function ChatThread({
  workflow,
  history = [],
  busy,
  onOpenWork,
}: {
  workflow: WorkflowView | null;
  history?: WorkflowView[];
  busy: boolean;
  onOpenWork: () => void;
}) {
  if (!workflow && history.length === 0) {
    return (
      <div className="chat-thread empty">
        <div className="empty-state">
          {busy ? (
            <div className="empty-orb loading" aria-hidden />
          ) : (
            <BrandLogo size={64} variant="mark" className="empty-brand-logo" />
          )}
          <h3>{busy ? "Starting…" : "Ready for a request"}</h3>
          <p>
            {busy
              ? "Selecting specialists and opening the thread."
              : `Enter a brief below. ${BRAND_NAME} plans the work, routes models, and streams one result here.`}
          </p>
        </div>
      </div>
    );
  }

  const turns = [...history, ...(workflow ? [workflow] : [])];
  const activeId = workflow?.id ?? null;

  return (
    <div className="chat-thread">
      {turns.map((turn) => (
        <TurnView key={turn.id} turn={turn} active={turn.id === activeId} busy={busy} />
      ))}

      <div className="chat-thread-actions">
        <button type="button" className="px-btn ghost" onClick={onOpenWork}>
          View workflow details
        </button>
      </div>
    </div>
  );
}
