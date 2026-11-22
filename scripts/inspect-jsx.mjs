import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const compiler = join(dirname(require.resolve("typescript/package.json")), "bin/tsc");
const source = fileURLToPath(new URL("../learning/jsx/expression.tsx", import.meta.url));
const outputDirectory = mkdtempSync(join(tmpdir(), "vdom-jsx-"));

try {
  execFileSync(process.execPath, [
    compiler,
    "--ignoreConfig",
    "--noCheck",
    "--jsx", "react",
    "--jsxFactory", "h",
    "--target", "ES2022",
    "--module", "ESNext",
    "--outDir", outputDirectory,
    source,
  ], { stdio: "inherit" });

  console.log("JSX source:\n");
  console.log(readFileSync(source, "utf8"));
  console.log("Generated JavaScript (inspection only):\n");
  console.log(readFileSync(join(outputDirectory, "expression.js"), "utf8"));
} finally {
  rmSync(outputDirectory, { recursive: true, force: true });
}
