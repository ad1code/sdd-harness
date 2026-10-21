---
name: sdd-validate
description: Comprueba que lo construido cumple la spec, requisito a requisito, con el test que lo cubre y el resultado de ejecutarlo, más scripts/verify.sh y la regresión de specs anteriores. Usar cuando todas las tareas de una spec estén marcadas.
---
<!-- Basado en hello-sdd de MoureDev (Apache-2.0), adaptado. Ver NOTICE. -->

# Validar una spec

No arregles nada aquí: se comprueba y se informa.

## Proceso

1. Recorre la spec RF por RF. Para cada uno: qué test lo cubre, ejecútalo y anota el resultado. Un RF sin test, o con un test que no se ejecutó, es **no cumplido**.
2. Ejecuta `scripts/verify.sh` completo, con todas las specs anteriores dentro. Si una spec ya aceptada se rompe, la validación no pasa.
3. Revisa los criterios de finalización y la sección "Fuera de alcance": que no se haya construido nada que no se pidió.
4. Escribe `specs/NNN/validacion.md` con la tabla RF → test → resultado y un veredicto: cumplida o no cumplida, con lo que falta.
5. **Aceptación.** Enseña el informe al usuario. Con su sí, escribe `Estado: aceptada ◆3 (fecha)` en la spec.

Un fallo vuelve a `sdd-implement` si el código no cumple, o a `sdd-change` si es la spec la que estaba mal.
