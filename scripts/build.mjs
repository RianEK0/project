import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const rootDir = resolve(process.cwd());
const distDir = join(rootDir, "dist");
const clientDir = join(distDir, "client");
const serverDir = join(distDir, "server");
const distOpenAiDir = join(distDir, ".openai");

rmSync(distDir, { recursive: true, force: true });
mkdirSync(clientDir, { recursive: true });
mkdirSync(serverDir, { recursive: true });
mkdirSync(distOpenAiDir, { recursive: true });

const clientEntries = ["index.html", "src"];

clientEntries.forEach((entry) => {
  const source = join(rootDir, entry);
  const destination = join(clientDir, entry);

  if (!existsSync(source)) {
    throw new Error(`Missing build input: ${entry}`);
  }

  cpSync(source, destination, { recursive: true });
});

cpSync(join(rootDir, ".openai", "hosting.json"), join(distOpenAiDir, "hosting.json"));
cpSync(join(rootDir, "server", "worker-entry.js"), join(serverDir, "index.js"));

console.log(`Static build ready at ${distDir}`);
