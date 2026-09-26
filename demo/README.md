# Scripts de demostración

## demo-inicio.sh

Levanta todos los servicios desde cero en un proyecto Docker aislado, aplica el bootstrap (V001) y todos los cambios versionados, y verifica el contrato de las 22 tablas mediante el checker de persistencia (Java).

```sh
./demo/demo-inicio.sh          # Inicia la demo (SQL Server + MongoDB + Checker)
./demo/demo-inicio.sh cleanup  # Elimina el proyecto y sus volúmenes (Limpieza)
```

## demo-evolucion.sh

Demuestra cómo agregar un nuevo cambio al esquema (V002) sin borrar los datos existentes. En este proyecto Visons, aplica el cambio `V002__add_status_description.sql` en SQL Server y `V002__add_description.js` en MongoDB.

```sh
./demo/demo-evolucion.sh       # Construye y aplica los cambios (V002) localmente sin destruir V001
```
