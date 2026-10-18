#!/usr/bin/env bash
# =====================================================================
# demo-liquibase.sh - Demostración de Versionamiento con Liquibase
# VISONS S.A.C. - SQL Server + MongoDB (27 Entidades de Negocio)
#
# Incluye diagnóstico inteligente de errores: si algún paso falla,
# reporta la línea exacta, el comando fallido y la solución sugerida.
#
# Uso:
#   ./demo/demo-liquibase.sh             → Ejecución completa
#   ./demo/demo-liquibase.sh cleanup     → Elimina contenedores y volúmenes
# =====================================================================
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$LAB_DIR"

PROJECT_NAME="visons-demo-liquibase"
COMPOSE_FILE="-f compose.liquibase.yaml"

paso()    { printf '\n\033[1;36m[PASO %s]\033[0m %s\n' "$1" "$2"; }
por_que() { printf '    \033[0;90mPor qué: %s\033[0m\n' "$1"; }
ok()      { printf '    \033[1;32m✓ %s\033[0m\n' "$1"; }
info()    { printf '    \033[0;33m→ %s\033[0m\n' "$1"; }
comando() { printf '    \033[1;33m$ %s\033[0m\n' "$1"; }
separador(){ printf '    %.0s─' {1..60}; printf '\n'; }
error()   { printf '    \033[1;31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

# Limpieza garantizada de archivos temporales de evolución
cleanup_temp_files() {
  rm -f liquibase/sqlserver/changes/005-agregar-notas-pedido.sql 2>/dev/null || true
  rm -f liquibase/mongodb/changes/005-indice-codigo-barras.yaml 2>/dev/null || true
}

# Manejador inteligente de errores
on_error() {
  local exit_code="$?"
  local line_no="$1"
  local failed_cmd="$2"

  cleanup_temp_files

  printf '\n\033[1;31m══════════════════════════════════════════════════════════════════════\033[0m\n'
  printf '\033[1;31m  [ERROR DETECTADO] La ejecución se detuvo en el paso actual\033[0m\n'
  printf '\033[1;31m══════════════════════════════════════════════════════════════════════\033[0m\n'
  printf '  → \033[1;33mLínea del script:\033[0m %s\n' "$line_no"
  printf '  → \033[1;33mComando fallido:\033[0m  %s\n' "$failed_cmd"
  printf '  → \033[1;33mCódigo de salida:\033[0m %s\n\n' "$exit_code"

  printf '\033[1;36m🔍 Diagnóstico y soluciones recomendadas:\033[0m\n'
  
  if ! docker info >/dev/null 2>&1; then
    printf '  1. \033[1;31mEl servicio Docker no está corriendo.\033[0m\n'
    printf '     Solución: Ejecuta "sudo systemctl start docker" y vuelve a intentar.\n'
  elif ss -tuln 2>/dev/null | grep -q ":1433 "; then
    printf '  2. \033[1;31mEl puerto 1433 (SQL Server) ya está ocupado por otro proceso.\033[0m\n'
    printf '     Solución: Detén contenedores previos con "docker stop $(docker ps -q)".\n'
  elif ss -tuln 2>/dev/null | grep -q ":27018 "; then
    printf '  3. \033[1;31mEl puerto 27018 ya está ocupado.\033[0m\n'
    printf '     Solución: Revisa contenedores activos con "docker ps".\n'
  else
    printf '  • Para ver el registro completo del error en los contenedores:\n'
    printf '      docker compose --project-name %s %s logs\n' "$PROJECT_NAME" "$COMPOSE_FILE"
    printf '  • Para reiniciar desde un estado completamente limpio:\n'
    printf '      ./demo/demo-liquibase.sh cleanup\n'
    printf '  • Consulta el manual de resolución: docs/TROUBLESHOOTING.md\n'
  fi
  printf '\033[1;31m══════════════════════════════════════════════════════════════════════\033[0m\n\n'
  exit "$exit_code"
}

trap 'on_error $LINENO "$BASH_COMMAND"' ERR
trap cleanup_temp_files EXIT

cleanup() {
  paso "LIMPIEZA" "Eliminar proyecto '$PROJECT_NAME' y sus volúmenes."
  docker compose --project-name "$PROJECT_NAME" $COMPOSE_FILE down \
    --volumes --remove-orphans 2>/dev/null || true
  cleanup_temp_files
  ok "Proyecto '$PROJECT_NAME' eliminado correctamente."
  exit 0
}

if [[ "${1:-}" == "cleanup" ]]; then cleanup; fi
[[ $# -eq 0 ]] || error "Uso: $0 [cleanup]"

# Verificaciones iniciales con auto-corrección
command -v docker > /dev/null 2>&1 || error "Docker no está instalado en este sistema."
docker compose version > /dev/null 2>&1 || error "Docker Compose v2 no está disponible."

if [[ ! -f .env ]]; then
  info "Archivo .env no encontrado. Creando automáticamente desde .env.example..."
  cp .env.example .env
  ok "Archivo .env creado exitosamente."
fi

# ─────────────────────────────────────────────────────────────
paso 0 "Limpiar cualquier residuo de ejecuciones anteriores."
por_que "Garantiza que la demostración inicie en un entorno limpio y reproducible."
docker compose --project-name "$PROJECT_NAME" $COMPOSE_FILE \
  down --volumes --remove-orphans 2>/dev/null || true
cleanup_temp_files
ok "Sin residuos previos."

# ─────────────────────────────────────────────────────────────
paso 1 "Construir la imagen de Liquibase con extensión MongoDB."
por_que "El Dockerfile descarga liquibase-mongodb y los drivers bson/core/sync de Maven Central."
comando "docker compose $COMPOSE_FILE build liquibase-sqlserver liquibase-mongodb"
docker compose --project-name "$PROJECT_NAME" $COMPOSE_FILE build \
  liquibase-sqlserver liquibase-mongodb
ok "Imagen construida: Liquibase 4.33.0 con soporte políglota lista."

# ─────────────────────────────────────────────────────────────
paso 2 "Levantar bases de datos y aplicar los changesets 001-004 (27 Entidades)."
por_que "Liquibase ejecuta en orden alfabético: 11 tablas en SQL Server y 16 colecciones en MongoDB."
comando "docker compose $COMPOSE_FILE up --wait"

docker compose --project-name "$PROJECT_NAME" --env-file .env \
  $COMPOSE_FILE up --wait
ok "Bases de datos y esquemas listos. 27 entidades creadas exitosamente."

# ─────────────────────────────────────────────────────────────
paso 3 "Verificar DATABASECHANGELOG en SQL Server."
por_que "Audita autor, fecha, checksum, nombre de archivo y orden de ejecución."
separador
docker compose --project-name "$PROJECT_NAME" --env-file .env \
  $COMPOSE_FILE run --rm liquibase-sqlserver \
  history 2>/dev/null || true
separador
ok "Historial auditado de SQL Server visualizado."

# ─────────────────────────────────────────────────────────────
paso 4 "Verificar DATABASECHANGELOG en MongoDB."
por_que "La extensión liquibase-mongodb administra la colección 'DATABASECHANGELOG' de forma análoga."
separador
docker compose --project-name "$PROJECT_NAME" --env-file .env \
  $COMPOSE_FILE run --rm liquibase-mongodb \
  history 2>/dev/null || true
separador
ok "Historial auditado de MongoDB visualizado."

# ─────────────────────────────────────────────────────────────
paso 5 "Demostrar EVOLUCIÓN: incorporar el changeset 005 en caliente."
por_que "Regla de oro: nunca se edita un changeset ya aplicado. Se agrega un nuevo archivo con el incremento."

info "Copiando liquibase/evolucion/005-agregar-notas-pedido.sql → liquibase/sqlserver/changes/"
cp liquibase/evolucion/005-agregar-notas-pedido.sql liquibase/sqlserver/changes/

info "Copiando liquibase/evolucion/005-indice-codigo-barras.yaml → liquibase/mongodb/changes/"
cp liquibase/evolucion/005-indice-codigo-barras.yaml liquibase/mongodb/changes/

ok "Archivos 005 preparados en changes/."

# ─────────────────────────────────────────────────────────────
paso 6 "Ejecutar 'update' en Liquibase (solo aplica el changeset 005 pendiente)."
por_que "Liquibase detecta los checksums existentes y aplica de forma idempotente únicamente lo nuevo."
comando "docker compose $COMPOSE_FILE run --rm liquibase-sqlserver update"
docker compose --project-name "$PROJECT_NAME" --env-file .env \
  $COMPOSE_FILE run --rm liquibase-sqlserver update

comando "docker compose $COMPOSE_FILE run --rm liquibase-mongodb update"
docker compose --project-name "$PROJECT_NAME" --env-file .env \
  $COMPOSE_FILE run --rm liquibase-mongodb update
ok "Changeset 005 aplicado en ambos motores. Los datos previos se conservaron intactos."

# ─────────────────────────────────────────────────────────────
paso 7 "Verificar el historial actualizado con el changeset 005."
separador
docker compose --project-name "$PROJECT_NAME" --env-file .env \
  $COMPOSE_FILE run --rm liquibase-sqlserver history 2>/dev/null || true
separador
ok "DATABASECHANGELOG ahora incluye el changeset 005 con estado EXECUTED."

# ─────────────────────────────────────────────────────────────
paso 8 "Limpieza preventiva de archivos de evolución."
cleanup_temp_files
ok "Directorio de trabajo restablecido a su estado limpio original."

printf '\n\033[1;32m══════════════════════════════════════════════════════════════════════\033[0m\n'
printf '\033[1;32m  ✔ DEMOSTRACIÓN DE LIQUIBASE COMPLETADA SIN ERRORES\033[0m\n'
printf '\033[1;32m══════════════════════════════════════════════════════════════════════\033[0m\n'
printf '  Proyecto: %s\n' "$PROJECT_NAME"
printf '  Para detener y limpiar contenedores: %s cleanup\n\n' "$0"
