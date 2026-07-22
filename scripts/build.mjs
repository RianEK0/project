import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const distDir = join(rootDir, "dist");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const entries = ["index.html", "src"];

entries.forEach((entry) => {
  const source = join(rootDir, entry);
  const destination = join(distDir, entry);

  if (!existsSync(source)) {
    throw new Error(`Missing build input: ${entry}`);
  }

  cpSync(source, destination, { recursive: true });
});

console.log(`Static build ready at ${distDir}`);
