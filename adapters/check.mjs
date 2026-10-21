#!/usr/bin/env node
// Comprueba la integridad del harness: nombres, referencias entre skills y agentes,
// ficheros de plantilla citados y la cadena de fases SDD. Sale con 1 si hay errores.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const errors = []
const ok = []

const skills = readdirSync(join(ROOT, 'skills')).filter((d) => statSync(join(ROOT, 'skills', d)).isDirectory())
const agents = readdirSync(join(ROOT, 'agents')).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''))
const known = new Set([...skills, ...agents])

const frontmatter = (text) => text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
const field = (fm, key) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim()

// 1. Frontmatter: name coincide con carpeta o fichero, y hay description.
for (const s of skills) {
  const path = `skills/${s}/SKILL.md`
  if (!existsSync(join(ROOT, path))) { errors.push(`${path}: no existe`); continue }
  const fm = frontmatter(read(path))
  if (field(fm, 'name') !== s) errors.push(`${path}: name "${field(fm, 'name')}" ≠ carpeta "${s}"`)
  if (!field(fm, 'description')) errors.push(`${path}: sin description`)
}
for (const a of agents) {
  const fm = frontmatter(read(`agents/${a}.md`))
  if (field(fm, 'name') !== a) errors.push(`agents/${a}.md: name "${field(fm, 'name')}" ≠ fichero`)
  for (const k of ['description', 'access', 'shell', 'web']) if (!field(fm, k)) errors.push(`agents/${a}.md: falta ${k}`)
}

// 2. Referencias: todo `sdd-*` y todo "skill/agente `x`" apunta a algo que existe.
const files = [
  ...readdirSync(join(ROOT, 'core')).map((f) => `core/${f}`),
  ...skills.map((s) => `skills/${s}/SKILL.md`),
  ...agents.map((a) => `agents/${a}.md`),
]
const refPatterns = [
  /`(sdd-[a-z-]+)`/g,
  /(?:skills?|agentes?|agent)\s+`([a-z0-9-]+)`/gi,
  /`([a-z0-9-]+)`\s*\((?:skill|agente)/gi,
]
for (const f of files) {
  const text = read(f)
  for (const re of refPatterns) {
    for (const m of text.matchAll(re)) {
      if (!known.has(m[1])) errors.push(`${f}: referencia a "${m[1]}", que no es ninguna skill ni agente activo`)
    }
  }
}
// Nombres de agentes y skills citados entre backticks en core y skills deben existir si parecen uno de ellos.
const agentLike = /`([a-z]+-(?:reviewer|workflow|harness|first|orchestrate))`/g
const warnings = []
for (const f of files) {
  const text = read(f)
  const eccLiteral = text.includes('Basado en ECC')
  for (const m of text.matchAll(agentLike)) {
    if (known.has(m[1])) continue
    // Los ficheros basados en ECC citan piezas de ECC que no vienen aquí; su cabecera lo indica.
    if (eccLiteral) warnings.push(`${f}: cita "${m[1]}" (ECC, no instalado; documentado en la cabecera)`)
    else errors.push(`${f}: "${m[1]}" no existe`)
  }
}

// 3. Ficheros de plantilla citados dentro de cada skill existen en su carpeta.
for (const s of skills) {
  const text = read(`skills/${s}/SKILL.md`)
  for (const m of text.matchAll(/`((?:templates\/[\w./-]+)|[\w-]+-template\.md)`/g)) {
    if (!existsSync(join(ROOT, 'skills', s, m[1]))) errors.push(`skills/${s}: cita "${m[1]}" y no existe en la carpeta`)
  }
}

// 4. Cadena de fases: cada fase nombra la(s) siguiente(s).
const chain = {
  'sdd-init': ['sdd-spec'],
  'sdd-spec': ['sdd-plan'],
  'sdd-plan': ['sdd-spec', 'sdd-implement'],
  'sdd-implement': ['code-reviewer', 'sdd-validate', 'sdd-change'],
  'sdd-validate': ['sdd-implement', 'sdd-change'],
  'sdd-change': ['sdd-spec', 'sdd-implement'],
}
for (const [from, tos] of Object.entries(chain)) {
  const text = read(`skills/${from}/SKILL.md`)
  for (const to of tos) {
    if (!text.includes(`\`${to}\``)) errors.push(`cadena: ${from} no nombra a ${to}`)
    else ok.push(`${from} → ${to}`)
  }
}
// Los agentes nombran la skill que siguen.
for (const [agent, skill] of [['implementer', 'sdd-implement']]) {
  if (!read(`agents/${agent}.md`).includes(`\`${skill}\``)) errors.push(`cadena: agente ${agent} no nombra a ${skill}`)
  else ok.push(`${agent} → ${skill}`)
}

// 5. Repo público: nada que apunte a una máquina o a una persona concreta.
const leak = /(\/Users\/[a-z]|\/home\/[a-z]|~\/dev\/|ai-harness-docs|@gmail\.|@icloud\.)/i
for (const f of [...files, 'README.md', 'EMPIEZA-AQUI.md', 'plantillas/SKILL.md', 'plantillas/agente.md'].filter((x) => existsSync(join(ROOT, x)))) {
  const m = read(f).match(leak)
  if (m) errors.push(`${f}: contiene "${m[0]}", que no debe ir en un repo público`)
}

console.log(`skills: ${skills.length} · agentes: ${agents.length} · enlaces de la cadena comprobados: ${ok.length}`)
if (warnings.length) {
  console.log(`\n${new Set(warnings).size} avisos:`)
  for (const w of [...new Set(warnings)]) console.log(`  · ${w}`)
}
if (errors.length) {
  console.log(`\n${errors.length} errores:`)
  for (const e of errors) console.log(`  ✗ ${e}`)
  process.exit(1)
}
console.log('sin errores')
