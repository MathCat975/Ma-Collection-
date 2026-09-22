import { defineConfig } from "@playwright/test";
import { randomUUID } from "node:crypto";

process.env.TEST_DATABASE_SCHEMA ??=
  "pytest_" + randomUUID().replaceAll("-", "");

const python =
  process.platform === "win32"
    ? "../api/.venv/Scripts/python.exe"
    : "../api/.venv/bin/python";

export default defineConfig({
  testDir: "./integration",
  workers: 1,
  globalTeardown: "./integration/cleanup.ts",
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 375, height: 812 },
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `"${python}" -m tests.server`,
      cwd: "../api",
      url: "http://127.0.0.1:8001/openapi.json",
      timeout: 120000,
      gracefulShutdown: { signal: "SIGINT", timeout: 10000 },
    },
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      env: { VITE_API_URL: "http://127.0.0.1:8001" },
    },
  ],
});
