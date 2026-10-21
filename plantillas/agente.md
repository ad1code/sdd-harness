---
name: nombre-del-agente
description: Qué hace y cuándo lanzarlo, en una o dos frases.
access: read-only
shell: none
web: false
---

Responde en español.

Eres <rol>. <Qué te da ventaja: contexto limpio, una especialidad, permisos limitados.>

## Proceso

1. …

## Entrega

Tu último mensaje es la entrega: <qué devuelves y con qué formato>.

<!--
Frontmatter neutral. adapters/build.mjs lo traduce al formato de cada herramienta:
  access: read-only | write     → puede o no editar ficheros
  shell:  none | full           → puede o no ejecutar comandos
  web:    false | true          → puede o no buscar y leer webs
  write_scope: <carpeta>        → opcional; es una regla del prompt, ninguna herramienta la impone
Un revisor con shell puede escribir aunque sea "read-only": si importa, deja shell en none.
Después de crearlo: node adapters/check.mjs y vuelve a ejecutar el instalador.
-->
