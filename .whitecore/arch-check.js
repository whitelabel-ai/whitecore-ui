#!/usr/bin/env node
/**
 * arch-check.js
 *
 * WhiteCore OS — Architecture Check (Hardness Medium)
 *
 * Script agnóstico a stack que detecta violaciones estructurales
 * de código: funciones largas, muchos parámetros, archivos duplicados,
 * strings mágicos duplicados, e imports circulares (JS/TS).
 *
 * Uso:
 *   node .whitecore/arch-check.js
 *
 * Configuración en .whitecore/arch-check.config.yml
 * Requiere: Node.js >= 18
 * Sin dependencias externas.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const CONFIG_PATH = path.resolve(".whitecore", "arch-check.config.yml");

function parseYaml(content) {
  const lines = content.split(/\r?\n/);
  const result = {};
  let currentKey = null;
  let currentSubKey = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const topKey = line.match(/^(\w+):\s*$/);
    if (topKey) {
      currentKey = topKey[1];
      // Peek next non-empty line to decide if it's a list or map
      let j = i + 1;
      while (j < lines.length && (!lines[j].trim() || lines[j].trim().startsWith("#"))) j++;
      const next = lines[j] || "";
      if (/^\s+-\s+/.test(next)) {
        result[currentKey] = [];
      } else {
        result[currentKey] = {};
      }
      currentSubKey = null;
      continue;
    }

    if (!currentKey) continue;

    const subKey = line.match(/^(\s+)(\w+):\s*(.*)$/);
    if (subKey) {
      const key = subKey[2];
      const val = subKey[3].trim();
      if (val === "") {
        result[currentKey][key] = [];
        currentSubKey = key;
      } else {
        const num = Number(val);
        result[currentKey][key] = Number.isNaN(num) ? val : num;
        currentSubKey = null;
      }
      continue;
    }

    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem) {
      const val = listItem[1].trim();
      if (Array.isArray(result[currentKey])) {
        result[currentKey].push(val);
      } else if (currentSubKey && Array.isArray(result[currentKey][currentSubKey])) {
        result[currentKey][currentSubKey].push(val);
      }
    }
  }

  return result;
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("❌ .whitecore/arch-check.config.yml no encontrado.");
    process.exit(1);
  }
  return parseYaml(fs.readFileSync(CONFIG_PATH, "utf-8"));
}

function shouldIgnore(filePath, patterns) {
  for (const p of patterns) {
    const regex = new RegExp(
      "^" +
        p
          .replace(/\*\*/g, "<<<DS>>>")
          .replace(/\*/g, "[^/]*")
          .replace(/<<<DS>>>/g, ".*")
          .replace(/\?/g, ".") +
        "$"
    );
    if (regex.test(filePath)) return true;
  }
  return false;
}

function getFiles(dir, extensions, ignore, base = "") {
  const files = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    if (shouldIgnore(rel, ignore)) continue;

    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      files.push(...getFiles(full, extensions, ignore, rel));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      files.push(rel);
    }
  }
  return files;
}

function hash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function detectLongFunctions(content, ext, threshold) {
  const issues = [];
  const lines = content.split(/\r?\n/);

  if ([".js", ".ts", ".jsx", ".tsx"].includes(ext)) {
    // Detectar funciones: function name(...) { ... }, const name = (...) => { ... }, method(...) { ... }
    const funcRegex = /(?:function\s+\w+|\w+\s*:\s*function|\w+\s*=\s*(?:async\s*)?\(|\w+\s*\(.*\)\s*\{)/g;
    let m;
    while ((m = funcRegex.exec(content)) !== null) {
      const startLine = content.substring(0, m.index).split(/\r?\n/).length;
      // Encontrar cierre de llave balanceado desde m.index
      let braceIdx = content.indexOf("{", m.index);
      if (braceIdx === -1) continue;
      let depth = 0;
      let endIdx = braceIdx;
      for (let i = braceIdx; i < content.length; i++) {
        if (content[i] === "{") depth++;
        else if (content[i] === "}") {
          depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }
      }
      const block = content.substring(braceIdx, endIdx + 1);
      const blockLines = block.split(/\r?\n/).length;
      if (blockLines > threshold) {
        issues.push({ line: startLine, message: `Función de ${blockLines} líneas (máx ${threshold})` });
      }
    }
  } else if (ext === ".py") {
    const defRegex = /^def\s+\w+\s*\(/gm;
    let m;
    while ((m = defRegex.exec(content)) !== null) {
      const startLine = content.substring(0, m.index).split(/\r?\n/).length;
      const nextDef = content.search(new RegExp(`^(def\\s+|class\\s+)`, "gm"));
      const endIdx = nextDef > m.index ? nextDef : content.length;
      const block = content.substring(m.index, endIdx);
      const blockLines = block.split(/\r?\n/).length;
      if (blockLines > threshold) {
        issues.push({ line: startLine, message: `Función de ${blockLines} líneas (máx ${threshold})` });
      }
    }
  } else if (ext === ".go") {
    const funcRegex = /^func\s+/gm;
    let m;
    while ((m = funcRegex.exec(content)) !== null) {
      const startLine = content.substring(0, m.index).split(/\r?\n/).length;
      const nextFunc = content.indexOf("\nfunc ", m.index + 1);
      const endIdx = nextFunc > m.index ? nextFunc : content.length;
      const block = content.substring(m.index, endIdx);
      const blockLines = block.split(/\r?\n/).length;
      if (blockLines > threshold) {
        issues.push({ line: startLine, message: `Función de ${blockLines} líneas (máx ${threshold})` });
      }
    }
  } else {
    // Genérico por bloques indentados
    let inFunc = false;
    let funcStart = 0;
    let funcLine = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(function|def|func|public|private|static|\w+\s+\w+\s*\()/.test(line)) {
        if (inFunc && i - funcLine > threshold) {
          issues.push({ line: funcLine + 1, message: `Bloque de ${i - funcLine} líneas (máx ${threshold})` });
        }
        inFunc = true;
        funcStart = i;
        funcLine = i;
      }
      if (inFunc && line.trim() === "}") {
        if (i - funcLine > threshold) {
          issues.push({ line: funcLine + 1, message: `Bloque de ${i - funcLine} líneas (máx ${threshold})` });
        }
        inFunc = false;
      }
    }
  }
  return issues;
}

function detectManyParams(content, ext, threshold) {
  const issues = [];
  if ([".js", ".ts", ".jsx", ".tsx"].includes(ext)) {
    const regex = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\(|\w+\s*\()\s*([^)]*)\)/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
      const params = m[1].split(",").filter((p) => p.trim());
      if (params.length > threshold) {
        const line = content.substring(0, m.index).split(/\r?\n/).length;
        issues.push({ line, message: `${params.length} parámetros (máx ${threshold})` });
      }
    }
  } else if (ext === ".py") {
    const regex = /^def\s+\w+\s*\(([^)]*)\)/gm;
    let m;
    while ((m = regex.exec(content)) !== null) {
      const params = m[1].split(",").filter((p) => p.trim());
      if (params.length > threshold) {
        const line = content.substring(0, m.index).split(/\r?\n/).length;
        issues.push({ line, message: `${params.length} parámetros (máx ${threshold})` });
      }
    }
  } else if (ext === ".go") {
    const regex = /^func\s+\w+\s*\(([^)]*)\)/gm;
    let m;
    while ((m = regex.exec(content)) !== null) {
      const params = m[1].split(",").filter((p) => p.trim());
      if (params.length > threshold) {
        const line = content.substring(0, m.index).split(/\r?\n/).length;
        issues.push({ line, message: `${params.length} parámetros (máx ${threshold})` });
      }
    }
  } else {
    const regex = /\w+\s*\(([^)]*)\)/g;
    let m;
    while ((m = regex.exec(content)) !== null) {
      const params = m[1].split(",").filter((p) => p.trim());
      if (params.length > threshold) {
        const line = content.substring(0, m.index).split(/\r?\n/).length;
        issues.push({ line, message: `${params.length} parámetros (máx ${threshold})` });
      }
    }
  }
  return issues;
}

function detectCircularImports(files) {
  const issues = [];
  const graph = {};
  const jsExts = [".js", ".ts", ".jsx", ".tsx"];
  const jsFiles = files.filter((f) => jsExts.some((e) => f.endsWith(e)));

  for (const f of jsFiles) {
    const content = fs.readFileSync(f, "utf-8");
    const imports = [];
    const importRegex = /(?:import\s+.*?\s+from\s+|require\s*\(\s*)['"]([^'"]+)['"]/g;
    let m;
    while ((m = importRegex.exec(content)) !== null) {
      let target = m[1];
      if (target.startsWith(".") || target.startsWith("/")) {
        // Resolver relativo
        const dir = path.dirname(f);
        const resolved = path.resolve(dir, target);
        // Intentar con extensiones
        for (const ext of jsExts.concat("")) {
          const cand = resolved + ext;
          if (fs.existsSync(cand)) {
            imports.push(path.relative(process.cwd(), cand).replace(/\\/g, "/"));
            break;
          }
          const candIndex = path.join(resolved, "index" + ext);
          if (fs.existsSync(candIndex)) {
            imports.push(path.relative(process.cwd(), candIndex).replace(/\\/g, "/"));
            break;
          }
        }
      }
    }
    graph[f.replace(/\\/g, "/")] = imports;
  }

  function dfs(node, visited, stack) {
    visited.add(node);
    stack.add(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        const cycle = dfs(neighbor, visited, stack);
        if (cycle) return cycle;
      } else if (stack.has(neighbor)) {
        return [neighbor, node];
      }
    }
    stack.delete(node);
    return null;
  }

  const visited = new Set();
  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      const cycle = dfs(node, visited, new Set());
      if (cycle) {
        issues.push({ line: 1, message: `Import circular detectado entre ${cycle[0]} y ${cycle[1]}` });
        break; // Reportar uno por ejecución es suficiente para fallar CI
      }
    }
  }
  return issues;
}

function main() {
  const config = loadConfig();
  const thresholds = config.thresholds || {};
  const ignore = config.ignore || [];
  const extensions = (config.languages && config.languages.extensions) || [".js", ".ts"];

  const maxFuncLines = thresholds.max_function_lines || 40;
  const maxParams = thresholds.max_parameters || 4;
  const minStringLen = thresholds.min_duplicate_string_length || 30;
  const minStringOcc = thresholds.min_duplicate_string_occurrences || 3;

  const files = getFiles(".", extensions, ignore);

  const violations = [];
  const fileHashes = {};
  const stringOccurrences = {};

  for (const f of files) {
    const content = fs.readFileSync(f, "utf-8");
    const ext = path.extname(f);

    // Duplicados de archivo
    const h = hash(content);
    if (!fileHashes[h]) fileHashes[h] = [];
    fileHashes[h].push(f);

    // Funciones largas
    const longFuncs = detectLongFunctions(content, ext, maxFuncLines);
    for (const issue of longFuncs) {
      violations.push({ file: f, line: issue.line, type: "FUNC_TOO_LONG", message: issue.message });
    }

    // Muchos parámetros
    const manyParams = detectManyParams(content, ext, maxParams);
    for (const issue of manyParams) {
      violations.push({ file: f, line: issue.line, type: "TOO_MANY_PARAMS", message: issue.message });
    }

    // Strings mágicos duplicados
    const stringRegex = /["']([^"']{30,})["']/g;
    let m;
    while ((m = stringRegex.exec(content)) !== null) {
      const s = m[1];
      if (!stringOccurrences[s]) stringOccurrences[s] = [];
      stringOccurrences[s].push(f);
    }
  }

  // Reportar archivos duplicados
  for (const [h, paths] of Object.entries(fileHashes)) {
    if (paths.length > 1) {
      violations.push({ file: paths[0], line: 1, type: "DUPLICATE_FILE", message: `Archivo duplicado en: ${paths.join(", ")}` });
    }
  }

  // Reportar strings duplicados
  for (const [s, paths] of Object.entries(stringOccurrences)) {
    const uniquePaths = [...new Set(paths)];
    if (uniquePaths.length >= minStringOcc) {
      violations.push({
        file: uniquePaths[0],
        line: 1,
        type: "DUPLICATE_STRING",
        message: `String mágico duplicado (${uniquePaths.length} archivos): "${s.substring(0, 40)}${s.length > 40 ? "..." : ""}"`,
      });
    }
  }

  // Imports circulares
  const circular = detectCircularImports(files);
  violations.push(...circular.map((c) => ({ file: c.line === 1 ? "multiple" : "", line: c.line, type: "CIRCULAR_IMPORT", message: c.message })));

  if (violations.length === 0) {
    console.log("✅ arch-check: No se detectaron violaciones estructurales.");
    process.exit(0);
  }

  console.error("❌ arch-check: Violaciones estructurales detectadas.\n");
  for (const v of violations) {
    const loc = v.file && v.file !== "multiple" ? `${v.file}:${v.line}` : "global";
    console.error(`[${v.type}] ${loc} — ${v.message}`);
  }

  console.error("\n👉 Revisa docs/global/rules-base.md para entender los principios que sustentan estas reglas.");
  process.exit(1);
}

main();
