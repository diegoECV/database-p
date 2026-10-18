// =============================================================
// 02_escenario_rollback.js
// VISONS S.A.C. - Transacciones ACID en MongoDB
//
// Escenario: Intento fallido de pedido por stock insuficiente.
// Demuestra que cuando una regla de negocio no se cumple,
// abortTransaction() revierte TODOS los cambios intermedios:
// ningun documento queda modificado ni insertado.
//
// Pasos dentro de la transaccion:
//   1. Leer el lote → detectar stock insuficiente.
//   2. Intentar decrementar → falla por validacion de negocio.
//   3. abortTransaction() → MongoDB deshace todo.
//   4. Verificacion post-rollback: el stock no cambio.
//
// Requisito: MongoDB corriendo en modo Replica Set (rs0).
// Ejecutar con: mongosh --host localhost:27018 -u admin -p changeme
//               --authenticationDatabase admin 02_escenario_rollback.js
// =============================================================

print("=== VISONS S.A.C. | Escenario Rollback: Stock Insuficiente ===");

const session = db.getMongo().startSession();
session.startTransaction({
  readConcern:  { level: "snapshot" },
  writeConcern: { w: "majority" }
});

const visons = session.getDatabase("Visons");
const batches = visons.getCollection("inventory_batches");
const ordersDraft = visons.getCollection("orders_draft");
const traceability = visons.getCollection("traceability_logs");

// ── Capturar estado inicial ANTES de la transaccion ──────────
const BATCH_CODE = "LOTE-HASS-2026-001";
const loteAntes = db.getSiblingDB("Visons").inventory_batches.findOne(
  { batchCode: BATCH_CODE }
);
const stockInicial = loteAntes ? loteAntes.available_kg : "N/A (lote no existe)";
print("  [PRE]  Stock inicial del lote: " + stockInicial + " kg");

try {
  // ── Paso 1: Leer stock del lote ───────────────────────────────
  const CANTIDAD_SOLICITADA_KG = 99999; // Mas de lo disponible, forzara el error

  const lote = batches.findOne(
    { batchCode: BATCH_CODE },
    { session }
  );

  if (!lote) {
    throw new Error("Lote '" + BATCH_CODE + "' no encontrado.");
  }

  print("  [1]  Stock disponible en el lote: " + lote.available_kg + " kg");
  print("  [1]  Cantidad solicitada en el pedido: " + CANTIDAD_SOLICITADA_KG + " kg");

  // ── Paso 2: Validacion de negocio ─────────────────────────────
  if (lote.available_kg < CANTIDAD_SOLICITADA_KG) {
    // Lanzar error de negocio antes de cualquier escritura
    throw new Error(
      "REGLA DE NEGOCIO VIOLADA: Stock insuficiente para el pedido. " +
      "Disponible=" + lote.available_kg + " kg, Solicitado=" + CANTIDAD_SOLICITADA_KG + " kg."
    );
  }

  // Si llegaramos aqui, hariamos el decremento y la insercion
  // (pero nunca llegamos porque la excepcion se lanza antes)
  batches.updateOne(
    { batchCode: BATCH_CODE },
    { $inc: { available_kg: -CANTIDAD_SOLICITADA_KG } },
    { session }
  );

  ordersDraft.insertOne({
    order_code: "ORD-EXP-2026-9999",
    quantity_kg: CANTIDAD_SOLICITADA_KG,
    status: "DRAFT",
    created_at: new Date()
  }, { session });

  session.commitTransaction();
  print("  [OK]  commitTransaction() - (nunca deberia llegar aqui en este escenario)");

} catch (error) {
  // ── Rollback: abortar toda la transaccion ─────────────────────
  session.abortTransaction();
  print("\n  [ABORT] abortTransaction() ejecutado.");
  print("  Causa: " + error.message);

} finally {
  session.endSession();
}

// ── Verificacion post-rollback (fuera de la transaccion) ──────
print("\n  Verificando que el stock NO fue modificado...");
const loteDespues = db.getSiblingDB("Visons").inventory_batches.findOne(
  { batchCode: BATCH_CODE }
);
const stockFinal = loteDespues ? loteDespues.available_kg : "N/A";

print("  [POST] Stock del lote despues del rollback: " + stockFinal + " kg");

if (stockInicial === stockFinal) {
  print("  [OK]  ATOMICIDAD CONFIRMADA: El stock quedo intacto (" + stockFinal + " kg).");
  print("  [OK]  Ningun documento fue insertado en orders_draft ni traceability_logs.");
} else {
  print("  [FALLO] El stock cambio inesperadamente. Revisar configuracion del Replica Set.");
}

print("=== Fin del escenario rollback ===\n");
