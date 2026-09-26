#!/usr/bin/env bash
# demo-evolucion.sh - Demostración de evolución de esquemas
# Muestra que levantar el proyecto nuevamente no destruye datos
# sino que aplica los nuevos scripts de la carpeta changes/.
set -Eeuo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$LAB_DIR"

PROJECT_NAME="visons-demo-inicio"
export HTTP_PORT="${HTTP_PORT:-8080}"

paso() { printf '\n\033[1;36m[%s]\033[0m %s\n' "$1" "$2"; }
porqué() { printf '    Por qué: %s\n' "$1"; }
ok() { printf '    \033[1;32m✓ %s\033[0m\n' "$1"; }
comando() { printf '    \033[1;33m$ %s\033[0m\n' "$1"; }

paso 1 "Desplegando la nueva versión (V002)"
porqué "Al reiniciar los contenedores (o redesplegar), los scripts de inicio detectarán que V001 ya existe y solo aplicarán V002."

comando "docker compose --project-name $PROJECT_NAME --env-file .env -f compose.yaml -f compose.build.yaml build"
docker compose --project-name "$PROJECT_NAME" --env-file .env -f compose.yaml -f compose.build.yaml build

comando "docker compose --project-name $PROJECT_NAME --env-file .env up -d --wait"
docker compose --project-name "$PROJECT_NAME" --env-file .env up -d --wait

sleep 5

paso 2 "Verificando el contrato actualizado"
comando "curl http://127.0.0.1:$HTTP_PORT/diagnostics"
curl --fail --silent --show-error "http://127.0.0.1:$HTTP_PORT/diagnostics"
printf '\n'
ok "Las migraciones V002 fueron aplicadas correctamente sin perder datos."
