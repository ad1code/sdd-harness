---
name: sdd-spec
description: Redacta la especificación de una funcionalidad. Entrevista al usuario y produce specs/NNN-nombre/spec.md con requisitos RF en notación EARS, casos límite y lo que queda fuera. Usar cuando haya que definir qué se construye antes de planificarlo.
---
<!-- Basado en hello-sdd de MoureDev (Apache-2.0), adaptado. Ver NOTICE. -->

# Especificar una funcionalidad

La spec es el contrato: lo que no está aquí, no se implementa. **No escribas código.** Una spec por funcionalidad.

Plantilla: `spec-template.md` en la carpeta de esta skill.

## Proceso

1. **Lee** las specs previas de `specs/` para no contradecir lo ya acordado.
2. **Entrevista** sobre lo que falte: de una pregunta en una, máximo 6. Casos límite, errores y qué queda fuera. Si el usuario pregunta "¿cómo lo harías?", vuelve al qué: el cómo va en el plan.
3. **Número:** el siguiente libre con tres dígitos, `specs/NNN-<nombre>/spec.md`.
4. **Redacta** con la plantilla. Requisitos en EARS, numerados RF-1, RF-2… Cada uno verificable: si no sabes cómo comprobarlo, está mal escrito.
5. **Lo que no sepas** se marca `[NECESITA ACLARACIÓN: pregunta]` y se resuelve con el usuario antes de aprobar. Nunca se rellena inventando.
6. **Aprobación.** Con el sí del usuario, escribe `Estado: aprobada ◆1 (fecha)` en la cabecera. Siguiente fase: `sdd-plan`.

## Reglas

- Qué y por qué. Nada de stack, ficheros, esquemas ni funciones.
- Siempre una sección "Fuera de alcance".
- Un requisito, una frase. Sin adjetivos que no se puedan medir: "rápido" no es un requisito; "en menos de 200 ms", sí.

## EARS

| Patrón | Forma |
|---|---|
| Ubicuo | EL SISTEMA \<hará\> |
| Evento | CUANDO \<disparador\>, EL SISTEMA \<hará\> |
| Estado | MIENTRAS \<estado\>, EL SISTEMA \<hará\> |
| Opcional | DONDE \<característica\>, EL SISTEMA \<hará\> |
| No deseado | SI \<condición\>, ENTONCES EL SISTEMA \<hará\> |

> RF-4: SI el nombre ya existe, ENTONCES EL SISTEMA no creará un duplicado e informará del conflicto.
