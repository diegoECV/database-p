// =============================================================
// 00_setup_datos.js
// VISONS S.A.C. - Preparacion de datos de prueba para transacciones
//
// Este script debe ejecutarse UNA VEZ antes de correr los escenarios
// 01_escenario_exitoso.js y 02_escenario_rollback.js.
// Crea los documentos iniciales que las transacciones necesitan
// para funcionar (lote de inventario y colecciones auxiliares).
//
// Ejecutar con: mongosh "mongodb://admin:changeme@localhost:27018/Visons?authSource=admin" 00_setup_datos.js
// =============================================================

print("=== VISONS S.A.C. | Setup de datos de prueba para transacciones ===");

const visons = db.getSiblingDB("Visons");

// ── Asegurar existencia de colecciones necesarias ─────────────
const colecciones = visons.getCollectionNames();

if (!colecciones.includes("inventory_batches")) {
  visons.createCollection("inventory_batches");
  print("  [+] Coleccion 'inventory_batches' creada.");
}

if (!colecciones.includes("orders_draft")) {
  visons.createCollection("orders_draft");
  print("  [+] Coleccion 'orders_draft' creada.");
}

if (!colecciones.includes("traceability_logs")) {
  visons.createCollection("traceability_logs");
  print("  [+] Coleccion 'traceability_logs' creada.");
}

// ── Insertar o reinicializar el lote de prueba ────────────────
const BATCH_CODE = "LOTE-HASS-2026-001";

visons.inventory_batches.deleteOne({ batchCode: BATCH_CODE });

visons.inventory_batches.insertOne({
  batchCode:      BATCH_CODE,
  product_id:     2,                // ID del producto Palta Hass (seeds)
  product_name:   "Palta Hass",
  provider_id:    "PROV-PE-001",
  quantity_boxes: 500,
  available_kg:   4000,             // Stock inicial: 4000 kg disponibles
  harvest_date:   new Date("2026-09-15"),
  expiration_date: new Date("2026-11-15"),
  quality_grade:  "A",
  status:         "DISPONIBLE",
  created_at:     new Date()
});

print("  [+] Lote '" + BATCH_CODE + "' creado con 4000 kg de stock.");

// ── Limpiar pedidos y logs de pruebas anteriores ─────────────
const deletedOrders = visons.orders_draft.deleteMany({
  order_code: { $regex: /^ORD-EXP-2026-/ }
});
const deletedLogs = visons.traceability_logs.deleteMany({
  batch_code: BATCH_CODE
});

print("  [~] Pedidos de prueba eliminados: " + deletedOrders.deletedCount);
print("  [~] Logs de prueba eliminados:    " + deletedLogs.deletedCount);

// ── Resumen del estado inicial ────────────────────────────────
const lote = visons.inventory_batches.findOne({ batchCode: BATCH_CODE });
print("\n  Estado inicial del lote:");
print("    batchCode:    " + lote.batchCode);
print("    product_name: " + lote.product_name);
print("    available_kg: " + lote.available_kg + " kg");
print("    status:       " + lote.status);

print("\n  [OK] Datos de prueba listos. Ahora puede ejecutar:");
print("       mongosh ... 01_escenario_exitoso.js");
print("       mongosh ... 02_escenario_rollback.js");
print("=== Fin del setup ===\n");
