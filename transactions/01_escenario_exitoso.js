// =============================================================
// 01_escenario_exitoso.js
// VISONS S.A.C. - Transacciones ACID en MongoDB
//
// Escenario: Registro de un pedido de exportacion de palta Hass.
// Pasos dentro de la transaccion:
//   1. Verificar que existe stock suficiente en inventory_batches.
//   2. Decrementar el stock del lote correspondiente.
//   3. Insertar el pedido en la coleccion orders_draft.
//   4. Registrar la operacion en traceability_logs (auditoria).
//
// Si todos los pasos tienen exito → commitTransaction().
//
// Requisito: MongoDB corriendo en modo Replica Set (rs0).
// Ejecutar con: mongosh --host localhost:27018 -u admin -p changeme
//               --authenticationDatabase admin 01_escenario_exitoso.js
// =============================================================

print("=== VISONS S.A.C. | Escenario Exitoso: Pedido de Exportacion ===");

const session = db.getMongo().startSession();
session.startTransaction({
  readConcern:  { level: "snapshot" },
  writeConcern: { w: "majority" }
});

try {
  const visons = session.getDatabase("Visons");
  const batches = visons.getCollection("inventory_batches");
  const ordersDraft = visons.getCollection("orders_draft");
  const traceability = visons.getCollection("traceability_logs");

  // ── Paso 1: Verificar stock disponible ───────────────────────
  const BATCH_CODE    = "LOTE-HASS-2026-001";
  const CANTIDAD_REQUERIDA_KG = 500;

  const lote = batches.findOne(
    { batchCode: BATCH_CODE },
    { session }
  );

  if (!lote) {
    throw new Error("Lote '" + BATCH_CODE + "' no encontrado en inventario.");
  }

  print("  [1] Stock actual del lote: " + lote.available_kg + " kg");

  if (lote.available_kg < CANTIDAD_REQUERIDA_KG) {
    throw new Error(
      "Stock insuficiente. Disponible: " + lote.available_kg +
      " kg, requerido: " + CANTIDAD_REQUERIDA_KG + " kg."
    );
  }

  // ── Paso 2: Decrementar el stock ─────────────────────────────
  const resUpdate = batches.updateOne(
    { batchCode: BATCH_CODE, available_kg: { $gte: CANTIDAD_REQUERIDA_KG } },
    { $inc: { available_kg: -CANTIDAD_REQUERIDA_KG } },
    { session }
  );

  if (resUpdate.modifiedCount !== 1) {
    throw new Error("No se pudo decrementar el stock (posible condicion de carrera).");
  }

  print("  [2] Stock decrementado correctamente. -" + CANTIDAD_REQUERIDA_KG + " kg.");

  // ── Paso 3: Insertar borrador de pedido ──────────────────────
  const nuevoPedido = {
    order_code:    "ORD-EXP-2026-0042",
    client_id:     "CLI-US-WALMART-001",
    product_id:    lote.product_id,
    batch_code:    BATCH_CODE,
    quantity_kg:   CANTIDAD_REQUERIDA_KG,
    unit_price_usd: 2.85,
    total_value:   CANTIDAD_REQUERIDA_KG * 2.85,
    incoterm:      "FOB",
    status:        "DRAFT",
    created_at:    new Date()
  };

  const resInsert = ordersDraft.insertOne(nuevoPedido, { session });
  print("  [3] Pedido borrador insertado con _id: " + resInsert.insertedId);

  // ── Paso 4: Registrar en traceabilidad (auditoria) ───────────
  traceability.insertOne({
    event_type:  "ORDER_CREATED",
    entity:      "orders_draft",
    entity_id:   resInsert.insertedId.toString(),
    batch_code:  BATCH_CODE,
    actor:       "sistema",
    detail:      "Pedido " + nuevoPedido.order_code + " creado. Stock reducido en " + CANTIDAD_REQUERIDA_KG + " kg.",
    timestamp:   new Date()
  }, { session });

  print("  [4] Evento de trazabilidad registrado.");

  // ── Commit: aplica todos los cambios de forma atomica ────────
  session.commitTransaction();
  print("\n  [OK] commitTransaction() exitoso.");
  print("  Todos los cambios quedaron persistidos en MongoDB.");

} catch (error) {
  // ── Abort: revierte absolutamente todo ───────────────────────
  session.abortTransaction();
  print("\n  [ERROR] abortTransaction() ejecutado. Causa: " + error.message);
  print("  Ningun documento fue modificado en la base de datos.");
} finally {
  session.endSession();
  print("=== Fin del escenario exitoso ===\n");
}
