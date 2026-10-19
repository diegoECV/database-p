// V003__add_missing_collections.js
var adminDb = db.getSiblingDB('admin');
if (!adminDb.auth(process.env.MONGO_ADMIN_USER, process.env.MONGO_ADMIN_PASSWORD)) {
  throw Error('No se pudo autenticar el administrador MongoDB');
}
var visonsDb = db.getSiblingDB(process.env.MONGO_DATABASE);

print('Aplicando cambio V003 - Creacion de colecciones faltantes (para un total de 27 tablas/colecciones)');

visonsDb.createCollection("assignment_tracking");
visonsDb.assignment_tracking.createIndex({ assignment_id: 1 });

visonsDb.createCollection("batch_inspections");
visonsDb.batch_inspections.createIndex({ batch_id: 1 });

visonsDb.createCollection("order_tracking");
visonsDb.order_tracking.createIndex({ order_id: 1 });

// Datos Semilla
visonsDb.assignment_tracking.insertMany(Array.from({length: 10}, (_, i) => ({ assignment_id: i+1, assigned_by: "U-001", action: "CREATED", timestamp: new Date() })));
visonsDb.batch_inspections.insertMany(Array.from({length: 10}, (_, i) => ({ batch_id: "BATCH-00" + (i+1), parameters: { brix: 12.5, firmness: "Good" }, inspected_at: new Date() })));
visonsDb.order_tracking.insertMany(Array.from({length: 10}, (_, i) => ({ order_id: i+1, previous_status: "PENDING", new_status: "PROCESSING", changed_by: "System", timestamp: new Date() })));

print('[SUCCESS] V003__add_missing_collections.js aplicado exitosamente.');
