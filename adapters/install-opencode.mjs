#!/usr/bin/env node
// Instala sdd-harness en OpenCode y permite retirarlo.
//   node adapters/install-opencode.mjs --dry-run     enseña qué haría, sin tocar nada
//   node adapters/install-opencode.mjs               instala
//   node adapters/install-opencode.mjs --uninstall   retira exactamente lo que instaló
//
// Qué hace, todo dentro de ~/.config/opencode:
//   AGENTS.md          → enlace a core/AGENTS.md (si ya tenías uno, se guarda una copia y se restaura al desinstalar)
//   opencode.json(c)   → añade core/PROTOCOL.md y core/SECURITY.md a "instructions"; el resto de tu config no se toca
//   skills/<nombre>    → enlace a cada carpeta de skills/
//   agents/<nombre>.md → copia de dist/opencode/agents, traducida por build.mjs
// Reglas y skills son enlaces: un `git pull` las actualiza. Los agentes son copias: tras cambiarlos, reinstala.
import { existsSync, lstatSync, readlinkSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, unlinkSync, renameSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OC = process.env.OPENCODE_CONFIG_DIR || join(homedir(), '.config/opencode')
const MANIFEST = join(OC, '.sdd-harness.json')
const AGENTS_SRC = join(ROOT, 'dist/opencode/agents')
const DRY = process.argv.includes('--dry-run')
const UNINSTALL = process.argv.includes('--uninstall')
const INSTRUCTIONS = [join(ROOT, 'core/PROTOCOL.md'), join(ROOT, 'core/SECURITY.md')]
const say = (s) => console.log(DRY ? `(dry-run) ${s}` : s)
const exists = (p) => { try { lstatSync(p); return true } catch { return false } }
const isLinkTo = (p, t) => { try { return lstatSync(p).isSymbolicLink() && readlinkSync(p) === t } catch { return false } }
const configPath = ['opencode.jsonc', 'opencode.json'].map((f) => join(OC, f)).find(existsSync) ?? join(OC, 'opencode.json')

function readConfig() {
  if (!existsSync(configPath)) return {}
  const raw = readFileSync(configPath, 'utf8')
  const stripped = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'])\/\/.*$/gm, '$1').replace(/,(\s*[}\]])/g, '$1')
  try { return JSON.parse(stripped) } catch (e) { console.error(`No puedo leer ${configPath}: ${e.message}. No toco nada.`); process.exit(1) }
}
function writeConfig(cfg) {
  if (DRY) return say(`escribiría ${configPath}`)
  if (existsSync(configPath) && !existsSync(configPath + '.sdd-harness.bak')) writeFileSync(configPath + '.sdd-harness.bak', readFileSync(configPath))
  writeFileSync(configPath, JSON.stringify(cfg, null, 2) + '\n')
}

if (UNINSTALL) {
  if (!existsSync(MANIFEST)) { console.error('No hay instalación de sdd-harness que retirar.'); process.exit(1) }
  const m = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  for (const p of [...m.links, ...(m.files ?? [])]) if (exists(p)) { say(`quitar ${p}`); if (!DRY) unlinkSync(p) }
  if (m.agentsMdBackup && existsSync(m.agentsMdBackup)) { say(`restaurar tu AGENTS.md anterior`); if (!DRY) renameSync(m.agentsMdBackup, join(OC, 'AGENTS.md')) }
  const cfg = readConfig()
  if (Array.isArray(cfg.instructions)) {
    cfg.instructions = cfg.instructions.filter((i) => !INSTRUCTIONS.includes(i))
    if (!cfg.instructions.length) delete cfg.instructions
    writeConfig(cfg)
  }
  if (!DRY) unlinkSync(MANIFEST)
  console.log('sdd-harness retirado.')
  process.exit(0)
}

execFileSync(process.execPath, [join(ROOT, 'adapters/build.mjs')], { stdio: DRY ? 'ignore' : 'inherit' })
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { links: [], files: [], agentsMdBackup: null }
const owned = new Set([...prev.links, ...(prev.files ?? [])])
const manifest = { installedAt: new Date().toISOString(), source: ROOT, links: [], files: [], agentsMdBackup: prev.agentsMdBackup }
const conflicts = []
function link(target, path) {
  if (isLinkTo(path, target)) return manifest.links.push(path)
  if (exists(path)) { if (!owned.has(path)) return conflicts.push(path); if (!DRY) unlinkSync(path) }
  say(`enlace ${path.replace(homedir(), '~')} → ${target.replace(homedir(), '~')}`)
  if (!DRY) symlinkSync(target, path)
  manifest.links.push(path)
}

if (!DRY) for (const d of ['skills', 'agents']) mkdirSync(join(OC, d), { recursive: true })

const agentsMd = join(OC, 'AGENTS.md')
if (exists(agentsMd) && !isLinkTo(agentsMd, join(ROOT, 'core/AGENTS.md')) && !owned.has(agentsMd)) {
  manifest.agentsMdBackup = join(OC, 'AGENTS.md.antes-de-sdd-harness')
  say(`guardar tu AGENTS.md actual en ${manifest.agentsMdBackup.replace(homedir(), '~')}`)
  if (!DRY) renameSync(agentsMd, manifest.agentsMdBackup)
  else owned.add(agentsMd) // en seco no se mueve: que no cuente como conflicto
}
link(join(ROOT, 'core/AGENTS.md'), agentsMd)
for (const s of readdirSync(join(ROOT, 'skills')).filter((d) => statSync(join(ROOT, 'skills', d)).isDirectory())) link(join(ROOT, 'skills', s), join(OC, 'skills', s))
for (const a of readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md'))) {
  const dest = join(OC, 'agents', a)
  if (exists(dest) && !owned.has(dest)) { conflicts.push(dest); continue }
  say(`copiar agente ${a}`)
  if (!DRY) { if (exists(dest)) unlinkSync(dest); copyFileSync(join(AGENTS_SRC, a), dest) }
  manifest.files.push(dest)
}

if (conflicts.length) {
  console.error(`\nNo instalo: ya existen y no son de sdd-harness. Revísalos o renómbralos:\n${conflicts.map((c) => '  ' + c).join('\n')}`)
  process.exit(1)
}

const cfg = readConfig()
const before = JSON.stringify(cfg.instructions ?? [])
cfg.instructions = [...new Set([...(cfg.instructions ?? []), ...INSTRUCTIONS])]
if (!cfg.$schema) cfg.$schema = 'https://opencode.ai/config.json'
if (JSON.stringify(cfg.instructions) !== before) { say(`añadir PROTOCOL.md y SECURITY.md a "instructions" en ${configPath.replace(homedir(), '~')}`); writeConfig(cfg) }

if (!DRY) { mkdirSync(dirname(MANIFEST), { recursive: true }); writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2)) }
console.log(`\nsdd-harness ${DRY ? 'se instalaría' : 'instalado'} en OpenCode: AGENTS.md, ${manifest.links.length - 1} skills y ${manifest.files.length} agentes. Abre una sesión nueva.`)
