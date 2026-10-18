# Uso local sin cambios al repositorio

Esta guia explica como levantar la base de datos localmente para desarrollo
sin modificar el repositorio remoto.

## Levantar todo con Docker Compose

```sh
cp .env.example .env
# Editar .env con los valores locales
docker compose up
```

## Conectarte manualmente

### MongoDB
- Host: localhost
- Puerto: 27017
- Base de datos: Visons
- Usuario: el definido en APP_USER del .env

### SQL Server
- Host: localhost
- Puerto: 1433
- Base de datos: Visons
- Usuario: sa
- Password: el definido en SA_PASSWORD del .env

## Reiniciar la base de datos desde cero

Si necesitas empezar de cero (destruye todos los datos):

```sh
docker compose down -v
docker compose up --build
```
