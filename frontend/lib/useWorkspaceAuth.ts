"use client";

import { useEffect, useState } from "react";

import { isWorkspaceAuthed } from "@/lib/api";

/**
 * True once the visitor has signed in to the workspace (session token or local
 * operator login). Starts false so server and first client render match, then
 * reads browser storage after mount.
 */
export function useWorkspaceAuthed(): boolean {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sync = () => setAuthed(isWorkspaceAuthed());
    sync();
    // Keep other open tabs in step when someone logs in or out.
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return authed;
}
