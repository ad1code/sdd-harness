# Adaptadores por host

El contenido se escribe una vez (`core/`, `skills/`, `agents/`) y cada host lo recibe en su formato.

| Orden | Qué hace |
|---|---|
| `node adapters/check.mjs` | Valida nombres, referencias entre skills y agentes, plantillas citadas, la cadena de fases, y que no haya datos personales |
| `node adapters/build.mjs` | Genera `dist/` con los agentes traducidos a cada host. No escribe fuera del repo |
| `node adapters/install-opencode.mjs` | Instala en OpenCode. `--dry-run` para ver el plan, `--uninstall` para retirarlo |
| `node adapters/install-claude.mjs` | Instala en Claude Code, terminal y extensión de VS Code. Mismas opciones |
| `bash adapters/test.sh` | Valida, genera, e instala, reinstala y desinstala en carpetas temporales para los dos hosts. No toca tu configuración |

Los dos instaladores ejecutan `build.mjs` antes, que a su vez ejecuta `check.mjs`. Si algo no valida, no instalan.

## Qué recibe cada host

| Pieza | OpenCode | Claude Code | Codex |
|---|---|---|---|
| Reglas globales | `~/.config/opencode/AGENTS.md` enlazado a `core/AGENTS.md`, y `PROTOCOL.md` y `SECURITY.md` en `instructions` | Bloque con `@imports` a `core/` dentro de `~/.claude/CLAUDE.md`, sin tocar lo que ya tengas | `dist/codex/AGENTS.md`, las tres reglas en un solo fichero. Cópialo a `~/.codex/AGENTS.md` |
| Skills | Enlaces en `~/.config/opencode/skills/` | Enlaces en `~/.claude/skills/` | Enlaza `skills/*` en `~/.agents/skills/` |
| Agentes | Copias en `~/.config/opencode/agents/` | Copias en `~/.claude/agents/` | Sin subagentes por fichero; los roles van en el encargo |

## Por qué los agentes se traducen y las skills no

Las skills usan el mismo `SKILL.md` en los tres hosts, así que basta un enlace.

Los agentes no. Claude Code espera `tools: Read, Grep…`, una lista de herramientas permitidas. OpenCode espera `permission:`, un objeto con `edit`, `bash`, `webfetch` y `websearch`. La misma clave significa cosas distintas en cada uno. Por eso `agents/*.md` lleva un frontmatter neutral y `build.mjs` lo traduce:

| Neutral | Claude Code | OpenCode |
|---|---|---|
| `access: write` o `write_scope` | `Write`, `Edit` en `tools` | `edit: allow` |
| `shell: full` | `Bash` en `tools` | `bash: allow` |
| `web: true` | `WebFetch`, `WebSearch` | `webfetch: allow`, `websearch: allow` |
| `name` | `name:` | el nombre del fichero |

## Límites reales del aislamiento

| Intención | Claude Code | OpenCode |
|---|---|---|
| Sin edición | Se cumple | Se cumple |
| Sin shell | Se cumple | Se cumple |
| Escribir solo en una carpeta (`write_scope`) | No se impone: es una regla del prompt | No se impone: es una regla del prompt |
| Revisor de solo lectura con shell | No es solo lectura real: con shell puede escribir | Igual |

Por eso, después de una revisión, comprueba con `git status` que no se ha tocado código. Si un revisor tuyo no necesita ejecutar nada, déjalo con `shell: none`.
