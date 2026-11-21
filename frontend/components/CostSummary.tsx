"use client";

import type { ExecutionSummary, NodeView, WorkflowView } from "@/lib/types";

function latestExecution(node: NodeView): ExecutionSummary | undefined {
  return node.executions.at(-1);
}

export function CostSummary({ workflow }: { workflow: WorkflowView }) {
  const rows = workflow.nodes
    .map((node) => {
      const exec = latestExecution(node);
      if (!exec) {
        return null;
      }
      return { node, exec };
    })
    .filter((row): row is { node: NodeView; exec: ExecutionSummary } => row !== null);

  const inputTokens = rows.reduce((sum, row) => sum + (row.exec.input_tokens || 0), 0);
  const outputTokens = rows.reduce((sum, row) => sum + (row.exec.output_tokens || 0), 0);
  const latencyMs = rows.reduce((sum, row) => sum + (row.exec.latency_ms || 0), 0);
  const fallbacks = rows.filter((row) => row.exec.fallback_from_provider || row.exec.fallback_from_model);

  if (rows.length === 0 && workflow.total_cost_usd <= 0) {
    return (
      <div className="cost-summary" data-testid="cost-summary">
        <h3 className="panel-title">Cost & usage</h3>
        <p className="meta">No token or cost data recorded for this run yet.</p>
      </div>
    );
  }

  return (
    <div className="cost-summary" data-testid="cost-summary">
      <h3 className="panel-title">Cost & usage</h3>
      <div className="cost-totals">
        <div>
          <span className="meta">Total cost</span>
          <strong data-testid="cost-total">${workflow.total_cost_usd.toFixed(4)}</strong>
        </div>
        <div>
          <span className="meta">Tokens</span>
          <strong>
            {inputTokens} in / {outputTokens} out
          </strong>
        </div>
        <div>
          <span className="meta">Step latency sum</span>
          <strong>{Math.round(latencyMs)} ms</strong>
        </div>
        <div>
          <span className="meta">Fallbacks</span>
          <strong>{fallbacks.length}</strong>
        </div>
      </div>

      <table className="cost-table" data-testid="cost-breakdown">
        <thead>
          <tr>
            <th>Step</th>
            <th>Provider / model</th>
            <th>Tokens</th>
            <th>Cost</th>
            <th>Latency</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ node, exec }) => (
            <tr key={`${node.key}-${exec.attempt}`}>
              <td>
                {node.agent_name || node.agent_id}
                {exec.fallback_from_provider || exec.fallback_from_model ? (
                  <div className="meta">
                    Fallback from {exec.fallback_from_provider}:{exec.fallback_from_model}
                  </div>
                ) : null}
                {exec.routing_reason ? <div className="meta">{exec.routing_reason}</div> : null}
              </td>
              <td>
                {exec.provider || "—"}
                {exec.model ? ` / ${exec.model}` : ""}
              </td>
              <td>
                {exec.input_tokens}/{exec.output_tokens}
              </td>
              <td>${exec.cost_usd.toFixed(4)}</td>
              <td>{Math.round(exec.latency_ms)} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
