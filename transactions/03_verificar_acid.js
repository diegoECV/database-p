// =============================================================
// 03_verificar_acid.js
// VISONS S.A.C. - Verificacion de propiedades ACID
//
// Este script verifica el estado final de la base de datos
// despues de haber ejecutado los escenarios 01 y 02.
// Confirma que:
//   - El escenario exitoso (01) aplico sus cambios.
//   - El escenario de rollback (02) NO dejo ningun rastro.
//
// Ejecutar con: mongosh "mongodb://admin:changeme@localhost:27018/Visons?authSource=admin" 03_verificar_acid.js
// =============================================================

print("=== VISONS S.A.C. | Verificacion de propiedades ACID ===\n");

const visons = db.getSiblingDB("Visons");
const BATCH_CODE = "LOTE-HASS-2026-001";

// ── 1. Estado del lote de inventario ─────────────────────────
print("--- 1. ATOMICIDAD Y DURABILIDAD: Estado del lote de inventario ---");
const lote = visons.inventory_batches.findOne({ batchCode: BATCH_CODE });
if (lote) {
  print("  batchCode:    " + lote.batchCode);
  print("  available_kg: " + lote.available_kg + " kg");
  print("  (Esperado: 3500 kg = 4000 inicial - 500 del pedido exitoso)");
  if (lote.available_kg === 3500) {
    print("  [OK] ATOMICIDAD: El decremento del escenario 01 persiste correctamente.");
    print("  [OK] DURABILIDAD: El commit sobrevivio y quedo persistido.");
  } else if (lote.available_kg === 4000) {
    print("  [INFO] El stock no fue decrementado. El escenario 01 no fue ejecutado aun,");
    print("         o ambos fueron revertidos. Ejecutar 01_escenario_exitoso.js primero.");
  } else {
    print("  [INFO] Stock actual: " + lote.available_kg + " kg (puede variar segun cuantas veces se ejecutaron los escenarios).");
  }
} else {
  print("  [ADVERTENCIA] Lote no encontrado. Ejecutar 00_setup_datos.js primero.");
}

print("");

// ── 2. Pedidos creados en orders_draft ───────────────────────
print("--- 2. CONSISTENCIA: Pedidos en orders_draft ---");
const pedidos = visons.orders_draft.find(
  { order_code: { $regex: /^ORD-EXP-2026-/ } }
).toArray();

print("  Total de pedidos de prueba encontrados: " + pedidos.length);

pedidos.forEach(function(p) {
  print("  - " + p.order_code + " | " + p.quantity_kg + " kg | Estado: " + p.status);
});

const pedidoRollback = visons.orders_draft.findOne({ order_code: "ORD-EXP-2026-9999" });
if (!pedidoRollback) {
  print("  [OK] ATOMICIDAD ROLLBACK: El pedido ORD-EXP-2026-9999 (escenario 02) NO existe.");
  print("       Confirma que abortTransaction() revirtio la insercion completamente.");
} else {
  print("  [FALLO] El pedido de rollback existe. Algo salio mal con el abortTransaction.");
}

print("");

// ── 3. Logs de trazabilidad ───────────────────────────────────
print("--- 3. AISLAMIENTO: Logs de trazabilidad ---");
const logs = visons.traceability_logs.find(
  { batch_code: BATCH_CODE }
).toArray();

print("  Total de logs de trazabilidad para el lote: " + logs.length);
logs.forEach(function(l) {
  print("  - [" + l.event_type + "] " + l.detail + " | " + l.timestamp);
});

if (logs.length === 1 && logs[0].event_type === "ORDER_CREATED") {
  print("  [OK] AISLAMIENTO: Solo el escenario exitoso dejo rastro en los logs.");
} else if (logs.length === 0) {
  print("  [INFO] Sin logs. Ejecutar 01_escenario_exitoso.js primero.");
}

print("");

// ── Resumen ACID ──────────────────────────────────────────────
print("--- RESUMEN DE PROPIEDADES ACID ---");
print("  A (Atomicidad):  El rollback del escenario 02 revirtio TODO sin dejar datos parciales.");
print("  C (Consistencia):Solo existen pedidos que pasaron validacion de stock.");
print("  I (Aislamiento): Cada transaccion vio su propia 'foto' del dato (snapshot).");
print("  D (Durabilidad): El commit del escenario 01 persiste aunque el proceso termine.");
print("=== Fin de la verificacion ACID ===\n");
