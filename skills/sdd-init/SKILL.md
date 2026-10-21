---
name: sdd-init
description: Arranca un proyecto con spec-driven development. Crea la carpeta, su AGENTS.md a partir del briefing del usuario y scripts/verify.sh. Usar cuando el usuario pida crear o empezar un proyecto, o preparar para SDD uno que no tiene AGENTS.md.
---
<!-- Basado en hello-sdd de MoureDev (Apache-2.0), adaptado. Ver NOTICE. -->

# Arrancar un proyecto

Todo proyecto empieza por su `AGENTS.md`: lo primero que lee el agente en cada sesión. Lo define la persona, no el agente.

Plantillas: carpeta `templates/` de esta skill.

## Proceso

1. **Briefing.** Qué es, para quién, tecnologías, comandos, convenciones y límites (qué no tocar). Pregunta solo lo que falte, de una en una. Las funcionalidades no van aquí: van a la spec.
2. **Ruta.** La carpeta de proyectos del usuario. Evita carpetas sincronizadas en la nube (iCloud, OneDrive, Dropbox): corrompen repos. Si ya existe, pregunta.
3. **Propón el `AGENTS.md`** rellenando `templates/AGENTS.md`. Corto. Espera la aprobación.
4. **Crea**, con la aprobación: la carpeta con `git init`, `AGENTS.md`, `CLAUDE.md` (copia de `templates/CLAUDE.md`), `.gitignore` (de `templates/gitignore`), `docs/` y `scripts/verify.sh` (de `templates/scripts/verify.sh`, ejecutable).
5. **Siguiente fase:** `sdd-spec` con la primera funcionalidad.

## Qué no hace

- No escribe código ni instala dependencias.
- No inventa comandos: si aún no existen, la primera tarea los completa en `AGENTS.md` y en `verify.sh`. Mientras `verify.sh` no tenga pasos, devuelve 2 (bloqueado), nunca verde.
