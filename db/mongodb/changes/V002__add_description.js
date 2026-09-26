// V002__add_description.js
// Ejemplo de evolucion: agregando un campo de descripcion a una coleccion existente
var adminDb = db.getSiblingDB('admin');
if (!adminDb.auth(process.env.MONGO_ADMIN_USER, process.env.MONGO_ADMIN_PASSWORD)) {
  throw Error('No se pudo autenticar el administrador MongoDB');
}
var visonsDb = db.getSiblingDB(process.env.MONGO_DATABASE);

// Modificar el schema o insertar informacion nueva
print('Aplicando cambio V002 - Ejemplo de evolucion de esquema en MongoDB');
