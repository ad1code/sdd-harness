---
name: sdd-implement
description: Implementa SOLO la tarea Tn indicada de specs/NNN/tasks.md con el test primero (rojo comprobado antes de verde), pasa scripts/verify.sh, pide revisión al agente code-reviewer, marca la tarea y se para. Usar con plan y tareas aprobados.
---
<!-- Basado en hello-sdd de MoureDev (Apache-2.0) y en ECC (MIT), adaptado. Ver NOTICE. -->

# Implementar una tarea

La única fase en la que se escribe código.

## Proceso

1. Lee la tarea en `tasks.md` y el `plan.md`. Comprueba que las tareas de las que depende están marcadas.
2. **Rojo.** Escribe primero los tests de los RF de la tarea y **ejecútalos**. Tienen que fallar porque falta el comportamiento, no por un import roto. Un test escrito pero no ejecutado no cuenta.
3. **Verde.** Lo mínimo para que pasen. Vuelve a ejecutarlos.
4. Ejecuta `scripts/verify.sh` y **enseña la salida real** con su código. Solo 0 permite cerrar.
5. Lanza el agente `code-reviewer` sobre el diff. Un BLOCK se arregla antes de seguir.
6. Marca la tarea, di qué RF cubre, y **para**. No empieces la siguiente sin el OK del usuario.

Sin tareas pendientes, la siguiente fase es `sdd-validate`.

## Reglas

- Lo que no está en la spec ni en el plan no se implementa: para y pregunta.
- No cambies un test ni `verify.sh` para que pase. Si un test está mal, dilo antes.
- Si el código se aparta del plan, propón el cambio en `plan.md`. Si cambia un comportamiento de la spec, es `sdd-change`.
- Tras dos intentos fallidos sobre el mismo error, para y explica qué has probado.
