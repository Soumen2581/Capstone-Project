/** Extract downloadable file bodies from agent / workflow result payloads. */

export type DeliverableFile = {
  name: string;
  content: string;
};

/** True when the operator asked for a downloadable file, not just an answer. */
export function requestWantsFile(request: string): boolean {
  const text = request.toLowerCase();
  if (
    /\b(pdf|docx?|xlsx|pptx|csv|zip)\b/.test(text) ||
    /\b(python\s+file|python\s+script|\.py\b|json\s+file)\b/.test(text)
  ) {
    return true;
  }
  if (
    /\b(give|send|create|write|generate|make|download|export|save)\b[\s\S]{0,48}\b(file|script|document)\b/.test(
      text,
    )
  ) {
    return true;
  }
  if (/\b(as a file|as an? .+\sfile|downloadable)\b/.test(text)) {
    return true;
  }
  return false;
}

/** One-line chat copy (file replies and other short notes). */
export function shortDescription(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= max) {
    return cleaned;
  }
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

/** Short label for file-mode replies (no code dump). */
export function fileReplySummary(
  result: Record<string, unknown> | null | undefined,
  files: DeliverableFile[],
): string {
  if (result && typeof result.summary === "string" && result.summary.trim()) {
    return shortDescription(result.summary);
  }
  if (files.length === 1) {
    return shortDescription(`Your file is ready: ${files[0]!.name}`);
  }
  if (files.length > 1) {
    return shortDescription(
      `Your files are ready: ${files.map((file) => file.name).join(", ")}`,
    );
  }
  return "Your file is ready to download.";
}

function pushFile(files: DeliverableFile[], name: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    return;
  }
  const safe = name.trim() || "file.txt";
  if (files.some((item) => item.name === safe && item.content === trimmed)) {
    return;
  }
  files.push({ name: safe, content: trimmed });
}

function fromChanges(result: Record<string, unknown>, files: DeliverableFile[]) {
  const changes = result.changes;
  if (!Array.isArray(changes)) {
    return;
  }
  for (const raw of changes) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const change = raw as Record<string, unknown>;
    const name = String(change.file ?? "file");
    if (typeof change.content === "string" && change.content.trim()) {
      pushFile(files, name, change.content);
    }
  }
}

function fromArtifacts(result: Record<string, unknown>, files: DeliverableFile[]) {
  const artifacts = result.artifacts;
  if (!Array.isArray(artifacts)) {
    return;
  }
  for (const raw of artifacts) {
    if (!raw || typeof raw !== "object") {
      continue;
    }
    const artifact = raw as Record<string, unknown>;
    const name = String(artifact.name ?? artifact.title ?? "artifact");
    if (typeof artifact.content === "string" && artifact.content.trim()) {
      pushFile(files, name, artifact.content);
    }
  }
}

/** Pull fenced blocks under `### filename` headings out of markdown-ish text. */
function fromMarkdown(text: string, files: DeliverableFile[]) {
  const pattern = /(?:^|\n)#{1,6}\s+([^\n]+)\n+```[^\n]*\n([\s\S]*?)```/g;
  for (const match of text.matchAll(pattern)) {
    const heading = (match[1] ?? "").trim().replace(/^`+|`+$/g, "");
    const body = match[2] ?? "";
    if (heading && body.trim()) {
      pushFile(files, heading, body);
    }
  }
}

export function extractDeliverableFiles(
  ...sources: Array<Record<string, unknown> | string | null | undefined>
): DeliverableFile[] {
  const files: DeliverableFile[] = [];
  for (const source of sources) {
    if (!source) {
      continue;
    }
    if (typeof source === "string") {
      fromMarkdown(source, files);
      continue;
    }
    fromChanges(source, files);
    fromArtifacts(source, files);
    for (const key of ["answer", "document", "content", "code"] as const) {
      const value = source[key];
      if (typeof value === "string") {
        fromMarkdown(value, files);
      }
    }
  }
  return files;
}

export function downloadTextFile(name: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name.includes(".") ? name : `${name}.txt`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
