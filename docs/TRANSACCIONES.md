# Transacciones ACID en MongoDB — VISONS S.A.C.

## ¿Qué significan las siglas ACID?

Las siglas **ACID** representan las cuatro propiedades que debe garantizar un sistema
de gestión de base de datos para asegurar la **integridad de los datos** ante fallos
de hardware, errores de software o accesos concurrentes simultáneos.

| Propiedad | Significado | Cómo lo garantiza MongoDB |
|:---:|:---|:---|
| **A** Atomicidad | O todas las operaciones de una transacción se ejecutan, o ninguna. No existe un estado intermedio. | `session.commitTransaction()` aplica todo. `session.abortTransaction()` revierte todo. |
| **C** Consistencia | La base de datos pasa de un estado válido a otro estado válido, respetando reglas de esquema y negocio. | Los validadores `$jsonSchema` rechazan documentos inválidos. Las reglas de negocio se validan antes del commit. |
| **I** Aislamiento | Las transacciones concurrentes no se interfieren entre sí ni leen datos a medio escribir. | MongoDB usa nivel `snapshot` en transacciones: cada sesión ve una foto del dato al momento de iniciar. |
| **D** Durabilidad | Una vez confirmado el commit, los datos sobreviven a caídas del servidor o reinicios del proceso. | El `writeConcern: { w: "majority" }` garantiza que los datos están escritos en disco antes de confirmar el commit. |

### ¿Por qué son vitales en una plataforma de exportación (VISONS S.A.C.)?

En un sistema como VISONS S.A.C. que gestiona exportación de frutas, las consecuencias
de violar ACID son directamente económicas y legales:

- **Sin Atomicidad**: Un pedido podría quedar registrado sin que el stock se descuente
  (sobreventa de lotes), o el stock descontarse sin que el pedido exista.
- **Sin Consistencia**: Podrían registrarse pedidos de frutas vencidas o con
  certificados sanitarios caducados.
- **Sin Aislamiento**: Dos operadores simultáneos podrían vender el mismo lote de
  palta Hass, generando compromisos imposibles de cumplir con clientes internacionales.
- **Sin Durabilidad**: Un reinicio del servidor podría perder un pedido de exportación
  ya confirmado por el cliente, generando disputas comerciales.

---

## Transacciones multi-documento en MongoDB

### Requisito: Replica Set

MongoDB **solo soporta transacciones multi-documento** cuando está configurado en
modo **Replica Set** (o Sharded Cluster). Un servidor standalone rechaza la llamada
con el error:

```
MongoServerError: Transaction numbers are only allowed on a replica set member or mongos
```

Para desarrollo local, un Replica Set de **un solo nodo** (`--replSet rs0`) es
completamente válido y no requiere múltiples servidores.

### ¿Qué es una `ClientSession`?

Una `ClientSession` es un **contexto lógico de conexión** que agrupa una o más
operaciones de lectura/escritura en MongoDB bajo una misma identidad coordinada.
Permite al motor de base de datos:

1. Asignar un **identificador de transacción** único.
2. Llevar registro de las operaciones pendientes de confirmación.
3. Aplicar el **nivel de aislamiento** configurado (`snapshot`, `majority`, etc.).
4. Coordinar el **bloqueo** y la **visibilidad** de datos entre sesiones concurrentes.

```javascript
// Crear una sesión explícita
const session = db.getMongo().startSession();
```

### Ciclo de vida de una transacción

```
session.startTransaction()   ← Inicia la transacción
     │
     ├─ operacion1 (insertOne, updateOne, ...) con { session }
     ├─ operacion2 (findOne, updateOne, ...)   con { session }
     ├─ operacion3 (insertOne, ...)            con { session }
     │
     ├─ ¿Todo bien?  → session.commitTransaction()   ✓ Aplica TODO de forma atómica
     └─ ¿Hubo error? → session.abortTransaction()    ✗ Revierte TODO sin dejar rastro
     
session.endSession()         ← Libera los recursos de la sesión
```

### `startTransaction()`

Inicia la delimitación transaccional sobre la sesión activa. A partir de este punto,
**todas** las operaciones que incluyan `{ session }` forman parte del mismo bloque atómico.

```javascript
session.startTransaction({
  readConcern:  { level: "snapshot" },  // Cada sesión ve una foto consistente del dato
  writeConcern: { w: "majority" }       // El commit requiere confirmación de la mayoría
});
```

- **`readConcern: snapshot`**: La sesión lee el estado de los datos tal como estaban
  al inicio de la transacción. No ve cambios de otras sesiones concurrentes que aún
  no han hecho commit. Esto implementa el **Aislamiento**.
- **`writeConcern: majority`**: El commit solo se confirma cuando la mayoría de los
  nodos del Replica Set han escrito los datos en disco. Esto implementa la **Durabilidad**.

### `commitTransaction()`

Aplica **de forma atómica y permanente** todas las operaciones acumuladas desde
`startTransaction()`. Hasta que se llama `commitTransaction()`:

- Ninguna otra sesión ve los cambios intermedios.
- Los bloqueos sobre los documentos afectados se mantienen activos.
- Si el proceso cae en este momento, MongoDB revierte automáticamente los cambios
  pendientes al reiniciar.

```javascript
session.commitTransaction();
// A partir de aquí, los cambios son visibles para todas las sesiones
// y están garantizados en disco (durabilidad).
```

### `abortTransaction()`

Revierte **completamente** todas las operaciones de la transacción. La base de datos
queda exactamente en el mismo estado que antes de `startTransaction()`. No quedan
documentos modificados, insertados ni eliminados a medias.

```javascript
session.abortTransaction();
// La BD queda idéntica a antes de startTransaction()
// Atomicidad garantizada.
```

---

## Comportamiento de los bloqueos (*locks*) durante una transacción abierta

Mientras una transacción está activa (entre `startTransaction()` y `commit/abort`),
MongoDB usa el motor de almacenamiento **WiredTiger**, que implementa bloqueo a nivel
de **documento** (*document-level locking*), no a nivel de colección o base de datos.

### Tipos de bloqueos en WiredTiger

| Bloqueo | Nivel | Adquirido por | Efecto |
|:---|:---|:---|:---|
| `IS` (Intent Shared) | Colección / BD | Lecturas transaccionales | Permite otras lecturas simultáneas |
| `IX` (Intent Exclusive) | Colección / BD | Escrituras transaccionales | Señaliza intención de escritura |
| Exclusivo de documento | Documento | Cada `updateOne`/`insertOne` | Bloquea ese documento específico |

### ¿Qué ocurre si dos transacciones intentan modificar el mismo documento?

WiredTiger usa **bloqueo optimista** a nivel de documento. Si dos sesiones concurrentes
intentan modificar el mismo documento:

1. La primera que llega adquiere el bloqueo de escritura.
2. La segunda detecta el conflicto y recibe un **`WriteConflictException`**.
3. MongoDB aborta automáticamente la segunda transacción.
4. El driver puede configurarse para **reintentar** la transacción abortada.

```
Sesión A: updateOne(lote, { $inc: { stock: -500 } })  ← gana el bloqueo
Sesión B: updateOne(lote, { $inc: { stock: -300 } })  ← WriteConflictException → abort
```

Esto garantiza que **nunca** dos transacciones apliquen simultáneamente cambios al
mismo documento, previniendo la sobreventa de lotes en VISONS S.A.C.

---

## Casuística aplicada: VISONS S.A.C.

### Escenario 1 — Registro de pedido de exportación (commit exitoso)

**Contexto de negocio**: Un operador registra un pedido de exportación de 500 kg de
Palta Hass para el cliente WALMART-US. La operación debe ser atómica:

```
startTransaction()
  1. Verificar stock en inventory_batches      (read  - snapshot)
  2. Decrementar stock del lote                (write - bloqueo exclusivo)
  3. Insertar borrador de pedido en orders_draft (write)
  4. Registrar evento en traceability_logs     (write - auditoría)
commitTransaction()   → Todo queda persistido, bloqueos liberados
```

**Garantía**: Si el proceso cae entre los pasos 2 y 3, MongoDB revierte el decremento.
El stock nunca queda decrementado sin que exista el pedido asociado.

### Escenario 2 — Pedido rechazado por stock insuficiente (abort / rollback)

**Contexto de negocio**: Un operador intenta pedir 99,999 kg cuando el lote solo tiene
3,500 kg disponibles. La regla de negocio detecta el problema y aborta.

```
startTransaction()
  1. Verificar stock → 3,500 kg disponibles
  2. Cantidad solicitada: 99,999 kg → REGLA VIOLADA
  3. throw new Error("Stock insuficiente")
abortTransaction()    → NADA fue modificado
```

**Garantía**: No existe ningún pedido parcial, el stock no fue alterado, y no hay
ningún log de trazabilidad que registre una operación que no ocurrió.

---

## Scripts del repositorio

| Archivo | Propósito |
|:---|:---|
| [`transactions/00_setup_datos.js`](../transactions/00_setup_datos.js) | Crea/reinicia el lote de prueba (4000 kg de Palta Hass) |
| [`transactions/01_escenario_exitoso.js`](../transactions/01_escenario_exitoso.js) | Transacción con `commitTransaction()` exitoso |
| [`transactions/02_escenario_rollback.js`](../transactions/02_escenario_rollback.js) | Transacción con `abortTransaction()` por stock insuficiente |
| [`transactions/03_verificar_acid.js`](../transactions/03_verificar_acid.js) | Consultas de verificación del estado final (propiedades ACID) |
| [`compose.transactions.yaml`](../compose.transactions.yaml) | Docker Compose con MongoDB en Replica Set rs0 |
| [`demo/demo-transacciones.sh`](../demo/demo-transacciones.sh) | Script de demo completo para el video |

## Ejecución rápida

```bash
# Opción A: Demo automática completa (recomendada para el video)
./demo/demo-transacciones.sh

# Opción B: Manual paso a paso
docker compose -f compose.transactions.yaml up mongodb-rs rs-init -d
sleep 20   # esperar al Primary del Replica Set

URI="mongodb://admin:changeme@localhost:27018/Visons?authSource=admin&replicaSet=rs0"
mongosh "$URI" transactions/00_setup_datos.js
mongosh "$URI" transactions/01_escenario_exitoso.js
mongosh "$URI" transactions/02_escenario_rollback.js
mongosh "$URI" transactions/03_verificar_acid.js

# Limpiar al terminar
./demo/demo-transacciones.sh cleanup
```
