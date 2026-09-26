// V001__baseline.js
// Creacion explicita de colecciones, indices y datos semilla para MongoDB
var adminDb = db.getSiblingDB('admin');
if (!adminDb.auth(process.env.MONGO_ADMIN_USER, process.env.MONGO_ADMIN_PASSWORD)) {
  throw Error('No se pudo autenticar el administrador MongoDB');
}
var visonsDb = db.getSiblingDB(process.env.MONGO_DATABASE);

visonsDb.createCollection("categories");
visonsDb.createCollection("products");
visonsDb.createCollection("users");
visonsDb.createCollection("clients");
visonsDb.createCollection("providers");
visonsDb.createCollection("inventory_batches");
visonsDb.createCollection("email_verifications");
visonsDb.createCollection("revoked_tokens");
visonsDb.createCollection("rate_limits");
visonsDb.createCollection("quality_inspections");
visonsDb.createCollection("temperature_logs");
visonsDb.createCollection("traceability_logs");
visonsDb.createCollection("price_lists");

// 1. Maestro (Data Fija y de Catalogo)
visonsDb.categories.createIndex({ code: 1 }, { unique: true });
visonsDb.categories.createIndex({ name: 1 });
visonsDb.products.createIndex({ name: 1 });
visonsDb.products.createIndex({ category_id: 1, is_active: 1 });
visonsDb.users.createIndex({ email: 1 }, { unique: true });
visonsDb.users.createIndex({ role: 1 });
visonsDb.clients.createIndex({ document_number: 1 }, { unique: true });
visonsDb.providers.createIndex({ ruc: 1 }, { unique: true });
visonsDb.price_lists.createIndex({ product_id: 1, effective_date: -1 });

// 2. Inventario y Control de Calidad
visonsDb.inventory_batches.createIndex({ product_id: 1, expiration_date: 1 });
visonsDb.quality_inspections.createIndex({ product: 1, status: 1 });
visonsDb.temperature_logs.createIndex({ shipment_id: 1, recorded_at: -1 });

// 3. Auditoria y Logs
visonsDb.traceability_logs.createIndex({ action: 1, timestamp: -1 });

// 4. Seguridad y Autenticacion
visonsDb.email_verifications.createIndex({ token: 1 }, { unique: true });
visonsDb.revoked_tokens.createIndex({ token: 1 }, { unique: true });
visonsDb.rate_limits.createIndex({ ip: 1 });

visonsDb.createCollection('schema_changes', {
  validator: {$jsonSchema: {
    bsonType: 'object',
    required: ['sequence', 'changeId', 'checksum', 'gitSha', 'releaseVersion', 'appliedAt'],
    properties: {
      sequence:       { bsonType: 'int' },
      changeId:       { bsonType: 'string' },
      checksum:       { bsonType: 'string' },
      gitSha:         { bsonType: 'string' },
      releaseVersion: { bsonType: 'string' },
      appliedAt:      { bsonType: 'date' }
    }
  }},
  validationLevel: 'strict',
  validationAction: 'error'
});

visonsDb.schema_changes.createIndex({ sequence: 1 }, { unique: true, name: 'uq_change_sequence' });
visonsDb.schema_changes.createIndex({ changeId: 1 }, { unique: true, name: 'uq_change_id' });

// 5. Datos Semilla (Seed) Coherentes
print('Insertando semillas en MongoDB...');

visonsDb.categories.insertMany(Array.from({length: 10}, (_, i) => ({ _id: "CAT-0" + (i+1), code: "C0" + (i+1), name: "Categoria " + (i+1), is_active: true })));

visonsDb.products.insertMany(Array.from({length: 10}, (_, i) => ({ _id: "PROD-00" + (i+1), category_id: "CAT-0" + ((i%5)+1), name: "Producto " + (i+1), is_active: true })));

visonsDb.users.insertMany(Array.from({length: 10}, (_, i) => ({ _id: "U-00" + (i+1), email: "user" + (i+1) + "@visons.com", role: i < 2 ? "ADMIN" : "USER", name: "Usuario " + (i+1) })));

visonsDb.clients.insertMany(Array.from({length: 10}, (_, i) => ({ _id: "CLI-00" + (i+1), document_number: "DOC" + (i+1), name: "Cliente " + (i+1), country: "Pais " + (i+1) })));

visonsDb.providers.insertMany(Array.from({length: 10}, (_, i) => ({ _id: "PROV-00" + (i+1), ruc: "RUC00" + (i+1), name: "Proveedor " + (i+1) })));

visonsDb.inventory_batches.insertMany(Array.from({length: 10}, (_, i) => ({ _id: "BATCH-00" + (i+1), product_id: "PROD-00" + (i+1), provider_id: "PROV-00" + (i+1), expiration_date: new Date(2027, 0, i+1), quantity: 1000 })));

visonsDb.email_verifications.insertMany(Array.from({length: 10}, (_, i) => ({ token: "TOKEN_V_" + (i+1), user_id: "U-00" + (i+1), expires_at: new Date(2027, 0, i+1) })));

visonsDb.revoked_tokens.insertMany(Array.from({length: 10}, (_, i) => ({ token: "TOKEN_R_" + (i+1), revoked_at: new Date() })));

visonsDb.rate_limits.insertMany(Array.from({length: 10}, (_, i) => ({ ip: "192.168.1." + (i+1), requests: i, last_request: new Date() })));

visonsDb.quality_inspections.insertMany(Array.from({length: 10}, (_, i) => ({ batch_id: "BATCH-00" + (i+1), inspector_id: "U-00" + (i+1), product: "Producto " + (i+1), status: "APPROVED", date: new Date() })));

visonsDb.temperature_logs.insertMany(Array.from({length: 10}, (_, i) => ({ shipment_id: (i+1), recorded_at: new Date(), temperature: 4.0 + (i%2) })));

visonsDb.traceability_logs.insertMany(Array.from({length: 10}, (_, i) => ({ batch_id: "BATCH-00" + (i+1), action: "TRANSFERRED", user_id: "U-00" + (i+1), timestamp: new Date() })));

visonsDb.price_lists.insertMany(Array.from({length: 10}, (_, i) => ({ product_id: "PROD-00" + (i+1), effective_date: new Date(), price: 10.50 + i })));

print('[SUCCESS] V001__baseline.js aplicado: colecciones, semilla y control de versiones inicializados.');
