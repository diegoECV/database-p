#!/usr/bin/env bash
# demo-inicio.sh - Demostración de inicialización desde cero
# Levantar todos los servicios en un proyecto aislado y verificar el contrato.
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$LAB_DIR"

PROJECT_NAME="visons-demo-inicio"
if [[ -f .env ]]; then source .env; fi
export HTTP_PORT="${HTTP_PORT:-8080}"

paso() { printf '\n\033[1;36m[%s]\033[0m %s\n' "$1" "$2"; }
porqué() { printf '    Por qué: %s\n' "$1"; }
ok() { printf '    \033[1;32m✓ %s\033[0m\n' "$1"; }
error() { printf '    \033[1;31m✗ %s\033[0m\n' "$1" >&2; exit 1; }
comando() { printf '    \033[1;33m$ %s\033[0m\n' "$1"; }
necesita() { command -v "$1" > /dev/null 2>&1 || error "Falta el comando '$1'."; }

cleanup() {
  paso "limpieza" "Eliminar el proyecto aislado y sus volúmenes."
  docker compose --project-name "$PROJECT_NAME" down --volumes --remove-orphans 2>/dev/null || true
  ok "Proyecto $PROJECT_NAME eliminado."
}

if [[ "${1:-}" == cleanup ]]; then cleanup; exit 0; fi
[[ $# -eq 0 ]] || error "Uso: $0 [cleanup]"

necesita docker
docker compose version > /dev/null 2>&1 || error "Docker Compose v2 no está disponible."
[[ -f .env ]] || { cp .env.example .env; ok ".env creado desde .env.example."; }

paso 1 "Eliminar cualquier residuo de una ejecución anterior."
comando "docker compose --project-name $PROJECT_NAME down --volumes"
docker compose --project-name "$PROJECT_NAME" down --volumes --remove-orphans 2>/dev/null || true
ok "Sin residuos previos."

paso 2 "Construir las imágenes con el código actual del repositorio."
comando "docker compose -f compose.yaml -f compose.build.yaml build"
docker compose --project-name "$PROJECT_NAME" -f compose.yaml -f compose.build.yaml build

paso 3 "Levantar todos los servicios y esperar a que estén listos."
comando "docker compose up -d --wait"
docker compose --project-name "$PROJECT_NAME" --env-file .env \
  -f compose.yaml \
  up -d --wait

paso 4 "Verificar el estado mediante el checker de persistencia."
comando "curl http://127.0.0.1:$HTTP_PORT/diagnostics"
sleep 5 # Dar tiempo a que el servidor Java inicialice y los scripts terminen
curl --fail --silent --show-error --retry 15 --retry-connrefused --retry-delay 5 "http://127.0.0.1:$HTTP_PORT/diagnostics"
printf '\n'
ok "Inicialización completa. SQL Server y MongoDB con esquemas y datos semilla aplicados."
printf '    Para probar la web (Swagger): http://127.0.0.1:%s/swagger-ui\n' "$HTTP_PORT"
printf '    Para eliminar los contenedores: %s cleanup\n' "$0"
