---
name: sdd-plan
description: Convierte una spec aprobada en specs/NNN/plan.md (módulos, datos, contrato, decisiones y estrategia de tests) y specs/NNN/tasks.md (tareas pequeñas en orden, cada una con sus RF y un "Hecho cuando" verificable). Usar después de aprobar la spec. Sin código.
---
<!-- Basado en hello-sdd de MoureDev (Apache-2.0), adaptado. Ver NOTICE. -->

# Plan y tareas

**No escribas código.** La spec dice el qué; aquí se decide el cómo y el orden.

## Plan

1. Lee la spec. Si no está aprobada o quedan `[NECESITA ACLARACIÓN]`, vuelve a `sdd-spec`.
2. Antes de decidir una librería o un patrón, comprueba si ya existe en el repo y qué dice la documentación oficial de la versión en uso.
3. Escribe `specs/NNN/plan.md` con: módulos y el RF que cubre cada uno, modelo de datos con un ejemplo, contrato (comandos, endpoints, errores), decisiones técnicas con la alternativa descartada, y estrategia de tests con los comandos que formarán `scripts/verify.sh`.
4. Si encuentras algo que la spec no decide, dilo. No lo rellenes tú.

## Tareas

5. Escribe `specs/NNN/tasks.md`: tareas de 20-30 minutos, en orden de dependencia, con checkbox, los RF que cubren y una línea "Hecho cuando:" verificable.
6. Cada RF aparece en al menos una tarea. La primera deja el esqueleto y `verify.sh` con sus pasos reales; la última es la validación.
7. **Aprobación.** Con el sí del usuario, escribe `Estado: aprobados ◆2 (fecha)` en los dos ficheros. Siguiente fase: `sdd-implement`.

```markdown
- [ ] T1. Esqueleto del proyecto. (RF: —) Hecho cuando: la suite de tests corre.
- [ ] T2. <pieza concreta>. (RF-2, RF-3) Hecho cuando: tests de <escenarios> en verde.
```
