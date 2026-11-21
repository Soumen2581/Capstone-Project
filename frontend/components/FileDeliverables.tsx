"use client";

import { Download } from "lucide-react";

import { downloadTextFile, type DeliverableFile } from "@/lib/deliverables";

export function FileDeliverables({
  files,
  description,
}: {
  files: DeliverableFile[];
  /** Optional one-line note shown above the download row(s). */
  description?: string | null;
}) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="file-deliverables-wrap">
      {description ? <p className="file-deliverables-desc">{description}</p> : null}
      <ul className="file-deliverables" aria-label="Downloadable files">
        {files.map((file) => (
          <li key={`${file.name}:${file.content.length}`} className="file-deliverable">
            <div className="file-deliverable-meta">
              <span className="file-deliverable-name">{file.name}</span>
              <span className="muted">Download to save</span>
            </div>
            <button
              type="button"
              className="px-btn primary file-deliverable-download"
              onClick={() => downloadTextFile(file.name, file.content)}
            >
              <Download size={14} aria-hidden />
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
