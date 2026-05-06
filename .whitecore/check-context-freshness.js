#!/usr/bin/env node
/**
 * check-context-freshness.js
 *
 * Script de WhiteCore OS — Context Dependency Map (CDM)
 *
 * Lee .whitecore/deps.yml, obtiene el diff del PR actual,
 * y verifica que todo documento de contexto afectado haya sido
 * modificado en el mismo PR.
 *
 * Uso:
 *   node .whitecore/check-context-freshness.js
 *
 * Requiere: Node.js >= 18
 * Sin dependencias externas.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DEPS_PATH = path.resolve(".whitecore", "deps.yml");

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] });
  } catch (err) {
    return err.stdout || "";
  }
}

function parseDeps(content) {
  const lines = content.split(/\r?\n/);
  const deps = [];
  let current = null;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // doc_key:
    const docMatch = line.match(/^(\S+):\s*$/);
    if (docMatch) {
      current = { doc: docMatch[1], triggers_on: [], owner: null, review_instruction: null };
      deps.push(current);
      continue;
    }

    if (!current) continue;

    if (trimmed.startsWith("- ")) {
      const item = trimmed.slice(2).trim();
      if (current._parsing === "triggers_on") {
        current.triggers_on.push(item);
      }
      continue;
    }

    const keyMatch = line.match(/^(\s*)(\w+):\s*(.*)$/);
    if (keyMatch) {
      const key = keyMatch[2];
      const value = keyMatch[3].trim();
      if (key === "triggers_on") {
        current._parsing = "triggers_on";
        if (value) current.triggers_on.push(value);
      } else if (key === "owner") {
        current.owner = value;
        current._parsing = null;
      } else if (key === "review_instruction") {
        current.review_instruction = value;
        current._parsing = "review_instruction";
      } else {
        current._parsing = null;
      }
      continue;
    }

    if (current._parsing === "review_instruction") {
      current.review_instruction += " " + trimmed;
    }
  }

  return deps;
}

function globToRegex(pattern) {
  let regex = pattern
    .replace(/\*\*/g, "<<<DOUBLESTAR>>>")
    .replace(/\*/g, "[^/]*")
    .replace(/<<<DOUBLESTAR>>>/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${regex}$`);
}

function matchesAny(file, patterns) {
  return patterns.some((p) => globToRegex(p).test(file));
}

function main() {
  if (!fs.existsSync(DEPS_PATH)) {
    console.error("❌ .whitecore/deps.yml no encontrado.");
    process.exit(1);
  }

  const depsContent = fs.readFileSync(DEPS_PATH, "utf-8");
  const deps = parseDeps(depsContent);

  if (deps.length === 0) {
    console.log("⚠️  .whitecore/deps.yml vacío o mal formado. No hay dependencias que verificar.");
    process.exit(0);
  }

  // Obtener archivos modificados en el PR
  // Intenta detectar base branch automáticamente
  const base = process.env.GITHUB_BASE_REF || "main";
  const diff = run(`git diff --name-only origin/${base}...HEAD || git diff --name-only ${base}...HEAD`);
  const changedFiles = diff.split(/\r?\n/).filter((f) => f.trim());

  if (changedFiles.length === 0) {
    console.log("ℹ️  No se detectaron archivos modificados en este PR.");
    process.exit(0);
  }

  const violations = [];

  for (const dep of deps) {
    const affected = changedFiles.some((f) => matchesAny(f, dep.triggers_on));
    if (!affected) continue;

    const docModified = changedFiles.includes(dep.doc);
    if (!docModified) {
      violations.push({
        doc: dep.doc,
        owner: dep.owner,
        instruction: dep.review_instruction,
        triggeredBy: changedFiles.filter((f) => matchesAny(f, dep.triggers_on)),
      });
    }
  }

  if (violations.length === 0) {
    console.log("✅ Contexto fresco. Todos los documentos afectados fueron revisados en este PR.");
    process.exit(0);
  }

  console.error("❌ CDM: Contexto potencialmente desactualizado.\n");
  for (const v of violations) {
    console.error(`📄 Documento afectado: ${v.doc}`);
    console.error(`   👤 Owner: ${v.owner || "sin definir"}`);
    console.error(`   📝 Instrucción: ${v.instruction || "Revisar documento por cambios en código relacionado."}`);
    console.error(`   🔍 Archivos que lo dispararon:`);
    for (const f of v.triggeredBy) {
      console.error(`      - ${f}`);
    }
    console.error("");
  }

  console.error("👉 Para corregir, modifica los documentos listados o documenta explícitamente por qué no requieren cambios.");
  process.exit(1);
}

main();
