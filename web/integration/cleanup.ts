import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

export default function cleanup(): void {
  const api = resolve(process.cwd(), "../api");
  const python = resolve(api, process.platform === "win32"
    ? ".venv/Scripts/python.exe"
    : ".venv/bin/python");
  execFileSync(python, ["-m", "tests.server", "--cleanup"], {
    cwd: api,
    env: process.env,
    stdio: "inherit",
  });
}
