# Evolución Manual de la Base de Datos

Una vez que la base de datos está en producción (`V001__baseline`), **NUNCA** debes alterar los archivos existentes en la carpeta `bootstrap/`. Cualquier cambio estructural (agregar campos, crear índices, nuevas tablas) debe hacerse de forma evolutiva creando un nuevo archivo en la carpeta `changes/`.

## Reglas Obligatorias

1. Los nombres de los archivos deben seguir el patrón: `VNNN__descripcion_corta.extensión`.
2. `NNN` debe ser un número secuencial (ej. `003`, `004`).
3. Para SQL Server usar extensión `.sql`, para MongoDB usar `.js`.
4. El script debe ser **idempotente** (si es posible) y seguro.

## Paso a paso: Agregar un nuevo campo a SQL Server

1. Ve a la carpeta `db/sqlserver/changes/`.
2. Crea un archivo nuevo, por ejemplo: `V003__add_telefono_a_clientes.sql`.
3. Escribe el cambio:
   ```sql
   -- Agregando telefono
   ALTER TABLE ORDERS ADD telefono_contacto VARCHAR(20) NULL;
   GO
   ```
4. Guarda el archivo y levanta la base de datos:
   ```bash
   docker compose up -d
   ```
   El script `run.sh` detectará que `V003` es nuevo, lo aplicará y lo anotará en `control.schema_change`.

## Paso a paso: Agregar una nueva colección a MongoDB

1. Ve a la carpeta `db/mongodb/changes/`.
2. Crea un archivo nuevo: `V003__add_promociones.js`.
3. Escribe el código:
   ```javascript
   var visonsDb = db.getSiblingDB(process.env.MONGO_DATABASE);
   visonsDb.createCollection("promociones");
   ```
4. Levanta Docker.

Para probar la evolución en un entorno limpio sin ensuciar tu base de datos de trabajo, usa:
```bash
./demo/demo-evolucion.sh
```
