# Inicializacion del proyecto desde cero

Esta guia explica como levantar la base de datos del proyecto VISONS S.A.C.
por primera vez en una maquina nueva.

## Requisitos previos

- Docker y Docker Compose instalados
- Acceso a la red del proyecto o ejecucion local

## Pasos

1. Copiar el archivo de variables de entorno:

```sh
cp .env.example .env
```

2. Editar el archivo `.env` con las credenciales reales.

3. Levantar los contenedores:

```sh
docker compose up --build
```

Los contenedores de MongoDB y SQL Server ejecutaran automaticamente sus
respectivos `run.sh`, que aplicaran el bootstrap y todos los cambios
versionados pendientes en orden.

## Verificar que todo este en orden

Para verificar el estado del esquema sin aplicar cambios:

```sh
# MongoDB
docker compose run mongodb-db verify

# SQL Server
docker compose run sqlserver-db verify
```

Si todo esta correcto, veras el mensaje `contrato version X verificado correctamente`.
