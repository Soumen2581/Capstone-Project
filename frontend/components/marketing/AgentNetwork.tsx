"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { COMM_EDGES, OFFICE_AGENTS, type OfficeAgentId } from "@/lib/design/agents";

/** Hub centers — every edge meets the same point on each agent (the hub). */
const POSITIONS: Record<OfficeAgentId, { x: number; y: number }> = {
  researcher: { x: 50, y: 12 },
  planner: { x: 18, y: 34 },
  builder: { x: 50, y: 44 },
  analyst: { x: 82, y: 34 },
  reviewer: { x: 32, y: 66 },
  strategist: { x: 68, y: 66 },
  synthesizer: { x: 50, y: 86 },
};

function labelSide(x: number): "left" | "right" {
  return x >= 50 ? "right" : "left";
}

type Props = {
  interactive?: boolean;
  dark?: boolean;
  className?: string;
};

export function AgentNetwork({ interactive = true, dark = false, className = "" }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<OfficeAgentId>("builder");
  const [pulse, setPulse] = useState(0);
  const [selected, setSelected] = useState<OfficeAgentId | null>(null);

  useEffect(() => {
    if (reduce) {
      return;
    }
    const id = window.setInterval(() => {
      setPulse((n) => n + 1);
      setActive((prev) => {
        const ids = OFFICE_AGENTS.map((a) => a.id);
        const i = ids.indexOf(prev);
        return ids[(i + 1) % ids.length]!;
      });
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduce]);

  const edge = useMemo(() => COMM_EDGES[pulse % COMM_EDGES.length]!, [pulse]);
  const selectedAgent = OFFICE_AGENTS.find((a) => a.id === selected) ?? null;
  const activeAgent = OFFICE_AGENTS.find((a) => a.id === active) ?? null;

  return (
    <div className={`agent-network ${dark ? "dark" : ""} ${className}`.trim()}>
      <div className="agent-network-stage">
        <svg
          className="agent-network-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Agent collaboration network"
        >
          {COMM_EDGES.map((e) => {
            const a = POSITIONS[e.from];
            const b = POSITIONS[e.to];
            const lit = edge.from === e.from && edge.to === e.to;
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={`net-edge ${lit ? "lit" : ""}`}
              />
            );
          })}
          {OFFICE_AGENTS.map((agent) => {
            const pos = POSITIONS[agent.id];
            const isActive = agent.id === active;
            return (
              <g key={`hub-${agent.id}`}>
                {isActive && !reduce && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={3.2}
                    className="net-hub-ring"
                    initial={{ opacity: 0.55, scale: 0.7 }}
                    animate={{ opacity: [0.45, 0.15, 0.45], scale: [0.85, 1.15, 0.85] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
                  />
                )}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isActive ? 1.55 : 1.1}
                  className={`net-hub ${isActive ? "on" : ""}`}
                />
              </g>
            );
          })}
          {!reduce && (
            <motion.circle
              key={pulse}
              r={0.9}
              className="net-packet"
              initial={{
                cx: POSITIONS[edge.from].x,
                cy: POSITIONS[edge.from].y,
                opacity: 0,
              }}
              animate={{
                cx: POSITIONS[edge.to].x,
                cy: POSITIONS[edge.to].y,
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          )}
        </svg>

        {OFFICE_AGENTS.map((agent) => {
          const pos = POSITIONS[agent.id];
          const isActive = agent.id === active;
          const side = labelSide(pos.x);
          return (
            <button
              key={agent.id}
              type="button"
              className={`net-node net-node-${side} ${isActive ? "on" : ""}`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => interactive && setSelected(agent.id)}
              disabled={!interactive}
              aria-pressed={selected === agent.id}
              aria-current={isActive ? "true" : undefined}
            >
              <span className="net-node-name">{agent.name}</span>
              {isActive && <span className="net-node-status">Active</span>}
            </button>
          );
        })}

        {selectedAgent && (
          <aside className="net-detail" aria-label={`${selectedAgent.name} details`}>
            <header>
              <h3>{selectedAgent.name}</h3>
              <button type="button" className="mkt-linkish" onClick={() => setSelected(null)}>
                Close
              </button>
            </header>
            <p className="muted">{selectedAgent.role}</p>
            <p>{selectedAgent.blurb}</p>
            <dl className="net-detail-meta">
              <div>
                <dt>Status</dt>
                <dd>{selectedAgent.id === active ? "Active" : "Ready"}</dd>
              </div>
              <div>
                <dt>Model</dt>
                <dd>Auto</dd>
              </div>
              <div>
                <dt>Current task</dt>
                <dd>{selectedAgent.id === active ? edge.sample : "Waiting for handoff"}</dd>
              </div>
            </dl>
          </aside>
        )}
      </div>

      <p className="net-message" aria-live="polite">
        <span className="net-message-active">
          Active · {activeAgent?.name ?? "Agent"}
        </span>
        <strong>{OFFICE_AGENTS.find((a) => a.id === edge.from)?.name}</strong>
        {" → "}
        <strong>{OFFICE_AGENTS.find((a) => a.id === edge.to)?.name}</strong>
        <span>{edge.sample}</span>
      </p>
    </div>
  );
}
