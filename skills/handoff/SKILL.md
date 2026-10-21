---
name: handoff
description: Cierra una tarea dejando el relevo escrito en el repo, para que otra sesión, otro equipo u otro agente continúe sin releer el historial. Usar cuando el usuario pida cerrar, pausar o dejar handoff, y al terminar una tarea antes del commit final.
---
El relevo viaja por Git con el código, en el mismo commit. Nada lo escribe solo: se hace al cerrar la tarea.

## Dos ficheros

**`HANDOFF.md`** (raíz del repo, o `docs/HANDOFF.md` si ya vive ahí). Se reescribe entero en cada cierre: es el estado, no un historial.

```markdown
# Handoff — <proyecto>
fecha: AAAA-MM-DD · agente: <herramienta y modelo> · rama: <rama> · commit: <hash corto>

## Estado actual          hecho y verificado (con la evidencia) / a medias / propuesto sin ejecutar
## Decisiones tomadas      qué se decidió y por qué, incluidas las alternativas descartadas
## Archivos tocados
## Para arrancar en otro equipo   qué no viaja por Git y cómo se reconstruye (.env desde .env.example, datos, modelos, servicios)
## Bloqueos o riesgos
## Siguiente paso          uno, ejecutable hoy
```

**`docs/ERRORES.md`**. Solo se añade, nunca se reescribe. Una entrada por error real del desarrollo que costó tiempo:

```markdown
## AAAA-MM-DD · <síntoma en una línea>
- Dónde: fichero, comando o servicio
- Causa: la real, no la primera sospecha
- Intentos que no funcionaron: para que nadie los repita
- Solución: qué se hizo, con el commit
- Cómo evitarlo: la comprobación o regla que lo habría parado
```

## Reglas

- Concreto: "se cambió X en Y para resolver Z", no "varios cambios".
- Distingue lo verificado de lo propuesto. Si no se comprobó, se dice.
- Un bloqueo dice qué está parado, por qué y qué hace falta para desbloquearlo.
- Sin secretos ni tokens: nombres de variables, nunca valores. Rutas relativas al repo.
- Si un documento que hace falta para continuar está en `.gitignore`, se avisa al usuario en el cierre: o viaja, o se anota en "Para arrancar en otro equipo".
- El cierre va en el mismo commit que el trabajo. El push sigue la regla 10 de `AGENTS.md`; a `main` o a producción, solo con el sí del usuario.

Quien retoma lee `HANDOFF.md` y `docs/ERRORES.md`, y comprueba el estado real antes de fiarse.
