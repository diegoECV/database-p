// contract.js
// Verifica que la coleccion schema_changes sea coherente con la version esperada
var adminDb = db.getSiblingDB('admin');
if (!adminDb.auth(process.env.MONGO_ADMIN_USER, process.env.MONGO_ADMIN_PASSWORD)) {
  throw Error('No se pudo autenticar el administrador MongoDB');
}
var visonsDb = db.getSiblingDB(process.env.MONGO_DATABASE);

var requested = Number(process.env.TARGET_SCHEMA_VERSION);
var changes = visonsDb.schema_changes.find().sort({sequence: 1}).toArray();

if (changes.length !== requested || changes[changes.length - 1].sequence !== requested) {
  throw Error('Historial de cambios incompatible: Se esperaban ' + requested + ' cambios.');
}
for (var sequence = 1; sequence <= requested; sequence++) {
  if (changes[sequence - 1].sequence !== sequence) throw Error('Falta la secuencia ' + sequence);
}

// Verificacion de que TODAS las colecciones del contrato existan
var collections = visonsDb.getCollectionNames();
var expectedCollections = [
  "categories", "products", "users", "clients", "providers",
  "inventory_batches", "email_verifications", "revoked_tokens", "rate_limits",
  "quality_inspections", "temperature_logs", "traceability_logs", "price_lists"
];

for (var i = 0; i < expectedCollections.length; i++) {
  if (collections.indexOf(expectedCollections[i]) === -1) {
      throw Error('Contrato roto: Coleccion requerida no encontrada -> ' + expectedCollections[i]);
  }
}

print('MongoDB: contrato ' + requested + ' verificado exitosamente. Todas las colecciones existen.');
