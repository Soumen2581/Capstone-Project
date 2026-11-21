"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useEffect, useState } from "react";

import type { WorkflowStatus, WorkflowView } from "@/lib/types";
import { formatWhen } from "@/lib/office";

function titleFrom(workflow: WorkflowView): string {
  const text = workflow.request.trim().replace(/\s+/g, " ");
  if (text.length <= 48) {
    return text || "Untitled";
  }
  return `${text.slice(0, 48)}…`;
}

function statusTone(status: WorkflowStatus): string {
  if (status === "completed") {
    return "ok";
  }
  if (status === "failed" || status === "cancelled") {
    return "err";
  }
  if (status === "running" || status === "awaiting_approval" || status === "pending") {
    return "info";
  }
  return "";
}

function useNarrowChatRail(breakpoint = 900) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const sync = () => setNarrow(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [breakpoint]);
  return narrow;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
}: {
  conversations: WorkflowView[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  const narrow = useNarrowChatRail();
  // Phones/tablets start collapsed so the thread has room; desktop starts open.
  const [expandedOnNarrow, setExpandedOnNarrow] = useState(false);
  const [collapsedOnWide, setCollapsedOnWide] = useState(false);
  const minimized = narrow ? !expandedOnNarrow : collapsedOnWide;

  if (minimized) {
    return (
      <aside className="chat-sidebar panel chat-sidebar-min" aria-label="Conversations">
        <button
          type="button"
          className="sidebar-toggle chat-sidebar-expand"
          aria-label="Expand chats"
          title="Expand chats"
          onClick={() => {
            if (narrow) {
              setExpandedOnNarrow(true);
            } else {
              setCollapsedOnWide(false);
            }
          }}
        >
          <PanelLeftOpen size={16} />
        </button>
        <button type="button" className="chat-min-new" onClick={onNew} title="New chat">
          +
        </button>
      </aside>
    );
  }

  return (
    <aside className="chat-sidebar panel" aria-label="Conversations">
      <div className="chat-sidebar-head">
        <button type="button" className="px-btn primary chat-new" onClick={onNew}>
          New chat
        </button>
        <button
          type="button"
          className="sidebar-toggle chat-sidebar-minimize"
          aria-label="Minimize chats"
          title="Minimize chats"
          onClick={() => {
            if (narrow) {
              setExpandedOnNarrow(false);
            } else {
              setCollapsedOnWide(true);
            }
          }}
        >
          <PanelLeftClose size={16} />
        </button>
      </div>
      <h2 className="chat-sidebar-label">Chats</h2>
      {conversations.length === 0 && (
        <p className="muted" style={{ padding: "0 4px", margin: 0 }}>
          Your conversations will show up here.
        </p>
      )}
      <ul className="chat-history">
        {conversations.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`chat-history-item ${activeId === item.id ? "on" : ""}`}
              onClick={() => {
                onSelect(item.id);
                if (narrow) {
                  setExpandedOnNarrow(false);
                }
              }}
            >
              <span className="chat-history-title">{titleFrom(item)}</span>
              <span className="chat-history-meta">
                <span className={`status-dot ${statusTone(item.status)}`} aria-hidden />
                {item.status.replaceAll("_", " ")} · {formatWhen(item.created_at)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
