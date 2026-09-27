#!/bin/sh
set -eu

# Script de migracion para MongoDB
echo "Iniciando aplicacion de esquemas en MongoDB..."

sleep 5

latest_version=1
for candidate in changes/V*.js; do
  [ -e "$candidate" ] || continue
  name="${candidate##*/}"
  number="${name#V}"
  number="${number%%__*}"
  number="$(printf '%s' "$number" | sed 's/^0*//')"
  number="${number:-0}"
  [ "$number" -gt "$latest_version" ] && latest_version="$number"
done

export TARGET_SCHEMA_VERSION="${TARGET_SCHEMA_VERSION:-$latest_version}"

mongo_run() {
  mongosh -u "$MONGO_ADMIN_USER" -p "$MONGO_ADMIN_PASSWORD" --authenticationDatabase admin "$MONGO_DATABASE" --file "$1"
}

apply_script() {
    script="$1"
    file="${script##*/}"
    digits="${file#V}"; digits="${digits%%__*}"
    sequence="$(printf '%s' "$digits" | sed 's/^0*//')"; sequence="${sequence:-0}"
    checksum="$(sha256sum "$script" | awk '{print $1}')"
    change_id="${file%.js}"
    
    echo "Aplicando $file..."
    mongo_run "$script"
    
    export CHANGE_SEQUENCE="$sequence"
    export CHANGE_ID="$change_id"
    export CHANGE_CHECKSUM="$checksum"
    
    mongo_run metadata/record-change.js
}

# Aplicar base
apply_script bootstrap/V001__baseline.js

# Aplicar cambios subsecuentes
for script in changes/V*.js; do
  [ -e "$script" ] || continue
  file="${script##*/}"; digits="${file#V}"; digits="${digits%%__*}"
  sequence="$(printf '%s' "$digits" | sed 's/^0*//')"; sequence="${sequence:-0}"
  [ "$sequence" -le "$TARGET_SCHEMA_VERSION" ] || continue
  apply_script "$script"
done

echo "Migracion completada en MongoDB."
