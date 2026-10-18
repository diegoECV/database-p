# Como agregar un cambio nuevo al esquema

Este documento explica el proceso para agregar una nueva migracion
de base de datos al proyecto de forma segura y trazable.

## Regla principal

Nunca se modifican los archivos `V00X__*.js` o `V00X__*.sql` ya existentes.
Cada nuevo cambio siempre va en un archivo nuevo con el siguiente numero de version.

## Pasos para MongoDB

1. Crea un nuevo archivo en `db/mongodb/changes/` con el siguiente numero:

```
db/mongodb/changes/V004__nombre_descriptivo.js
```

2. Escribe el script de cambio. Por ejemplo:

```javascript
var visonsDb = db.getSiblingDB('Visons');
visonsDb.products.createIndex({ barcode: 1 }, { unique: true, sparse: true });
print('[SUCCESS] V004 aplicado.');
```

3. Actualiza el archivo `mongodb/checks/contract.js` para que verifique
el nuevo indice o coleccion si es necesario.

4. Haz commit y push. El CI/CD aplicara el cambio automaticamente.

## Pasos para SQL Server

El proceso es identico pero en la carpeta `db/sqlserver/changes/` con extension `.sql`.

## Importante

Si el checksum de un archivo ya aplicado cambia, el sistema lanzara un error
y detendra la ejecucion para proteger la integridad del historial.
