#!/usr/bin/env node
// Genera dist/<host>/ a partir de core/, agents/ y skills/. No toca nada fuera del repo.
//   node adapters/build.mjs
// Los agentes se escriben una vez con un frontmatter neutral (access, shell, web, write_scope)
// y aquí se traducen al formato de cada host, porque Claude Code y OpenCode no se entienden:
//   Claude Code → name, description, tools (lista blanca de herramientas)
//   OpenCode    → description, mode: subagent, permission (edit, bash, webfetch, websearch)
// Las skills no se traducen: el formato SKILL.md es el mismo en los tres hosts.
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const write = (p, content) => { mkdirSync(dirname(join(DIST, p)), { recursive: true }); writeFileSync(join(DIST, p), content) }

function parseAgent(file) {
  const m = read(`agents/${file}`).match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`agents/${file}: falta frontmatter`)
  const meta = Object.fromEntries(m[1].split('\n').map((l) => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))
  for (const k of ['name', 'description', 'access', 'shell', 'web']) if (!(k in meta)) throw new Error(`agents/${file}: falta "${k}"`)
  return { meta, body: m[2] }
}

// Claude Code: `tools` es una lista blanca. No puede limitar Bash a ciertos comandos, así que "shell: none" = sin Bash.
function toClaude({ meta, body }) {
  const tools = ['Read', 'Grep', 'Glob']
  if (meta.access === 'write' || meta.write_scope) tools.push('Write', 'Edit')
  if (meta.shell === 'full') tools.push('Bash')
  if (meta.web === 'true') tools.push('WebFetch', 'WebSearch')
  return `---\nname: ${meta.name}\ndescription: ${meta.description}\ntools: ${tools.join(', ')}\n---\n${body}`
}

// OpenCode: permisos declarativos por agente. El nombre del agente es el nombre del fichero.
function toOpenCode({ meta, body }) {
  const edit = meta.access === 'write' || meta.write_scope
  const web = meta.web === 'true'
  return ['---', `description: ${meta.description}`, 'mode: subagent', 'permission:',
    `  edit: ${edit ? 'allow' : 'deny'}`, `  bash: ${meta.shell === 'full' ? 'allow' : 'deny'}`,
    `  webfetch: ${web ? 'allow' : 'deny'}`, `  websearch: ${web ? 'allow' : 'deny'}`, '---'].join('\n') + `\n${body}`
}

try { execFileSync(process.execPath, [join(ROOT, 'adapters/check.mjs')], { stdio: 'inherit' }) } catch { console.error('\nbuild cancelado: corrige los errores de check.mjs'); process.exit(1) }

rmSync(DIST, { recursive: true, force: true })
const warnings = []
const agents = readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md'))
for (const file of agents) {
  const a = parseAgent(file)
  write(`claude/agents/${file}`, toClaude(a))
  write(`opencode/agents/${file}`, toOpenCode(a))
  if (a.meta.write_scope) warnings.push(`${a.meta.name}: write_scope "${a.meta.write_scope}" es una regla del prompt; ningún host la impone.`)
  if (a.meta.access === 'read-only' && a.meta.shell === 'full') warnings.push(`${a.meta.name}: solo lectura con shell completo no es solo lectura real; lo sostiene el prompt.`)
}

// Instrucciones globales. Claude Code expande @imports; Codex no, así que recibe un único fichero concatenado.
write('claude/CLAUDE.md', ['core/AGENTS.md', 'core/PROTOCOL.md', 'core/SECURITY.md'].map((p) => `@${join(ROOT, p)}`).join('\n') + '\n')
const bundle = ['core/AGENTS.md', 'core/PROTOCOL.md', 'core/SECURITY.md'].map((p) => `<!-- ${p} -->\n\n${read(p)}`).join('\n\n---\n\n')
write('codex/AGENTS.md', bundle)
const LIMIT = 32 * 1024
if (Buffer.byteLength(bundle) > LIMIT) warnings.push(`codex/AGENTS.md pesa ${Buffer.byteLength(bundle)} bytes y Codex carga ${LIMIT} por defecto.`)

const skills = readdirSync(join(ROOT, 'skills')).filter((d) => existsSync(join(ROOT, 'skills', d, 'SKILL.md')))
console.log(`\ndist/ generado: ${agents.length} agentes × 2 formatos (Claude Code, OpenCode), ${skills.length} skills, instrucciones para Codex de ${Buffer.byteLength(bundle)} bytes.`)
if (warnings.length) { console.log('\nAvisos:'); for (const w of warnings) console.log(`  - ${w}`) }
