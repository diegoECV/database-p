# Proyecto: Persistencia Políglota - Visons S.A.C.

Este repositorio contiene la arquitectura, automatización y el control de versiones de las bases de datos para el sistema de agroexportación Visons, implementando un modelo de Persistencia Políglota usando **SQL Server** y **MongoDB**.

## Información Académica

- **Carrera:** Análisis de Sistemas Empresariales
- **Semestre:** Semestre 4
- **Año:** 2026

## Equipo de Desarrollo

- Quispe Suarez, Lizeth
- Centeno Vivas, Diego
- Quispe Bustinza, Camila

---

## Estructura del Repositorio

- `db/sqlserver/`: Migraciones y scripts (bootstrap, changes, metadata, checks) para la base de datos relacional.
- `db/mongodb/`: Migraciones y scripts (bootstrap, changes, metadata, checks) para la base de datos NoSQL.
- `check/`: Aplicación en Java que verifica el "Contrato de Datos" y la salud de las bases de datos.
- `demo/`: Scripts de inicialización rápida (`demo-inicio.sh` y `demo-evolucion.sh`).
- `docs/`: Manuales detallados sobre cómo inicializar y evolucionar la base de datos en entornos locales.

## Inicio Rápido

Para levantar las bases de datos en modo interactivo y de evaluación (limpia el entorno, compila imágenes y lanza validaciones), ejecuta:

```bash
cp .env.example .env
./demo/demo-inicio.sh
```

*(Si eres de Frontend o solo buscas conectarte rápidamente sin validaciones adicionales, revisa la guía en `docs/USO_LOCAL_SIN_CAMBIOS.md`)*.
