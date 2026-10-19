// record-change.js
// Registra la aplicacion exitosa de una migracion en la coleccion de control
var adminDb = db.getSiblingDB('admin');
if (!adminDb.auth(process.env.MONGO_ADMIN_USER, process.env.MONGO_ADMIN_PASSWORD)) {
    throw Error('Autenticacion MongoDB fallida');
}

var visonsDb = db.getSiblingDB(process.env.MONGO_DATABASE);

visonsDb.schema_changes.insertOne({
  sequence: NumberInt(Number(process.env.CHANGE_SEQUENCE)),
  changeId: process.env.CHANGE_ID,
  checksum: process.env.CHANGE_CHECKSUM,
  gitSha: process.env.GIT_SHA || 'unknown',
  releaseVersion: process.env.RELEASE_VERSION || 'development',
  appliedAt: new Date()
});

print('[OK] Cambio ' + process.env.CHANGE_ID + ' registrado en schema_changes.');
