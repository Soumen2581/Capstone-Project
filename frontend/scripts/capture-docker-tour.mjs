import { chromium } from "@playwright/test";
import { mkdirSync } from "fs";

const outDir = "/Users/brainwavez/Desktop/Capstone-Project-personal-s3/docs/images/live";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  localStorage.setItem("agent-mesh-workspace-auth", "1");
  localStorage.setItem("agentorch.operatorId", "demo-operator");
});
const page = await context.newPage();

async function shot(name, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
  console.log("saved", name, "text?", (await page.locator("body").innerText()).slice(0, 60).replaceAll("\n", " | "));
}

await shot("docker-01-home", "http://localhost:3000/");
await shot("docker-02-login", "http://localhost:3000/login");
await shot("docker-03-command", "http://localhost:3000/office");
await page.getByTestId("office-tabs").waitFor({ timeout: 30000 });

const tabs = [
  ["docker-04-agents", "tab-agents"],
  ["docker-05-build", "tab-build"],
  ["docker-06-work", "tab-work"],
  ["docker-07-messages", "tab-activity"],
  ["docker-08-settings", "tab-settings"],
];
for (const [name, id] of tabs) {
  await page.getByTestId(id).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
  console.log("saved", name);
}

await browser.close();
console.log("done");
