# Liquibase - Versionamiento de base de datos (SQL Server + MongoDB)

Carpeta con los changelogs de Liquibase del proyecto VISONS S.A.C. Gestiona las **27 entidades** de datos (11 tablas en SQL Server y 16 colecciones en MongoDB).

```
compose.liquibase.yaml        Levanta SQL Server, MongoDB y los dos contenedores Liquibase
liquibase/
  Dockerfile                  Liquibase 4.33.0 + extension liquibase-mongodb
  sqlserver/
    db.changelog-master.yaml  Changelog maestro (incluye changes/ en orden)
    changes/                  001..004 (SQL con formato de Liquibase - 11 tablas)
  mongodb/
    db.changelog-master.yaml  Changelog maestro (incluye changes/ en orden)
    changes/                  001..004 (YAML - 16 colecciones)
  evolucion/                  Cambios 005 de ejemplo (se copian a changes/ durante la demo)
```

## Ejecutar

```sh
docker compose -f compose.liquibase.yaml up --build
```

## Agregar un cambio nuevo

1. Crear un archivo con el siguiente número dentro de `changes/` (por ejemplo `005-...`).
2. Ejecutar solo Liquibase:

```sh
docker compose -f compose.liquibase.yaml run --rm liquibase-sqlserver update
docker compose -f compose.liquibase.yaml run --rm liquibase-mongodb update
```

Regla: nunca se edita un changeset ya aplicado (Liquibase detecta el cambio de checksum).
