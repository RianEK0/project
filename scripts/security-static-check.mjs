import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".next", "node_modules", "uploads", "security-reports"]);
const textExtensions = new Set([
  ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".json", ".md", ".sql", ".sh",
  ".yml", ".yaml", ".env", ".example", ".conf", ".xml", ".dockerfile"
]);
const findings = [];

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function isTextFile(filePath) {
  const basename = path.basename(filePath);
  return basename === "Dockerfile" || basename.endsWith(".Dockerfile") || textExtensions.has(path.extname(filePath).toLowerCase());
}

function report(filePath, rule) {
  findings.push(`${path.relative(root, filePath)}: ${rule}`);
}

const secretPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key tertanam"],
  [/\bAKIA[0-9A-Z]{16}\b/, "AWS access key tertanam"],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/, "GitHub token tertanam"],
  [/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/, "Slack token tertanam"],
  [/\bAIza[0-9A-Za-z_-]{35}\b/, "Google API key tertanam"],
  [/\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/, "API secret key tertanam"]
];

for (const filePath of walk(root)) {
  if (!isTextFile(filePath) || fs.statSync(filePath).size > 2 * 1024 * 1024) continue;
  const content = fs.readFileSync(filePath, "utf8");
  for (const [pattern, rule] of secretPatterns) {
    if (pattern.test(content)) report(filePath, rule);
  }

  if (/\.github[\\/]workflows[\\/].+\.ya?ml$/.test(filePath)) {
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*(?:-\s*)?uses:\s*([^\s#]+)(?:\s+#.*)?$/);
      if (!match || match[1].startsWith("./") || match[1].startsWith("docker://")) continue;
      const reference = match[1].split("@")[1] || "";
      if (!/^[a-f0-9]{40}$/i.test(reference)) report(filePath, `GitHub Action tidak dipin ke commit SHA: ${match[1]}`);
    }
  }

  if (/docker-compose.*\.ya?ml$/.test(path.basename(filePath))) {
    if (/\bprivileged:\s*true\b/.test(content)) report(filePath, "container privileged tidak diizinkan");
    if (/\bnetwork_mode:\s*host\b/.test(content)) report(filePath, "host network tidak diizinkan");
    if (/\bimage:\s*[^\s]+:(?:latest|edge)\b/.test(content)) report(filePath, "image container memakai tag bergerak");
  }
}

for (const dockerfile of ["deploy/docker/api.Dockerfile", "deploy/docker/web.Dockerfile"]) {
  const absolute = path.join(root, dockerfile);
  const content = fs.readFileSync(absolute, "utf8");
  if (!/^USER\s+(?!root\b)\S+/m.test(content)) report(absolute, "runtime image wajib memakai USER non-root");
}

if (findings.length) {
  console.error("SECURITY STATIC CHECK: GAGAL");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("SECURITY STATIC CHECK: LULUS (secret patterns, action pinning, dan baseline container). ");
