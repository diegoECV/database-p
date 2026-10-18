#!/usr/bin/env bash
# =====================================================================
# demo-transacciones.sh - Demostración de Transacciones ACID en MongoDB
# VISONS S.A.C. - Replica Set + startTransaction / commit / rollback
#
# Incluye diagnóstico inteligente de errores y sondeo activo (polling)
# para la elección del nodo Primary del Replica Set.
#
# Uso:
#   ./demo/demo-transacciones.sh          → Ejecución completa
#   ./demo/demo-transacciones.sh cleanup  → Elimina contenedores y volúmenes
# =====================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$LAB_DIR"

PROJECT_NAME="visons-demo-transacciones"
COMPOSE_FILE="-f compose.transactions.yaml"

paso()    { printf '\n\033[1;36m[PASO %s]\033[0m %s\n' "$1" "$2"; }
por_que() { printf '    \033[0;90mPor qué: %s\033[0m\n' "$1"; }
ok()      { printf '    \033[1;32m✓ %s\033[0m\n' "$1"; }
info()    { printf '    \033[0;33m→ %s\033[0m\n' "$1"; }
comando() { printf '    \033[1;33m$ %s\033[0m\n' "$1"; }
separador(){ printf '    %.0s─' {1..60}; printf '\n'; }
error()   { printf '    \033[1;31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

on_error() {
  local exit_code="$?"
  local line_no="$1"
  local failed_cmd="$2"

  printf '\n\033[1;31m══════════════════════════════════════════════════════════════════════\033[0m\n'
  printf '\033[1;31m  [ERROR DETECTADO] Falló la demostración de transacciones ACID\033[0m\n'
  printf '\033[1;31m══════════════════════════════════════════════════════════════════════\033[0m\n'
  printf '  → \033[1;33mLínea del script:\033[0m %s\n' "$line_no"
  printf '  → \033[1;33mComando fallido:\033[0m  %s\n' "$failed_cmd"
  printf '  → \033[1;33mCódigo de salida:\033[0m %s\n\n' "$exit_code"

  printf '\033[1;36m🔍 Diagnóstico y soluciones sugeridas:\033[0m\n'
  if ! docker info >/dev/null 2>&1; then
    printf '  1. Docker no está respondiendo. Ejecuta: sudo systemctl start docker\n'
  elif ss -tuln 2>/dev/null | grep -q ":27018 "; then
    printf '  2. El puerto 27018 está en conflicto. Revisa otros contenedores con "docker ps".\n'
  else
    printf '  • Para inspeccionar los logs de MongoDB Replica Set:\n'
    printf '      docker logs visons-tx-mongo\n'
    printf '  • Para ver logs del runner de transacciones:\n'
    printf '      docker logs visons-tx-runner\n'
    printf '  • Para limpiar y reintentar:\n'
    printf '      ./demo/demo-transacciones.sh cleanup\n'
    printf '  • Manual de ayuda: docs/TRANSACCIONES.md y docs/TROUBLESHOOTING.md\n'
  fi
  printf '\033[1;31m══════════════════════════════════════════════════════════════════════\033[0m\n\n'
  exit "$exit_code"
}

trap 'on_error $LINENO "$BASH_COMMAND"' ERR

cleanup() {
  paso "LIMPIEZA" "Eliminar proyecto '$PROJECT_NAME' y sus volúmenes."
  docker compose --project-name "$PROJECT_NAME" $COMPOSE_FILE \
    down --volumes --remove-orphans 2>/dev/null || true
  ok "Proyecto '$PROJECT_NAME' eliminado correctamente."
  exit 0
}

if [[ "${1:-}" == "cleanup" ]]; then cleanup; fi
[[ $# -eq 0 ]] || error "Uso: $0 [cleanup]"

command -v docker > /dev/null 2>&1 || error "Docker no está instalado en este sistema."
docker compose version > /dev/null 2>&1 || error "Docker Compose v2 no disponible."

if [[ ! -f .env ]]; then
  info "Archivo .env no encontrado. Creando automáticamente desde .env.example..."
  cp .env.example .env
  ok "Archivo .env creado exitosamente."
fi

# ─────────────────────────────────────────────────────────────
paso 0 "Limpiar residuos de ejecuciones anteriores."
docker compose --project-name "$PROJECT_NAME" $COMPOSE_FILE \
  down --volumes --remove-orphans 2>/dev/null || true
ok "Sin residuos previos."

# ─────────────────────────────────────────────────────────────
paso 1 "Levantar MongoDB en modo Replica Set (rs0)."
por_que "MongoDB rechaza startTransaction() en standalone. El Replica Set es obligatorio por el motor para coordinar transacciones multi-documento."
comando "docker compose $COMPOSE_FILE up mongodb-rs rs-init -d"
docker compose --project-name "$PROJECT_NAME" --env-file .env \
  $COMPOSE_FILE up mongodb-rs rs-init -d

info "Esperando activamente que el Replica Set elija un nodo Primary..."
primary_ready=false
for i in {1..35}; do
  if docker exec visons-tx-mongo mongosh --quiet --eval 'try { if (rs.status().myState === 1) quit(0); } catch(e) {} quit(1);' >/dev/null 2>&1; then
    primary_ready=true
    ok "Replica Set inicializado y nodo Primary activo (detectado en ${i}s)."
    break
  fi
  sleep 1
done

if [[ "$primary_ready" != "true" ]]; then
  error "El Replica Set superó el tiempo límite para elegir un nodo Primary. Revisa 'docker logs visons-tx-mongo'."
fi

# ─────────────────────────────────────────────────────────────
paso 2 "Ejecutar la suite completa de Transacciones ACID."
por_que "Aplica el setup inicial, el escenario de commit exitoso, el de rollback por validación y la verificación formal de Atomicidad, Consistencia, Aislamiento y Durabilidad."
comando "docker compose $COMPOSE_FILE up run-transactions"

docker compose --project-name "$PROJECT_NAME" --env-file .env \
  $COMPOSE_FILE up run-transactions
ok "Suite de transacciones ACID completada exitosamente."

printf '\n\033[1;32m══════════════════════════════════════════════════════════════════════\033[0m\n'
printf '\033[1;32m  ✔ DEMOSTRACIÓN DE TRANSACCIONES ACID FINALIZADA CON ÉXITO\033[0m\n'
printf '\033[1;32m══════════════════════════════════════════════════════════════════════\033[0m\n'
printf '  Proyecto: %s\n' "$PROJECT_NAME"
printf '  Para detener y limpiar contenedores: %s cleanup\n\n' "$0"
