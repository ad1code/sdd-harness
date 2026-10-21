#!/usr/bin/env bash
# Verificador único del proyecto: lo usan los agentes, el usuario y CI.
# Ejecuta siempre la suite COMPLETA (todas las specs), no solo la spec activa: es la prueba de regresión.
# Códigos de salida: 0 todo pasa · 1 algo falla · 2 bloqueado (sin pasos definidos o falta un requisito)
set -uo pipefail

# Pasos reales del repo, "nombre::comando". Ejemplo: "tipos::npx tsc --noEmit"
STEPS=(
)

RUN_DIR=".harness/runs/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$RUN_DIR"
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "sin-git")
DIRTY=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')

if [ "${#STEPS[@]}" -eq 0 ]; then
  echo "blocked: no hay pasos definidos en scripts/verify.sh" | tee "$RUN_DIR/summary.txt"
  exit 2
fi

FAILED=0
{
  echo "commit: $COMMIT (ficheros sin commitear: $DIRTY)"
  echo "entorno: $(uname -sm) · $(date -u +%FT%TZ)"
} > "$RUN_DIR/summary.txt"

for step in "${STEPS[@]}"; do
  name="${step%%::*}"; cmd="${step#*::}"
  echo "▶ $name: $cmd"
  bash -o pipefail -c "$cmd" > "$RUN_DIR/$name.log" 2>&1
  code=$?
  if [ $code -eq 0 ]; then state="pass"; else state="fail"; FAILED=1; fi
  echo "$state  $name  (exit $code)  $cmd" | tee -a "$RUN_DIR/summary.txt"
  [ $code -ne 0 ] && tail -n 20 "$RUN_DIR/$name.log"
done

echo "evidencia: $RUN_DIR"
exit $FAILED
