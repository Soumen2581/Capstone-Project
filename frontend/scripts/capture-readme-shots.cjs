const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = path.resolve(__dirname, "../../docs/images");
const PORT = 9229;

fs.mkdirSync(OUT, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function main() {
  const chrome = spawn(
    CHROME,
    [
      `--remote-debugging-port=${PORT}`,
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=1440,920",
      "--user-data-dir=/tmp/agent-mesh-chrome-shots",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  await sleep(1500);

  const CDP = (await import("chrome-remote-interface")).default;
  const client = await CDP({ port: PORT });
  const { Page, Runtime, Emulation, Network } = client;
  await Promise.all([Page.enable(), Runtime.enable(), Network.enable()]);
  await Page.addScriptToEvaluateOnNewDocument({
    source: `(() => {
      try {
        localStorage.setItem('agent-mesh-theme', 'dark');
        localStorage.setItem('agent-mesh-workspace-auth', '1');
        localStorage.setItem('agentorch.operatorId', 'operator');
        document.documentElement.dataset.theme = 'dark';
        document.documentElement.dataset.themePreference = 'dark';
        document.documentElement.style.colorScheme = 'dark';
      } catch (e) {}
    })()`,
  });
  await Emulation.setDeviceMetricsOverride({
    width: 1440,
    height: 920,
    deviceScaleFactor: 2,
    mobile: false,
  });

  async function hideOverlays() {
    await Runtime.evaluate({
      expression: `(() => {
        document.querySelectorAll('nextjs-portal').forEach(e => e.remove());
        if (!document.getElementById('shot-hide')) {
          const s = document.createElement('style');
          s.id = 'shot-hide';
          s.textContent = \`
            nextjs-portal,[data-next-badge-root],[data-nextjs-toast]{display:none!important}
            html{scroll-behavior:auto!important}
            *,*::before,*::after{animation:none!important;transition:none!important}
          \`;
          document.head.appendChild(s);
        }
        try {
          localStorage.setItem('agent-mesh-theme', 'dark');
          localStorage.setItem('agent-mesh-workspace-auth', '1');
          localStorage.setItem('agentorch.operatorId', 'operator');
          document.documentElement.dataset.theme = 'dark';
          document.documentElement.dataset.themePreference = 'dark';
          document.documentElement.style.colorScheme = 'dark';
        } catch (e) {}
        return true;
      })()`,
    });
  }

  async function setNavVisible(visible) {
    await Runtime.evaluate({
      expression: `(() => {
        const header = document.querySelector('header.mkt-nav') || document.querySelector('header');
        if (header) header.style.setProperty('display', ${JSON.stringify(visible ? "" : "none")}, 'important');
        return !!header;
      })()`,
    });
  }

  async function goto(url) {
    await Page.navigate({ url });
    await Page.loadEventFired();
    await sleep(1600);
    await hideOverlays();
    await sleep(300);
  }

  async function shotClip(file, clip) {
    const { data } = await Page.captureScreenshot({
      format: "png",
        clip: { ...clip, scale: 1 },
      captureBeyondViewport: true,
      fromSurface: true,
    });
    fs.writeFileSync(path.join(OUT, file), Buffer.from(data, "base64"));
    console.log("ok", file, clip.width + "x" + clip.height);
  }

  async function sectionClip(selector) {
    const { result } = await Runtime.evaluate({
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        el.scrollIntoView({ block: 'start' });
        const r = el.getBoundingClientRect();
        return {
          x: Math.max(0, Math.floor(r.left)),
          y: Math.max(0, Math.floor(window.scrollY + r.top)),
          width: Math.ceil(r.width),
          height: Math.ceil(r.height),
        };
      })()`,
      returnByValue: true,
    });
    return result.value;
  }

  async function heroClip() {
    const { result } = await Runtime.evaluate({
      expression: `(() => {
        window.scrollTo(0,0);
        const hero = document.querySelector('section.mkt-hero');
        const r = hero.getBoundingClientRect();
        return {
          x: 0,
          y: 0,
          width: Math.ceil(document.documentElement.clientWidth),
          height: Math.ceil(r.bottom),
        };
      })()`,
      returnByValue: true,
    });
    return result.value;
  }

  // Marketing
  await goto("http://localhost:3000/");
  await setNavVisible(true);
  await shotClip("product-hero-dark.png", await heroClip());
  for (const [sel, file] of [
    ["#agents", "product-agents-dark.png"],
    ["#communication", "product-mesh-dark.png"],
    ["#workspace", "product-workspace-dark.png"],
  ]) {
    await goto("http://localhost:3000/");
    await setNavVisible(false);
    await sleep(200);
    const clip = await sectionClip(sel);
    if (!clip) throw new Error("missing " + sel);
    await sleep(400);
    await shotClip(file, clip);
  }

  // Office
  await goto("http://localhost:3000/office");
  await setNavVisible(true);
  await Runtime.evaluate({ expression: "window.scrollTo(0,0)" });
  await sleep(400);
  const { data: officeData } = await Page.captureScreenshot({
    format: "png",
    fromSurface: true,
  });
  fs.writeFileSync(path.join(OUT, "product-command-dark.png"), Buffer.from(officeData, "base64"));
  console.log("ok 06-office-home.png");

  // Settings — taller viewport so provider grid isn't clipped mid-row
  await Emulation.setDeviceMetricsOverride({
    width: 1440,
    height: 1100,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await goto("http://localhost:3000/office");
  await Runtime.evaluate({
    expression: `(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Settings');
      if (btn) btn.click();
      return !!btn;
    })()`,
  });
  await sleep(1000);
  await hideOverlays();
  await Runtime.evaluate({ expression: "window.scrollTo(0,0)" });
  const { data: settingsData } = await Page.captureScreenshot({
    format: "png",
    fromSurface: true,
  });
  fs.writeFileSync(path.join(OUT, "product-settings-dark.png"), Buffer.from(settingsData, "base64"));
  console.log("ok 07-settings-providers.png");

  // Login (no workspace auth) — dark card on dark ground
  await Emulation.setDeviceMetricsOverride({
    width: 1440,
    height: 920,
    deviceScaleFactor: 2,
    mobile: false,
  });
  await Runtime.evaluate({
    expression: `(() => {
      try {
        localStorage.removeItem('agent-mesh-workspace-auth');
        localStorage.setItem('agent-mesh-theme', 'dark');
      } catch (e) {}
      return true;
    })()`,
  });
  await goto("http://localhost:3000/login");
  await sleep(500);
  const { data: loginData } = await Page.captureScreenshot({
    format: "png",
    fromSurface: true,
  });
  fs.writeFileSync(path.join(OUT, "product-login-dark.png"), Buffer.from(loginData, "base64"));
  console.log("ok 08-login.png");

  await client.close();
  chrome.kill("SIGKILL");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
