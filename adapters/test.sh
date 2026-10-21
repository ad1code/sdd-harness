#!/usr/bin/env bash
# Prueba completa sin tocar tu configuración: valida, genera, e instala, reinstala y desinstala
# en carpetas temporales para OpenCode y para Claude Code.
#   bash adapters/test.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
fail() { echo "  [FALLO] $1"; exit 1; }
ok() { echo "  [OK]    $1"; }

echo "== Validar y generar"
node "$ROOT/adapters/check.mjs" >/dev/null || fail "check.mjs"
node "$ROOT/adapters/build.mjs" >/dev/null || fail "build.mjs"
ok "check y build"
NS=$(find "$ROOT/skills" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
NA=$(find "$ROOT/agents" -name '*.md' | wc -l | tr -d ' ')

echo "== OpenCode"
export OPENCODE_CONFIG_DIR="$T/opencode"; mkdir -p "$OPENCODE_CONFIG_DIR"
echo "mi AGENTS.md" > "$OPENCODE_CONFIG_DIR/AGENTS.md"
printf '{\n  "model": "proveedor/modelo"\n}\n' > "$OPENCODE_CONFIG_DIR/opencode.json"
node "$ROOT/adapters/install-opencode.mjs" >/dev/null && node "$ROOT/adapters/install-opencode.mjs" >/dev/null || fail "instalar dos veces"
[ "$(find "$OPENCODE_CONFIG_DIR/skills" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')" = "$NS" ] && ok "$NS skills" || fail "skills"
[ "$(find "$OPENCODE_CONFIG_DIR/agents" -name '*.md' | wc -l | tr -d ' ')" = "$NA" ] && ok "$NA agentes" || fail "agentes"
grep -q '^mode: subagent' "$OPENCODE_CONFIG_DIR/agents/code-reviewer.md" && ok "agentes en formato OpenCode" || fail "formato de agentes"
[ -z "$(find -L "$OPENCODE_CONFIG_DIR" -type l)" ] && ok "sin enlaces rotos" || fail "enlaces rotos"
node -e 'const c=require(process.argv[1]);if(c.model!=="proveedor/modelo"||c.instructions.length!==2)process.exit(1)' "$OPENCODE_CONFIG_DIR/opencode.json" && ok "config previa conservada" || fail "config"
node "$ROOT/adapters/install-opencode.mjs" --uninstall >/dev/null || fail "desinstalar"
[ "$(cat "$OPENCODE_CONFIG_DIR/AGENTS.md")" = "mi AGENTS.md" ] && ok "AGENTS.md previo restaurado" || fail "AGENTS.md"
[ -z "$(find "$OPENCODE_CONFIG_DIR/skills" "$OPENCODE_CONFIG_DIR/agents" -mindepth 1)" ] && ok "desinstalado limpio" || fail "restos"

echo "== Claude Code"
export CLAUDE_CONFIG_DIR="$T/claude"; mkdir -p "$CLAUDE_CONFIG_DIR"
printf '# Mis reglas\n' > "$CLAUDE_CONFIG_DIR/CLAUDE.md"
node "$ROOT/adapters/install-claude.mjs" >/dev/null && node "$ROOT/adapters/install-claude.mjs" >/dev/null || fail "instalar dos veces"
[ "$(grep -c 'sdd-harness: inicio' "$CLAUDE_CONFIG_DIR/CLAUDE.md")" = "1" ] && ok "un solo bloque en CLAUDE.md" || fail "bloque duplicado"
grep -q '^# Mis reglas' "$CLAUDE_CONFIG_DIR/CLAUDE.md" && ok "CLAUDE.md previo conservado" || fail "CLAUDE.md"
grep -q '^tools: ' "$CLAUDE_CONFIG_DIR/agents/code-reviewer.md" && ok "agentes en formato Claude Code" || fail "formato de agentes"
[ "$(find "$CLAUDE_CONFIG_DIR/skills" -mindepth 1 -maxdepth 1 | wc -l | tr -d ' ')" = "$NS" ] && ok "$NS skills" || fail "skills"
[ -z "$(find -L "$CLAUDE_CONFIG_DIR" -type l)" ] && ok "sin enlaces rotos" || fail "enlaces rotos"
node "$ROOT/adapters/install-claude.mjs" --uninstall >/dev/null || fail "desinstalar"
[ "$(cat "$CLAUDE_CONFIG_DIR/CLAUDE.md")" = "# Mis reglas" ] && ok "CLAUDE.md como estaba" || fail "CLAUDE.md tras desinstalar"
[ -z "$(find "$CLAUDE_CONFIG_DIR/skills" "$CLAUDE_CONFIG_DIR/agents" -mindepth 1)" ] && ok "desinstalado limpio" || fail "restos"

echo; echo "Todo en verde."
