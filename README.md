# Proyecto: Persistencia Políglota - Visons S.A.C.

Este repositorio contiene la arquitectura, automatización, control de versiones y transacciones de las bases de datos para el sistema de agroexportación **Visons S.A.C.**, implementando un modelo de Persistencia Políglota usando **SQL Server** y **MongoDB**.

## Información Académica

- **Carrera:** Análisis de Sistemas Empresariales
- **Semestre:** Semestre 4
- **Año:** 2026
- **Curso:** Gestión de Base de Datos (GBD) | **Sección:** T04

## Equipo de Desarrollo

- Quispe Suarez, Lizeth
- Centeno Vivas, Diego
- Quispe Bustinza, Camila

---

## 🏛️ Arquitectura de Datos (27 Entidades de Negocio)

Este repositorio gestiona de forma automatizada las **27 entidades de negocio** del sistema, divididas estratégicamente según su carga y necesidad de consistencia:

### 1. SQL Server (Transaccional - 11 Tablas)
Maneja operaciones críticas que requieren fuerte consistencia ACID y transaccionalidad relacional:
1. `ORDERS` | 2. `ORDER_DETAILS` | 3. `PAYMENTS` | 4. `INVOICES`
5. `SHIPMENTS` | 6. `SHIPMENT_ITEMS` | 7. `CERTIFICATES` | 8. `CUSTOMS_DECLARATIONS`
9. `AUDIT_LOGS` | 10. `ASSIGNMENTS` | 11. `BATCHES`

### 2. MongoDB (Catálogos, Trazabilidad y Logs - 16 Colecciones)
Maneja grandes volúmenes de datos flexibles, reportes y métricas IoT:
1. `categories` | 2. `products` | 3. `users` | 4. `clients` | 5. `providers`
6. `inventory_batches` | 7. `price_lists` | 8. `quality_inspections`
9. `batch_inspections` | 10. `temperature_logs` | 11. `traceability_logs`
12. `order_tracking` | 13. `assignment_tracking` | 14. `email_verifications`
15. `revoked_tokens` | 16. `rate_limits`

---

## 📂 Estructura del Repositorio

```text
database-p/
├── db/
│   ├── sqlserver/            # Migraciones y scripts para SQL Server (11 tablas)
│   └── mongodb/              # Migraciones y scripts para MongoDB (16 colecciones)
├── liquibase/                # Motor de versionamiento empresarial con Liquibase
│   ├── Dockerfile            # Liquibase 4.33 + extension MongoDB + drivers
│   ├── sqlserver/            # Changelogs YAML/SQL para SQL Server
│   ├── mongodb/              # Changelogs YAML para MongoDB
│   └── evolucion/            # Changesets de prueba para evolucion en vivo
├── transactions/             # Scripts de Transacciones ACID multi-documento (Mongo Replica Set)
│   ├── 00_setup_datos.js
│   ├── 01_escenario_exitoso.js
│   ├── 02_escenario_rollback.js
│   └── 03_verificar_acid.js
├── check/                    # Verificador de salud y contrato de datos en Java
├── demo/                     # Scripts de demostración automatizada
│   ├── demo-inicio.sh        # Arranque e inicialización estándar
│   ├── demo-evolucion.sh     # Demostración de evolución incremental
│   ├── demo-liquibase.sh     # Demostración de Liquibase (arranque + evolución 005)
│   └── demo-transacciones.sh # Demostración de Transacciones ACID en MongoDB
├── docs/                     # Documentación técnica y manuales paso a paso
│   ├── TRANSACCIONES.md      # Guía completa sobre ACID y Replica Sets
│   ├── architecture.md       # Arquitectura y distribución de entidades
│   ├── data-ownership.md     # Responsabilidades y dominios de datos
│   ├── INICIALIZACION.md     # Guía de inicio desde cero
│   ├── EVOLUCION.md          # Guía de cómo agregar nuevas versiones
│   └── USO_LOCAL.md          # Conexión local sin validaciones
├── compose.yaml              # Orquestador estándar de bases de datos
├── compose.liquibase.yaml    # Orquestador para migraciones con Liquibase
├── compose.transactions.yaml # Orquestador para Replica Set y transacciones ACID
└── compose.tools.yaml        # Mapeo de puertos para herramientas de escritorio
```

---

## 🚀 Modos de Ejecución

### 1. Arranque Estándar (Entorno Local)

Para levantar el ecosistema completo y verificar la salud de las bases de datos:

```bash
cp .env.example .env
./demo/demo-inicio.sh
```

Para aplicar cambios incrementales:
```bash
./demo/demo-evolucion.sh
```

---

### 2. Versionamiento con Liquibase (SQL Server + MongoDB)

Liquibase gestiona de forma auditada el esquema de las **27 entidades** mediante changesets declarativos en YAML y SQL con checksums:

```bash
# Inicializar desde cero y aplicar todos los changesets
docker compose -f compose.liquibase.yaml up --build

# O ejecutar la demo automatizada completa:
./demo/demo-liquibase.sh
./demo/demo-liquibase.sh cleanup
```

---

### 3. Transacciones ACID Multi-documento en MongoDB

Demuestra el funcionamiento de `startTransaction()`, `commitTransaction()` y `abortTransaction()` sobre un Replica Set local (`rs0`).

```bash
# Demo automatica completa (Replica Set + 3 escenarios + verificacion ACID)
./demo/demo-transacciones.sh
./demo/demo-transacciones.sh cleanup

# O manual paso a paso:
docker compose -f compose.transactions.yaml up mongodb-rs rs-init -d
URI="mongodb://admin:adminpassword@localhost:27018/Visons?authSource=admin&replicaSet=rs0"
mongosh "$URI" transactions/00_setup_datos.js
mongosh "$URI" transactions/01_escenario_exitoso.js
mongosh "$URI" transactions/02_escenario_rollback.js
mongosh "$URI" transactions/03_verificar_acid.js
```
