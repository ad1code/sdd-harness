# sdd-harness

Una base para trabajar con agentes de IA en [OpenCode](https://opencode.ai) y Claude Code con **spec-driven development**: primero se decide qué se construye y se aprueba; después el agente escribe el código, con controles que comprueban que funciona de verdad.

Está pensada para desarrollo de software y proyectos grandes, donde improvisar sale caro.

**No es un sistema terminado.** Es la versión destilada del harness con el que trabajo a diario: trae el método y lo imprescindible para que funcione, y está preparada para que la completes con tu agente según cómo trabajas tú.

## El problema que resuelve

Un agente sin método:

- **Escribe código antes de saber qué hay que construir**, y lo que no se definió lo inventa.
- **Dice que algo funciona sin haberlo ejecutado.**
- **Pierde el hilo entre sesiones**: lo decidido en el chat no está en ningún sitio al día siguiente.

## Cómo funciona

```
"quiero crear…"
  ├─ sdd-init        crea el proyecto y su AGENTS.md
  ├─ sdd-spec        qué se construye, con requisitos verificables
  │     ◆1 apruebas la spec
  ├─ sdd-plan        cómo se construye y en qué tareas
  │     ◆2 apruebas el plan
  ├─ sdd-implement   una tarea: test en rojo, código, verify.sh, revisión, y para
  ├─ sdd-validate    requisito a requisito, con la prueba de cada uno
  │     ◆3 aceptas el resultado
  └─ sdd-change      algo nuevo o distinto vuelve a la spec, no al código
```

En cada tarea, el agente:

1. **Escribe el test y lo ve fallar** antes de escribir el código.
2. **Pasa `scripts/verify.sh`**, una sola orden con tests, tipos, lint y build.
3. **Pide revisión** a un agente que no ha visto cómo se escribió el código.
4. **Para** y espera tu OK.

Y al cerrar queda escrito dónde se quedó (`HANDOFF.md`), qué errores costó (`docs/ERRORES.md`) y qué se habló sin cerrar (`docs/PENDIENTE.md`).

## Qué trae

| Carpeta | Contenido |
|---|---|
| `core/` | Reglas siempre cargadas, con una sección "Sobre mí" para rellenar; el protocolo; seguridad |
| `skills/` | 7 skills: `sdd-init`, `sdd-spec`, `sdd-plan`, `sdd-implement`, `sdd-validate`, `sdd-change`, `handoff` |
| `agents/` | 2 agentes: `code-reviewer` e `implementer` |
| `plantillas/` | Plantillas para crear tus propias skills y agentes |
| `adapters/` | Validador, generador, instaladores para OpenCode y Claude Code, y una prueba automática |
| `EMPIEZA-AQUI.md` | Lo que tu agente lee para montarte tu versión |

## Empezar

Necesitas Node.js 18 o superior, Git, y OpenCode o Claude Code.

```bash
git clone https://github.com/ad1code/sdd-harness.git ~/sdd-harness
cd ~/sdd-harness
bash adapters/test.sh
```

La prueba instala y desinstala en carpetas temporales, en los dos hosts, sin tocar tu configuración. Tiene que acabar en "Todo en verde".

Después abre tu agente en esa carpeta y dile:

```
Lee EMPIEZA-AQUI.md y sigue sus pasos conmigo.
```

Te entrevistará, rellenará tus preferencias, te propondrá como mucho tres piezas nuevas para tu forma de trabajar, las creará con las plantillas, lo comprobará e instalará.

Si prefieres instalarlo tal cual:

```bash
node adapters/install-opencode.mjs    # OpenCode
node adapters/install-claude.mjs      # Claude Code, también su extensión de VS Code
```

Los dos aceptan `--dry-run` para ver qué harían y `--uninstall` para retirarlo. Respetan tu configuración: tu `AGENTS.md` de OpenCode se guarda y se restaura, y en Claude Code las reglas van en un bloque marcado dentro de tu `CLAUDE.md`. Detalle en `adapters/README.md`.

## Por qué tan poco

Porque funciona mejor. Muchas skills cargadas a la vez confunden al agente, y lo que el agente escribe para sí mismo sin que nadie lo revise suele rendir peor que no tener nada. Esta base trae lo justo para que el método funcione; lo que añadas, que sea poco, tuyo y revisado.

Lo que no trae y probablemente acabes queriendo: un modo autónomo que encadene tareas sin parar, revisores de seguridad o de tu especialidad, una fase de investigación antes del plan. `core/PROTOCOL.md` explica por dónde ampliarlo.

## Lo que no hace

- **No sustituye tu criterio.** Si apruebas una spec sin leerla, el método no te protege.
- **No hace bueno a un modelo malo.** Las skills son instrucciones.
- **No usa hooks.** Los controles son reglas en las skills y los agentes, igual en OpenCode y en Claude Code. Por eso la revisión la hace otro agente con contexto limpio.

## De dónde sale

- **El método**, de [hello-sdd](https://github.com/mouredev/hello-sdd) de MoureDev (Apache-2.0).
- **Los controles y los agentes**, de [ECC, everything-claude-code](https://github.com/affaan-m/ECC) de Affaan Mustafa (MIT).

Licencias y ficheros derivados en `NOTICE`.

---

Hecho por [adicode](https://adicodev.com) · [GitHub](https://github.com/ad1code)
