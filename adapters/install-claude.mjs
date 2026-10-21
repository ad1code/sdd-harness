#!/usr/bin/env node
// Instala sdd-harness en Claude Code (terminal y extensión de VS Code) y permite retirarlo.
//   node adapters/install-claude.mjs --dry-run     enseña qué haría, sin tocar nada
//   node adapters/install-claude.mjs               instala
//   node adapters/install-claude.mjs --uninstall   retira exactamente lo que instaló
//
// Qué hace, todo dentro de ~/.claude (o de CLAUDE_CONFIG_DIR si está definido):
//   CLAUDE.md          → añade un bloque marcado con @imports a core/ (tu contenido se queda; el bloque se quita al desinstalar)
//   skills/<nombre>    → enlace a cada carpeta de skills/
//   agents/<nombre>.md → copia de dist/claude/agents, traducida por build.mjs
// Reglas y skills se actualizan con `git pull`. Los agentes son copias: tras cambiarlos, reinstala.
import { existsSync, lstatSync, readlinkSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, unlinkSync, readdirSync, statSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CC = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude')
const MANIFEST = join(CC, '.sdd-harness.json')
const CLAUDE_MD = join(CC, 'CLAUDE.md')
const START = '<!-- sdd-harness: inicio (bloque gestionado por adapters/install-claude.mjs) -->'
const END = '<!-- sdd-harness: fin -->'
const DRY = process.argv.includes('--dry-run')
const UNINSTALL = process.argv.includes('--uninstall')
const say = (s) => console.log(DRY ? `(dry-run) ${s}` : s)
const exists = (p) => { try { lstatSync(p); return true } catch { return false } }
const isLinkTo = (p, t) => { try { return lstatSync(p).isSymbolicLink() && readlinkSync(p) === t } catch { return false } }
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const stripBlock = (s) => s.replace(new RegExp(`\\n?${esc(START)}[\\s\\S]*?${esc(END)}\\n?`, 'g'), '\n').replace(/\n{3,}/g, '\n\n')

if (UNINSTALL) {
  if (!existsSync(MANIFEST)) { console.error('No hay instalación de sdd-harness en Claude Code que retirar.'); process.exit(1) }
  const m = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  for (const p of [...m.links, ...m.files]) if (exists(p)) { say(`quitar ${p}`); if (!DRY) unlinkSync(p) }
  if (existsSync(CLAUDE_MD)) {
    const cleaned = stripBlock(readFileSync(CLAUDE_MD, 'utf8'))
    say('quitar el bloque de sdd-harness de CLAUDE.md')
    if (!DRY) { if (cleaned.trim()) writeFileSync(CLAUDE_MD, cleaned.trimStart()); else unlinkSync(CLAUDE_MD) }
  }
  if (!DRY) unlinkSync(MANIFEST)
  console.log('sdd-harness retirado de Claude Code.')
  process.exit(0)
}

execFileSync(process.execPath, [join(ROOT, 'adapters/build.mjs')], { stdio: DRY ? 'ignore' : 'inherit' })
const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : { links: [], files: [] }
const owned = new Set([...prev.links, ...prev.files])
const manifest = { installedAt: new Date().toISOString(), source: ROOT, links: [], files: [] }
const conflicts = []

if (!DRY) for (const d of ['skills', 'agents']) mkdirSync(join(CC, d), { recursive: true })
for (const s of readdirSync(join(ROOT, 'skills')).filter((d) => statSync(join(ROOT, 'skills', d)).isDirectory())) {
  const target = join(ROOT, 'skills', s), path = join(CC, 'skills', s)
  if (isLinkTo(path, target)) { manifest.links.push(path); continue }
  if (exists(path)) { if (!owned.has(path)) { conflicts.push(path); continue } if (!DRY) unlinkSync(path) }
  say(`enlace skills/${s}`); if (!DRY) symlinkSync(target, path); manifest.links.push(path)
}
for (const a of readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md'))) {
  const dest = join(CC, 'agents', a)
  if (exists(dest) && !owned.has(dest)) { conflicts.push(dest); continue }
  say(`copiar agente ${a}`)
  if (!DRY) { if (exists(dest)) unlinkSync(dest); copyFileSync(join(ROOT, 'dist/claude/agents', a), dest) }
  manifest.files.push(dest)
}
if (conflicts.length) {
  console.error(`\nNo instalo: ya existen y no son de sdd-harness. Revísalos o renómbralos:\n${conflicts.map((c) => '  ' + c).join('\n')}`)
  process.exit(1)
}

const imports = ['core/AGENTS.md', 'core/PROTOCOL.md', 'core/SECURITY.md'].map((p) => `@${join(ROOT, p)}`).join('\n')
const current = existsSync(CLAUDE_MD) ? readFileSync(CLAUDE_MD, 'utf8') : ''
const next = `${stripBlock(current).trimEnd()}\n\n${START}\n${imports}\n${END}\n`.trimStart()
if (next !== current) {
  say(`${current ? 'añadir' : 'crear'} el bloque de sdd-harness en ${CLAUDE_MD.replace(homedir(), '~')}`)
  if (!DRY) { mkdirSync(CC, { recursive: true }); if (current && !existsSync(CLAUDE_MD + '.sdd-harness.bak')) writeFileSync(CLAUDE_MD + '.sdd-harness.bak', current); writeFileSync(CLAUDE_MD, next) }
}
if (!DRY) writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2))
console.log(`\nsdd-harness ${DRY ? 'se instalaría' : 'instalado'} en Claude Code: reglas en CLAUDE.md, ${manifest.links.length} skills y ${manifest.files.length} agentes. Abre una sesión nueva.`)
