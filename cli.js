#!/usr/bin/env node
import fs from "fs";
import path from "path";
import url from "url";

const cwd = process.cwd();
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG = (m) => console.log(`\x1b[36m[nim-react-toastify]\x1b[0m ${m}`);
const WARN = (m) => console.warn(`\x1b[33m[warn]\x1b[0m ${m}`);
const ERR = (m) => console.error(`\x1b[31m[error]\x1b[0m ${m}`);

(async function run() {
  try {
    LOG("Detecting stack & root files...");

    const pkg = readJSONSafe(path.join(cwd, "package.json")) || {};
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
    };

    const isNext = "next" in deps;
    const isRN =
      "react-native" in deps ||
      fs.existsSync(path.join(cwd, "app.json")) ||
      fs.existsSync(path.join(cwd, "expo.json")) ||
      fs.existsSync(path.join(cwd, "expo.config.js"));
    const isReact = !isNext && !isRN; // default fallthrough

    const stack = isNext ? "next" : isRN ? "react-native" : "react";
    LOG(`Detected stack: \x1b[1m${stack}\x1b[0m`);

    // candidate root files in priority order
    const candidates = [
      // Next.js App Router
      "app/layout.tsx",
      "app/layout.jsx",
      "src/app/layout.tsx",
      "src/app/layout.jsx",
      // Expo Router
      "app/_layout.tsx",
      "app/_layout.jsx",
      // Traditional roots
      "App.tsx",
      "App.jsx",
      "src/App.tsx",
      "src/App.jsx",
      "App.js",
      "src/App.js",
      "index.tsx",
      "index.jsx",
      "src/index.tsx",
      "src/index.jsx",
    ];

    const rootPath = candidates
      .map((p) => path.join(cwd, p))
      .find(fs.existsSync);
    if (!rootPath) {
      ERR(
        "Could not locate a root file. Looked for common candidates like App.tsx, app/layout.tsx, etc."
      );
      process.exit(1);
    }
    LOG(`Root file: ${rel(rootPath)}`);

    const usesTS = /\.tsx?$/.test(rootPath);

    // 1) Ensure a provider template exists in project
    const targetDir = path.join(cwd, "src", "nim-react-toastify");
    fs.mkdirSync(targetDir, { recursive: true });

    const providerName = "NotificationsProvider";
    const providerFile = path.join(
      targetDir,
      `${providerName}.${usesTS ? "tsx" : "jsx"}`
    );

    if (!fs.existsSync(providerFile)) {
      const template =
        stack === "react-native"
          ? readTemplate("templates/provider.rn.tsx")
          : readTemplate("templates/provider.web.tsx");
      fs.writeFileSync(providerFile, template, "utf8");
      LOG(`Created ${rel(providerFile)}`);
    } else {
      WARN(
        `Provider already exists at ${rel(
          providerFile
        )} — keeping your version.`
      );
    }

    // 2) Inject import & wrap root JSX
    let code = fs.readFileSync(rootPath, "utf8");

    const importLine = `import { ${providerName} } from "${posixPath(
      path.relative(path.dirname(rootPath), providerFile)
    )
      .replace(/^\.\./, (m) => m)
      .replace(/\\/g, "/")
      .replace(/\.tsx?$/, "")
      .replace(/\.jsx?$/, "")}";`;

    if (
      !code.includes(importLine) &&
      !code.match(new RegExp(`import\\s*\\{\\s*${providerName}\\s*\\}`))
    ) {
      // insert after first import
      const importBlock = code.match(/(^|\n)import .*;?/g);
      if (importBlock) {
        const lastImport = importBlock[importBlock.length - 1];
        const idx = code.lastIndexOf(lastImport) + lastImport.length;
        code = code.slice(0, idx) + "\n" + importLine + "\n" + code.slice(idx);
      } else {
        code = importLine + "\n" + code;
      }
      LOG("Inserted provider import.");
    } else {
      WARN("Import seems to exist already — skipping.");
    }

    // Try to wrap return (...) with <NotificationsProvider>...</NotificationsProvider>
    const before = code;
    code = wrapJSXReturn(code, providerName);

    if (code === before) {
      WARN(
        "Could not auto-wrap JSX safely. Adding a top-level wrapper fallback..."
      );
      // Fallback for Next.js App Router layout files: wrap {children}
      if (
        stack === "next" &&
        /export default function/i.test(code) &&
        code.includes("{ children }")
      ) {
        code = code
          .replace(
            /return\s*\(\s*<html([^>]*)>\s*<body([^>]*)>/i,
            (m, a, b) => `return (<html${a}><body${b}><${providerName}>`
          )
          .replace(
            /<\/body>\s*<\/html>\s*\)\s*;?\s*$/i,
            `</${providerName}></body></html>)`
          );
      } else if (/return\s*\(/.test(code)) {
        // very generic: put opening right after "return (" and closing before last ");"
        code = code.replace(/return\s*\(\s*/, (m) => `${m}<${providerName}>`);
        const lastParen = code.lastIndexOf(");");
        if (lastParen !== -1) {
          code =
            code.slice(0, lastParen) +
            `</${providerName}>` +
            code.slice(lastParen);
        }
      }
    }

    fs.writeFileSync(rootPath, code, "utf8");
    LOG(`Updated ${rel(rootPath)} — provider wired.`);

    LOG("Done ✅  Try showing a toast from any component:");
    if (stack === "react-native") {
      LOG(`  import { useNotifications } from "${relNoExt(providerFile)}";`);
      LOG(`  const { show } = useNotifications();`);
      LOG(`  show({ type: "success", message: "Hello from RN!" });`);
    } else {
      LOG(`  import { useNotifications } from "${relNoExt(providerFile)}";`);
      LOG(`  const { show } = useNotifications();`);
      LOG(`  show({ type: "success", message: "Hello from Web!" });`);
    }
  } catch (e) {
    ERR(e.stack || e.message || String(e));
    process.exit(1);
  }
})();

function readJSONSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}
function readTemplate(relPath) {
  const abs = path.join(__dirname, relPath);
  return fs.readFileSync(abs, "utf8");
}
function rel(p) {
  return path.relative(cwd, p) || ".";
}
function relNoExt(p) {
  return rel(p).replace(/\.(t|j)sx?$/, "");
}
function posixPath(p) {
  return p.split(path.sep).join("/");
}

/** Try to wrap the first component return(...) with <Provider> */
function wrapJSXReturn(code, Provider) {
  // Handle `export default function ...` or `function ...` or const ...=()=> return(...)
  // Find the first "return (" that has JSX right after it.
  const re = /return\s*\(\s*<[^>]/m;
  const m = code.match(re);
  if (!m) return code;
  const start = m.index + m[0].length - 1; // position at '<'
  let depth = 0,
    i = start,
    endIdx = -1;
  while (i < code.length) {
    const ch = code[i];
    if (ch === "(") depth++;
    if (ch === ")") {
      if (depth === 0) {
        endIdx = i;
        break;
      }
      depth--;
    }
    i++;
  }
  if (endIdx === -1) return code;

  const before = code.slice(0, start);
  const inside = code.slice(start, endIdx);
  const after = code.slice(endIdx);

  // avoid double-wrap
  if (/\<\s*${Provider}\b/.test(inside)) return code;

  const wrapped = `<${Provider}>${inside}</${Provider}>`;
  return before + wrapped + after;
}
