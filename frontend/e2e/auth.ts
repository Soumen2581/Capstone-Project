import type { Page } from "@playwright/test";

/** Grant the workspace auth cookie/flag so e2e can open /office directly. */
export async function grantWorkspaceAccess(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("agent-mesh-workspace-auth", "1");
    window.localStorage.setItem("agentorch.operatorId", "operator");
  });
}
