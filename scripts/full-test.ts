import { summary } from "./test-helpers";

async function main() {
  console.log("SILA Full Automated Test\n");

  try {
    await fetch("http://localhost:3003/login", { signal: AbortSignal.timeout(3000) });
  } catch {
    console.error("ERROR: Dev server not running on http://localhost:3003");
    console.error("Start with: npm run dev");
    process.exit(1);
  }

  await import("./crud-test").then((m) => m.runCrudTests());
  await import("./workflow-test").then((m) => m.runWorkflowTests());
  await import("./output-test").then((m) => m.runOutputTests());
  await import("./edge-test").then((m) => m.runEdgeTests());

  summary();
}

main();
