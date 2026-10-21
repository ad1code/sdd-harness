# Empieza aquí

Este repo es una base, no un sistema terminado. Trae el método y lo imprescindible para que funcione. El resto lo montas tú, con tu agente, según cómo trabajas.

Abre tu agente (OpenCode o Claude Code) en la carpeta de este repo y pégale esto:

```
Lee EMPIEZA-AQUI.md y sigue sus pasos conmigo.
```

---

## Instrucciones para el agente

Vas a ayudar a la persona a convertir esta base en su harness. Trabaja en este orden y no te saltes pasos.

### 1. Entiende el repo

Lee `README.md`, `core/`, `skills/`, `agents/` y `plantillas/`. Resume en cinco líneas qué hace el método y qué trae.

### 2. Entrevista a la persona

De una pregunta en una, como mucho ocho, esperando cada respuesta:

- A qué se dedica y en qué tipo de proyectos trabaja.
- Con qué lenguajes y herramientas.
- Qué domina y qué está aprendiendo, para saber cuánto explicarle.
- Cómo quiere que le hables: tono, longitud, idioma.
- Qué no quiere que hagas nunca.
- Qué le ha salido mal antes trabajando con agentes.

Con las respuestas, propón el texto de la sección "Sobre mí" de `core/AGENTS.md`. Escríbelo solo cuando lo apruebe.

### 3. Propón qué añadir

Con lo que sabes de su trabajo, propón **como mucho tres** piezas nuevas entre skills y agentes. Ejemplos de lo que suele hacer falta:

- Un revisor de seguridad, si trabaja con datos de usuarios o pagos.
- Un revisor de su especialidad: frontend, accesibilidad, bases de datos, rendimiento.
- Una skill para su forma de desplegar o de probar.
- Una skill para investigar antes de decidir una librería.

Para cada una: qué haría, cuándo se usaría y por qué le ahorra problemas. Que elija.

Menos es más. Varias skills cargadas a la vez confunden al agente, y lo que un agente escribe para sí mismo sin que nadie lo revise suele rendir peor que no tener nada. Por eso son pocas y las aprueba la persona.

### 4. Créalas con las plantillas

- Skills: copia `plantillas/SKILL.md` a `skills/<nombre>/SKILL.md`.
- Agentes: copia `plantillas/agente.md` a `agents/<nombre>.md`.

Escríbelas cortas y concretas, con pasos que se puedan comprobar. Enséñale cada una antes de guardarla.

### 5. Comprueba que todo funciona

```bash
node adapters/check.mjs      # nombres, referencias y cadena de fases
bash adapters/test.sh        # instala y desinstala en carpetas temporales, en los dos hosts
```

Si algo falla, corrígelo antes de seguir. No digas que funciona sin enseñar la salida.

### 6. Instala

En la herramienta que use:

```bash
node adapters/install-opencode.mjs
node adapters/install-claude.mjs
```

### 7. Primer proyecto

Propón un proyecto pequeño de verdad, de una tarde, para recorrer el método entero: spec, plan, tareas, implementación y validación. Es la forma de ver dónde le encaja y dónde no.

Al terminar, pregúntale qué le ha sobrado y qué le ha faltado. Eso es lo siguiente que se ajusta.
