import { execFileSync } from "child_process";
import path from "path";

async function waitForServerStable(url: string) {
  // Wait until 5 consecutive successful responses (ensures hot-reload has settled)
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.status < 500) {
        streak++;
        if (streak >= 5) return;
      } else {
        streak = 0;
      }
    } catch {
      streak = 0;
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.warn(`[e2e setup] server did not stabilize after 60s, proceeding anyway`);
}

async function globalSetup() {
  const rootDir = path.resolve(__dirname, "..");
  const script = path.resolve(rootDir, "scripts/cleanup-e2e.ts");

  // Wait for dev server hot-reload to fully settle before running tests
  console.log("[e2e setup] waiting for server to stabilize...");
  await waitForServerStable("http://localhost:3003/login");
  console.log("[e2e setup] server stable");

  try {
    execFileSync("npx", ["tsx", "--env-file=.env", script], { stdio: "inherit", cwd: rootDir });
  } catch {
    console.warn("[e2e setup] cleanup script failed (non-fatal)");
  }

  // Brief wait after DB cleanup for server to remain stable
  await new Promise(r => setTimeout(r, 500));
}

export default globalSetup;
