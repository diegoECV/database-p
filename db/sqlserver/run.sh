#!/bin/sh
set -eu

# Script de migracion para SQL Server
echo "Iniciando aplicacion de esquemas en SQL Server..."

# Esperar a que SQL Server este listo
sleep 15

latest_version=1
for candidate in changes/V*.sql; do
  [ -e "$candidate" ] || continue
  name="${candidate##*/}"
  number="${name#V}"
  number="${number%%__*}"
  number="$(printf '%s' "$number" | sed 's/^0*//')"
  number="${number:-0}"
  [ "$number" -gt "$latest_version" ] && latest_version="$number"
done

export TARGET_SCHEMA_VERSION="${TARGET_SCHEMA_VERSION:-$latest_version}"

sql() {
  /opt/mssql-tools18/bin/sqlcmd -S tcp:127.0.0.1,1433 -U sa -P "$MSSQL_SA_PASSWORD" -d "$MSSQL_DATABASE" -No -i "$1"
}

apply_script() {
    script="$1"
    file="${script##*/}"
    digits="${file#V}"; digits="${digits%%__*}"
    sequence="$(printf '%s' "$digits" | sed 's/^0*//')"; sequence="${sequence:-0}"
    checksum="$(sha256sum "$script" | awk '{print $1}')"
    change_id="${file%.sql}"
    
    echo "Aplicando $file..."
    sql "$script"
    
    /opt/mssql-tools18/bin/sqlcmd -S tcp:127.0.0.1,1433 -U sa -P "$MSSQL_SA_PASSWORD" -d "$MSSQL_DATABASE" -No \
      -v change_sequence="$sequence" \
      -v change_id="$change_id" \
      -v checksum="$checksum" \
      -v git_sha="unknown" \
      -v release_version="development" \
      -i metadata/record-change.sql
}

# Aplicar base
apply_script bootstrap/V001__baseline.sql

# Aplicar cambios subsecuentes
for script in changes/V*.sql; do
  [ -e "$script" ] || continue
  file="${script##*/}"; digits="${file#V}"; digits="${digits%%__*}"
  sequence="$(printf '%s' "$digits" | sed 's/^0*//')"; sequence="${sequence:-0}"
  [ "$sequence" -le "$TARGET_SCHEMA_VERSION" ] || continue
  apply_script "$script"
done

echo "Verificando contrato..."
/opt/mssql-tools18/bin/sqlcmd -S tcp:127.0.0.1,1433 -U sa -P "$MSSQL_SA_PASSWORD" -d "$MSSQL_DATABASE" -No \
  -v target_schema_version="$TARGET_SCHEMA_VERSION" \
  -i checks/contract.sql

echo "Migracion completada en SQL Server."
