---
name: sdd-change
description: Gestiona un requisito nuevo, un cambio de comportamiento o un bug que la spec no contemplaba. Actualiza primero la spec y después el plan y las tareas; el código va al final. Usar cuando el usuario pida cambiar algo ya especificado o aparezca un fallo fuera de la spec.
---
<!-- Basado en hello-sdd de MoureDev (Apache-2.0), adaptado. Ver NOTICE. -->

# Cambiar algo ya especificado

**No toques código todavía.** Un cambio vuelve a la spec, no al código.

## Proceso

1. Identifica qué spec afecta. Si es algo nuevo y separado, no es un cambio: es una spec nueva con `sdd-spec`.
2. Modifica `spec.md`: añade, cambia o tacha requisitos. Lo tachado se queda tachado, no se borra, para que se vea qué cambió.
3. Si el cambio deja huecos, se resuelven con el usuario antes de seguir.
4. Con la spec reaprobada, actualiza `plan.md` y añade las tareas nuevas a `tasks.md`.
5. Implementa con `sdd-implement`, tarea a tarea.

Un bug que la spec sí contemplaba no es un cambio: es una tarea que no cumple. Se arregla con un test que lo reproduzca primero.
