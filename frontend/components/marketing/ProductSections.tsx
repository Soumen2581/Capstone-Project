"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { WORKFLOW_STEPS } from "@/lib/design/agents";
import { AgentNetwork } from "@/components/marketing/AgentNetwork";
import { SectionAmbient } from "@/components/marketing/SectionAmbient";
import { SectionReveal as Reveal } from "@/components/marketing/SectionReveal";

export function WorkflowSection() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) {
      return;
    }
    const id = window.setInterval(() => setStep((s) => (s + 1) % WORKFLOW_STEPS.length), 1600);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section className="mkt-section" id="how-it-works">
      <SectionAmbient variant="dots" />
      <div className="mkt-grid">
        <Reveal>
          <p className="mkt-kicker">03 · The workflow</p>
          <h2 className="mkt-title">From brief to result.</h2>
        </Reveal>
        <ol className="workflow-rail" aria-label="Workflow stages">
          {WORKFLOW_STEPS.map((label, i) => (
            <li key={label} className={i <= step ? "on" : ""}>
              <button type="button" onClick={() => setStep(i)}>
                <span className="workflow-rail-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="workflow-rail-label">{label}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function CommunicationSection() {
  return (
    <section className="mkt-section mkt-section-dark" id="communication">
      <SectionAmbient variant="threads" />
      <div className="mkt-grid">
        <Reveal>
          <p className="mkt-kicker light">04 · Agents talk to each other</p>
          <h2 className="mkt-title light">AI doesn&apos;t work alone.</h2>
          <p className="mkt-body light mkt-measure">
            One specialist hands findings to the next. A reviewer sends notes back. The loop closes
            when the brief is done. Messages move through the office, quietly, precisely.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <AgentNetwork dark className="mkt-comm-viz" />
        </Reveal>
      </div>
    </section>
  );
}

const PRODUCT_FRAMES = [
  {
    src: "/marketing/tour-command.png",
    label: "Command",
    caption: "Submit a brief. Agent Mesh plans specialists and routes models.",
  },
  {
    src: "/marketing/tour-build.png",
    label: "Build",
    caption: "Compose a workflow DAG, preview dependencies, then run.",
  },
  {
    src: "/marketing/tour-work.png",
    label: "Work",
    caption: "Watch each agent step, costs, and hand-offs as the run progresses.",
  },
  {
    src: "/marketing/tour-messages.png",
    label: "Messages",
    caption: "Persistent agent mail and synthesized answers stay with the task.",
  },
  {
    src: "/marketing/tour-settings.png",
    label: "Settings",
    caption: "Connect free providers like Groq and Gemini, keep Free Only on.",
  },
] as const;

export function WorkspaceSection() {
  const [frame, setFrame] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      return;
    }
    const id = window.setInterval(() => setFrame((n) => (n + 1) % PRODUCT_FRAMES.length), 3200);
    return () => window.clearInterval(id);
  }, [reduce]);

  const current = PRODUCT_FRAMES[frame]!;

  return (
    <section className="mkt-section" id="workspace">
      <SectionAmbient variant="veil" />
      <div className="mkt-grid">
        <Reveal>
          <p className="mkt-kicker">05 · One workspace</p>
          <h2 className="mkt-title">Everything in one desk.</h2>
          <p className="mkt-body mkt-measure">
            Briefs, specialists, mail, and progress live together, so you watch the organization
            work, not a pile of disconnected chats.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="product-tour" aria-label="Workspace product tour">
            <div className="product-tour-tabs" role="tablist">
              {PRODUCT_FRAMES.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  role="tab"
                  aria-selected={index === frame}
                  className={index === frame ? "on" : ""}
                  onClick={() => setFrame(index)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <figure className="product-tour-frame">
              {/* eslint-disable-next-line @next/next/no-img-element -- local marketing capture */}
              <img key={current.src} src={current.src} alt={`Agent Mesh ${current.label} workspace`} />
              <figcaption>
                <strong>{current.label}</strong>
                <span>{current.caption}</span>
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function ModelsSection() {
  return (
    <section className="mkt-section mkt-section-muted">
      <SectionAmbient variant="dots" />
      <div className="mkt-grid mkt-two">
        <Reveal>
          <p className="mkt-kicker">06 · AI models</p>
          <h2 className="mkt-title">Agents stay. Models change.</h2>
          <p className="mkt-body">
            A specialist keeps its role whether it runs on Gemini, Groq, Claude, Kimi, or OpenRouter.
            Bring the keys you already subscribe to, the roster does not rename itself after a
            provider.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="model-stack" aria-label="Model independence example">
            <div className="model-stack-agent">Specialist</div>
            <div className="model-stack-arrow" aria-hidden />
            <ul>
              <li>Gemini</li>
              <li>Groq</li>
              <li>OpenRouter</li>
              <li>Claude · Kimi · more</li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FreeAISection() {
  return (
    <section className="mkt-section">
      <SectionAmbient variant="threads" />
      <div className="mkt-grid mkt-section-narrow">
        <Reveal>
          <p className="mkt-kicker">07 · Free AI</p>
          <h2 className="mkt-title">Free AI mode.</h2>
          <p className="mkt-body">
            Prefer verified free or lowest-cost models when you want $0 provider spend. Free Only
            never presents paid models as free, it routes to what your connected catalogue actually
            offers at no (or minimal) cost.
          </p>
          <ul className="free-points">
            <li>Free AI mode</li>
            <li>$0 provider-cost preference</li>
            <li>Verified free models when available</li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
