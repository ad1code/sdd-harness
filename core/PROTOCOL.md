# Protocolo — spec-driven development con puertas

La spec decide qué se construye y el usuario lo aprueba en tres puertas. Entre puertas, el agente trabaja con controles que no puede saltarse. Combina el método de hello-sdd de MoureDev con controles de ECC (everything-claude-code).

## Flujo

```
sdd-init → sdd-spec ─▶ ◆1 spec aprobada
         → sdd-plan ─▶ ◆2 plan y tareas aprobados
         → sdd-implement (tarea a tarea, con OK del usuario entre tareas)
         → sdd-validate ─▶ ◆3 aceptada
         → sdd-change (algo nuevo o distinto) → vuelve a la spec
```

Hasta ◆2 no se escribe código. Cada aprobación se escribe en el fichero: sin `Estado: …` la puerta no está cruzada.

## Controles en cada tarea

1. **Rojo antes que verde.** El test se ejecuta y falla por el motivo esperado antes de escribir el código.
2. **`scripts/verify.sh` en verde.** 0 pasa, 1 falla, 2 bloqueado. Nunca un PASS de algo que no se ejecutó.
3. **Revisión con contexto limpio.** El agente `code-reviewer` mira el diff sin haber visto cómo se escribió.
4. **Parada.** Se marca la tarea y se espera el OK del usuario para la siguiente.

## Cuándo parar y preguntar

- La tarea pide algo que la spec no dice.
- Hay que cambiar un requisito (`sdd-change`).
- Dos intentos fallidos sobre lo mismo.
- El revisor devuelve BLOQUEO.
- Falta una credencial, un servicio o un entorno.
- Algo irreversible: borrar, desplegar, permisos, push a la rama principal.

## Reglas fijas

- **La spec manda.** Lo que no está no se implementa.
- **Una spec por funcionalidad**, con requisitos en EARS que sirven de criterios de aceptación.
- **Un hueco visible es información; una suposición silenciosa es deuda:** `[NECESITA ACLARACIÓN]`.
- **Regresión:** `verify.sh` ejecuta siempre la suite completa. Una spec nueva no se acepta si rompe una anterior.
- **Continuidad:** al cerrar una tarea, `HANDOFF.md` y `docs/ERRORES.md` en el mismo commit (skill `handoff`).

## Artefactos de un proyecto

```
<proyecto>/
  AGENTS.md             qué es, comandos, convenciones y límites
  scripts/verify.sh     tests, tipos, lint y build en una orden
  specs/NNN-nombre/
    spec.md             requisitos en EARS, casos límite, fuera de alcance
    plan.md             módulos, datos, contrato, decisiones, tests
    tasks.md            - [ ] Tn. … (RF-x) Hecho cuando: …
    validacion.md       RF → test → resultado
  HANDOFF.md            dónde se quedó
  docs/PENDIENTE.md     lo hablado y no cerrado
  docs/ERRORES.md       errores del desarrollo y su solución
```

## Hasta dónde llega

Esta versión trabaja en modo **guiado**: el agente para tras cada tarea. Es lo seguro para empezar. A partir de aquí, lo natural es ampliarlo con tus propias piezas: un orquestador que encadene tareas solo, revisores de seguridad o de tu dominio, una fase de investigación antes del plan. `EMPIEZA-AQUI.md` explica cómo.
