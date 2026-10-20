// =====================================================================
// Visons_mongodb_completo.js
// Script COMPLETO, ALINEADO CON EL BACKEND E IDEMPOTENTE de MongoDB
// Satisface al 100% las entidades de Java (Spring Boot) y Python (Analítica)
// con 16 colecciones + 1 control, y 10 registros consistentes por entidad.
// =====================================================================

var targetDbName = (typeof process !== 'undefined' && process.env && process.env.MONGO_DATABASE) ? process.env.MONGO_DATABASE : "Visons";
var visonsDb = db.getSiblingDB(targetDbName);

print("Conectado a MongoDB: " + targetDbName);

// 1. Limpieza segura previa (Evita errores de clave duplicada)
var collections = [
  "categories", "products", "users", "clients", "providers",
  "inventory_batches", "price_lists", "quality_inspections",
  "batch_inspections", "temperature_logs", "traceability_logs",
  "order_tracking", "assignment_tracking", "email_verifications",
  "revoked_tokens", "rate_limits", "schema_changes"
];

collections.forEach(function(col) {
  try { visonsDb[col].drop(); } catch (e) {}
});
print("Colecciones e índices obsoletos limpiados con éxito.");

// 2. Creación de índices
visonsDb.categories.createIndex({ code: 1 }, { unique: true });
visonsDb.products.createIndex({ code: 1 }, { unique: true });
visonsDb.users.createIndex({ username: 1 }, { unique: true });
visonsDb.users.createIndex({ email: 1 });
visonsDb.clients.createIndex({ documentNumber: 1 });
visonsDb.providers.createIndex({ documentNumber: 1 });
visonsDb.order_tracking.createIndex({ orderId: 1 });
visonsDb.assignment_tracking.createIndex({ assignmentId: 1 });
visonsDb.batch_inspections.createIndex({ batchId: 1 });
visonsDb.temperature_logs.createIndex({ shipmentId: 1, timestamp: -1 });
visonsDb.traceability_logs.createIndex({ batchId: 1, timestamp: -1 });
visonsDb.quality_inspections.createIndex({ batchId: 1 });
visonsDb.inventory_batches.createIndex({ batchId: 1 });
visonsDb.schema_changes.createIndex({ sequence: 1 }, { unique: true });

// 3. Inserción de Semillas Coherentes (10 por entidad)

// 1. categories
visonsDb.categories.insertMany([
  { _id: "CAT-01", code: "C01", name: "Paltas y Aguacates", description: "Hass y Fuerte de exportacion", isActive: true, is_active: true },
  { _id: "CAT-02", code: "C02", name: "Mangos Frescos", description: "Kent y Tommy Atkins", isActive: true, is_active: true },
  { _id: "CAT-03", code: "C03", name: "Uvas de Mesa", description: "Red Globe y Sweet Globe", isActive: true, is_active: true },
  { _id: "CAT-04", code: "C04", name: "Arandanos Premium", description: "Biloxi y Ventura", isActive: true, is_active: true },
  { _id: "CAT-05", code: "C05", name: "Esparragos Verdes", description: "Calibres L y XL", isActive: true, is_active: true },
  { _id: "CAT-06", code: "C06", name: "Citricos y Limones", description: "Limon Tahiti y Mandarina", isActive: true, is_active: true },
  { _id: "CAT-07", code: "C07", name: "Jengibre y Kion", description: "Jengibre organico lavado", isActive: true, is_active: true },
  { _id: "CAT-08", code: "C08", name: "Granadas", description: "Variedad Wonderful", isActive: true, is_active: true },
  { _id: "CAT-09", code: "C09", name: "Maracuya", description: "Fruta fresca seleccionada", isActive: true, is_active: true },
  { _id: "CAT-10", code: "C10", name: "Cacao Fino de Aroma", description: "Granos criollos fermentados", isActive: true, is_active: true }
]);

// 2. products (Compatible con Product.java: code, name, categoryId, isActive, variety, caliber, unitMeasure, hsCode)
visonsDb.products.insertMany([
  { _id: "PROD-001", code: "PRD-01", name: "Palta Hass Calibre 12", categoryId: "CAT-01", category_id: "CAT-01", isActive: true, is_active: true, variety: "Hass", caliber: "Calibre 12", unitMeasure: "KG", hsCode: "0804.40.00" },
  { _id: "PROD-002", code: "PRD-02", name: "Mango Kent Caja 4kg", categoryId: "CAT-02", category_id: "CAT-02", isActive: true, is_active: true, variety: "Kent", caliber: "Calibre 8", unitMeasure: "KG", hsCode: "0804.50.20" },
  { _id: "PROD-003", code: "PRD-03", name: "Uva Red Globe Caja 8.2kg", categoryId: "CAT-03", category_id: "CAT-03", isActive: true, is_active: true, variety: "Red Globe", caliber: "XL", unitMeasure: "KG", hsCode: "0806.10.00" },
  { _id: "PROD-004", code: "PRD-04", name: "Arandano Biloxi Clamshell", categoryId: "CAT-04", category_id: "CAT-04", isActive: true, is_active: true, variety: "Biloxi", caliber: "14mm+", unitMeasure: "KG", hsCode: "0810.40.00" },
  { _id: "PROD-005", code: "PRD-05", name: "Esparrago Verde Calibre L", categoryId: "CAT-05", category_id: "CAT-05", isActive: true, is_active: true, variety: "UC-157", caliber: "Large", unitMeasure: "KG", hsCode: "0709.20.00" },
  { _id: "PROD-006", code: "PRD-06", name: "Limon Tahiti Calibre 48", categoryId: "CAT-06", category_id: "CAT-06", isActive: true, is_active: true, variety: "Tahiti", caliber: "48", unitMeasure: "KG", hsCode: "0805.50.21" },
  { _id: "PROD-007", code: "PRD-07", name: "Jengibre Organico Grado A", categoryId: "CAT-07", category_id: "CAT-07", isActive: true, is_active: true, variety: "Criollo", caliber: "Grado A", unitMeasure: "KG", hsCode: "0910.11.00" },
  { _id: "PROD-008", code: "PRD-08", name: "Granada Wonderful Caja 3.8kg", categoryId: "CAT-08", category_id: "CAT-08", isActive: true, is_active: true, variety: "Wonderful", caliber: "30", unitMeasure: "KG", hsCode: "0810.90.10" },
  { _id: "PROD-009", code: "PRD-09", name: "Maracuya Exportacion", categoryId: "CAT-09", category_id: "CAT-09", isActive: true, is_active: true, variety: "Amarillo", caliber: "Mediano", unitMeasure: "KG", hsCode: "0810.90.40" },
  { _id: "PROD-010", code: "PRD-10", name: "Cacao Grano Criollo", categoryId: "CAT-10", category_id: "CAT-10", isActive: true, is_active: true, variety: "Criollo Amazonas", caliber: "Grado 1", unitMeasure: "KG", hsCode: "1801.00.19" }
]);

// 3. users (Compatible con User.java y AuthRest login: password123)
var defaultPassHash = "$2a$10$VFiqJivXp8EmC60CVyL3W.D7iebJlVAZXhhn1lix0eLuE43y9MxeW";
visonsDb.users.insertMany([
  { _id: "U-001", username: "admin@visons.com", email: "admin@visons.com", password: defaultPassHash, role: "ADMIN", name: "Administrador Visons", isActive: true, is_active: true, department: "Gerencia", phone: "+51999111222" },
  { _id: "U-002", username: "diego@visons.com", email: "diego@visons.com", password: defaultPassHash, role: "ADMIN", name: "Diego Centeno", isActive: true, is_active: true, department: "Sistemas", phone: "+51988222333" },
  { _id: "U-003", username: "lizeth@visons.com", email: "lizeth@visons.com", password: defaultPassHash, role: "ADMIN", name: "Lizeth Quispe", isActive: true, is_active: true, department: "Calidad", phone: "+51977333444" },
  { _id: "U-004", username: "camila@visons.com", email: "camila@visons.com", password: defaultPassHash, role: "USER", name: "Camila Quispe", isActive: true, is_active: true, department: "Logistica", phone: "+51966444555" },
  { _id: "U-005", username: "logistica@visons.com", email: "logistica@visons.com", password: defaultPassHash, role: "OPERATOR", name: "Jefe Logistica", isActive: true, is_active: true, department: "Despacho", phone: "+51955555666" },
  { _id: "U-006", username: "calidad@visons.com", email: "calidad@visons.com", password: defaultPassHash, role: "INSPECTOR", name: "Inspector Calidad", isActive: true, is_active: true, department: "Laboratorio", phone: "+51944666777" },
  { _id: "U-007", username: "ventas@visons.com", email: "ventas@visons.com", password: defaultPassHash, role: "SALES", name: "Ejecutivo Comercial", isActive: true, is_active: true, department: "Comercial", phone: "+51933777888" },
  { _id: "U-008", username: "finanzas@visons.com", email: "finanzas@visons.com", password: defaultPassHash, role: "ACCOUNTANT", name: "Contabilidad", isActive: true, is_active: true, department: "Finanzas", phone: "+51922888999" },
  { _id: "U-009", username: "almacen@visons.com", email: "almacen@visons.com", password: defaultPassHash, role: "OPERATOR", name: "Supervisor Almacen", isActive: true, is_active: true, department: "Almacen", phone: "+51911999000" },
  { _id: "U-010", username: "auditor@visons.com", email: "auditor@visons.com", password: defaultPassHash, role: "AUDITOR", name: "Auditor Externo", isActive: true, is_active: true, department: "Auditoria", phone: "+51900000111" }
]);

// 4. clients (Compatible con Client.java)
visonsDb.clients.insertMany([
  { _id: "CLI-001", documentType: "TAX_ID", documentNumber: "US-8849201", document_number: "US-8849201", companyName: "Global Fruit Logistics LLC", contactName: "John Smith", country: "USA", email: "jsmith@globalfruit.com", phone: "+1-305-555-0192", address: "1200 Brickell Ave, Miami FL", preferredIncoterm: "FOB", destinationPort: "Rotterdam", paymentTerms: "30 dias", preferredCurrency: "USD", creditLimit: 150000.0, language: "en" },
  { _id: "CLI-002", documentType: "TAX_ID", documentNumber: "NL-3928104", document_number: "NL-3928104", companyName: "EuroFresh Import B.V.", contactName: "Hans Van Dijk", country: "Paises Bajos", email: "hans@eurofresh.nl", phone: "+31-10-555-3819", address: "Havenstraat 45, Rotterdam", preferredIncoterm: "CIF", destinationPort: "Hamburg", paymentTerms: "Contado", preferredCurrency: "USD", creditLimit: 200000.0, language: "en" },
  { _id: "CLI-003", documentType: "NIF", documentNumber: "ES-5591024", document_number: "ES-5591024", companyName: "Iberica de Frutas S.L.", contactName: "Carlos Gomez", country: "Espana", email: "cgomez@ibericafrutas.es", phone: "+34-96-333-8822", address: "Av. del Puerto 120, Valencia", preferredIncoterm: "EXW", destinationPort: "Valencia", paymentTerms: "60 dias", preferredCurrency: "EUR", creditLimit: 100000.0, language: "es" },
  { _id: "CLI-004", documentType: "UST_ID", documentNumber: "DE-4910294", document_number: "DE-4910294", companyName: "Hamburg Frucht GmbH", contactName: "Klaus Schmidt", country: "Alemania", email: "klaus@hamburgfrucht.de", phone: "+49-40-777-1122", address: "Speicherstadt 8, Hamburg", preferredIncoterm: "FOB", destinationPort: "Long Beach", paymentTerms: "30 dias", preferredCurrency: "USD", creditLimit: 250000.0, language: "de" },
  { _id: "CLI-005", documentType: "VAT", documentNumber: "UK-9182049", document_number: "UK-9182049", companyName: "British Fresh Imports Ltd", contactName: "Emma Watson", country: "Reino Unido", email: "ewatson@freshuk.co.uk", phone: "+44-20-888-9900", address: "London Fruit Market 14", preferredIncoterm: "CIF", destinationPort: "Miami", paymentTerms: "Contado", preferredCurrency: "USD", creditLimit: 180000.0, language: "en" },
  { _id: "CLI-006", documentType: "JCT", documentNumber: "JP-7719204", document_number: "JP-7719204", companyName: "Tokyo Agro Trading Co.", contactName: "Kenji Sato", country: "Japon", email: "sato@tokyoagro.jp", phone: "+81-3-444-2200", address: "Chiyoda-ku 3-2, Tokyo", preferredIncoterm: "FCA", destinationPort: "Yokohama", paymentTerms: "45 dias", preferredCurrency: "USD", creditLimit: 300000.0, language: "ja" },
  { _id: "CLI-007", documentType: "BCE", documentNumber: "BE-6629103", document_number: "BE-6629103", companyName: "Antwerp Tropical Fruits", contactName: "Luc Peeters", country: "Belgica", email: "peeters@antwerpfruits.be", phone: "+32-3-222-1144", address: "Kaai 188, Antwerp", preferredIncoterm: "FOB", destinationPort: "Antwerp", paymentTerms: "30 dias", preferredCurrency: "EUR", creditLimit: 140000.0, language: "nl" },
  { _id: "CLI-008", documentType: "BRN", documentNumber: "KR-3391029", document_number: "KR-3391029", companyName: "Korea Fresh Produce Corp", contactName: "Min-ho Park", country: "Corea del Sur", email: "mhpark@koreafresh.kr", phone: "+82-2-999-4455", address: "Gangnam-gu 101, Seoul", preferredIncoterm: "CIF", destinationPort: "Busan", paymentTerms: "Contado", preferredCurrency: "USD", creditLimit: 220000.0, language: "ko" },
  { _id: "CLI-009", documentType: "BN", documentNumber: "CA-1192048", document_number: "CA-1192048", companyName: "Canada North Foods Inc", contactName: "David Miller", country: "Canada", email: "dmiller@canadanorth.ca", phone: "+1-416-888-2233", address: "Queen St 400, Toronto", preferredIncoterm: "EXW", destinationPort: "Callao", paymentTerms: "30 dias", preferredCurrency: "USD", creditLimit: 170000.0, language: "en" },
  { _id: "CLI-010", documentType: "USCC", documentNumber: "CN-9920194", document_number: "CN-9920194", companyName: "Shanghai Orient Agri Ltd", contactName: "Wei Zhang", country: "China", email: "wzhang@orientagri.cn", phone: "+86-21-555-8899", address: "Pudong Ave 500, Shanghai", preferredIncoterm: "FOB", destinationPort: "Shanghai", paymentTerms: "Contado", preferredCurrency: "USD", creditLimit: 350000.0, language: "zh" }
]);

// 5. providers (Compatible con Provider.java)
visonsDb.providers.insertMany([
  { _id: "PROV-001", documentType: "RUC", documentNumber: "20512345671", ruc: "20512345671", companyName: "Agropecuaria del Sur S.A.C.", company_name: "Agropecuaria del Sur S.A.C.", contactName: "Juan Perez", country: "Peru", email: "jperez@agrosur.pe", phone: "+51956123456", address: "Fundo Los Olivos Km 298, Ica", ubigeo: "110101", bankAccountCci: "002-191-002345678901-52", certificationStatus: "GLOBAL_GAP_CERTIFIED" },
  { _id: "PROV-002", documentType: "RUC", documentNumber: "20512345672", ruc: "20512345672", companyName: "Exportadora Valle Verde S.R.L.", company_name: "Exportadora Valle Verde S.R.L.", contactName: "Rosa Mendoza", country: "Peru", email: "rmendoza@valleverde.pe", phone: "+51969234567", address: "Valle San Lorenzo, Piura", ubigeo: "200101", bankAccountCci: "002-191-003456789012-53", certificationStatus: "GLOBAL_GAP_CERTIFIED" },
  { _id: "PROV-003", documentType: "RUC", documentNumber: "20512345673", ruc: "20512345673", companyName: "Vinedos de Ica S.A.", company_name: "Vinedos de Ica S.A.", contactName: "Manuel Silva", country: "Peru", email: "msilva@vinedosica.pe", phone: "+51956345678", address: "Panamericana Sur Km 310, Ica", ubigeo: "110102", bankAccountCci: "002-191-004567890123-54", certificationStatus: "SMETA_AUDITED" },
  { _id: "PROV-004", documentType: "RUC", documentNumber: "20512345674", ruc: "20512345674", companyName: "Berries del Norte E.I.R.L.", company_name: "Berries del Norte E.I.R.L.", contactName: "Jorge Ramos", country: "Peru", email: "jramos@berriesnorte.pe", phone: "+51944456789", address: "Chao Km 502, La Libertad", ubigeo: "130101", bankAccountCci: "002-191-005678901234-55", certificationStatus: "ORGANIC_CERTIFIED" },
  { _id: "PROV-005", documentType: "RUC", documentNumber: "20512345675", ruc: "20512345675", companyName: "Agricola Santa Patricia S.A.", company_name: "Agricola Santa Patricia S.A.", contactName: "Patricia Diaz", country: "Peru", email: "pdiaz@santapatricia.pe", phone: "+51943567890", address: "Casma Km 370, Ancash", ubigeo: "020801", bankAccountCci: "002-191-006789012345-56", certificationStatus: "GLOBAL_GAP_CERTIFIED" },
  { _id: "PROV-006", documentType: "RUC", documentNumber: "20512345676", ruc: "20512345676", companyName: "Citricos del Pacifico S.A.C.", company_name: "Citricos del Pacifico S.A.C.", contactName: "Andres Torres", country: "Peru", email: "atorres@citricospacifico.pe", phone: "+51998678901", address: "Huaral Km 85, Lima", ubigeo: "150601", bankAccountCci: "002-191-007890123456-57", certificationStatus: "GLOBAL_GAP_CERTIFIED" },
  { _id: "PROV-007", documentType: "RUC", documentNumber: "20512345677", ruc: "20512345677", companyName: "Agroindustrial Selva Central", company_name: "Agroindustrial Selva Central", contactName: "Elena Castro", country: "Peru", email: "ecastro@selvacentral.pe", phone: "+51964789012", address: "Pichanaqui, Junin", ubigeo: "120303", bankAccountCci: "002-191-008901234567-58", certificationStatus: "ORGANIC_CERTIFIED" },
  { _id: "PROV-008", documentType: "RUC", documentNumber: "20512345678", ruc: "20512345678", companyName: "Fundo San Fernando S.A.C.", company_name: "Fundo San Fernando S.A.C.", contactName: "Fernando Ruiz", country: "Peru", email: "fruiz@fundosanfernando.pe", phone: "+51956890123", address: "Santiago, Ica", ubigeo: "110111", bankAccountCci: "002-191-009012345678-59", certificationStatus: "GLOBAL_GAP_CERTIFIED" },
  { _id: "PROV-009", documentType: "RUC", documentNumber: "20512345679", ruc: "20512345679", companyName: "Frutales del Norte S.R.L.", company_name: "Frutales del Norte S.R.L.", contactName: "Claudia Morales", country: "Peru", email: "cmorales@frutalesnorte.pe", phone: "+51979901234", address: "Olmos, Lambayeque", ubigeo: "140308", bankAccountCci: "002-191-010123456789-60", certificationStatus: "GLOBAL_GAP_CERTIFIED" },
  { _id: "PROV-010", documentType: "RUC", documentNumber: "20512345680", ruc: "20512345680", companyName: "Cooperativa Cacao del Oriente", company_name: "Cooperativa Cacao del Oriente", contactName: "Victor Vargas", country: "Peru", email: "vvargas@cacaooriente.pe", phone: "+51942012345", address: "Juanjui, San Martin", ubigeo: "220601", bankAccountCci: "002-191-011234567890-61", certificationStatus: "FAIR_TRADE_CERTIFIED" }
]);

// 6. inventory_batches (Compatible con InventoryBatch.java: batchId Integer)
visonsDb.inventory_batches.insertMany([
  { _id: "IB-001", batchId: 1, productId: "PROD-001", providerId: "PROV-001", fieldName: "Fundo Los Olivos", harvestDate: "2026-08-25", packingDate: "2026-08-27", expirationDate: "2027-01-15", quantity: 10000.0 },
  { _id: "IB-002", batchId: 2, productId: "PROD-002", providerId: "PROV-002", fieldName: "Fundo Santa Rosa", harvestDate: "2026-08-26", packingDate: "2026-08-28", expirationDate: "2027-01-20", quantity: 8000.0 },
  { _id: "IB-003", batchId: 3, productId: "PROD-003", providerId: "PROV-003", fieldName: "Fundo El Parral", harvestDate: "2026-08-27", packingDate: "2026-08-29", expirationDate: "2027-02-10", quantity: 15000.0 },
  { _id: "IB-004", batchId: 4, productId: "PROD-004", providerId: "PROV-004", fieldName: "Fundo San Jose", harvestDate: "2026-08-28", packingDate: "2026-08-30", expirationDate: "2027-02-15", quantity: 5000.0 },
  { _id: "IB-005", batchId: 5, productId: "PROD-005", providerId: "PROV-005", fieldName: "Fundo Esperanza", harvestDate: "2026-08-29", packingDate: "2026-08-31", expirationDate: "2027-02-28", quantity: 6000.0 },
  { _id: "IB-006", batchId: 6, productId: "PROD-006", providerId: "PROV-006", fieldName: "Fundo La Palma", harvestDate: "2026-08-30", packingDate: "2026-09-01", expirationDate: "2027-03-01", quantity: 12000.0 },
  { _id: "IB-007", batchId: 7, productId: "PROD-007", providerId: "PROV-007", fieldName: "Fundo Bella Vista", harvestDate: "2026-08-31", packingDate: "2026-09-02", expirationDate: "2027-03-10", quantity: 7000.0 },
  { _id: "IB-008", batchId: 8, productId: "PROD-008", providerId: "PROV-008", fieldName: "Fundo El Milagro", harvestDate: "2026-09-01", packingDate: "2026-09-03", expirationDate: "2027-03-15", quantity: 9000.0 },
  { _id: "IB-009", batchId: 9, productId: "PROD-009", providerId: "PROV-009", fieldName: "Fundo San Juan", harvestDate: "2026-09-02", packingDate: "2026-09-04", expirationDate: "2027-03-20", quantity: 11000.0 },
  { _id: "IB-010", batchId: 10, productId: "PROD-010", providerId: "PROV-010", fieldName: "Fundo La Herradura", harvestDate: "2026-09-03", packingDate: "2026-09-05", expirationDate: "2027-04-01", quantity: 20000.0 }
]);

// 7. price_lists (Compatible con PriceList.java: items array)
visonsDb.price_lists.insertMany([
  { _id: "PL-001", name: "Lista Paltas Temporada 2026", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "USD", items: [{ productId: "PROD-001", price: 2.50, minQuantity: 500 }] },
  { _id: "PL-002", name: "Lista Mangos Export 2026", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "USD", items: [{ productId: "PROD-002", price: 3.20, minQuantity: 500 }] },
  { _id: "PL-003", name: "Lista Uvas Red Globe 2026", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "EUR", items: [{ productId: "PROD-003", price: 1.80, minQuantity: 500 }] },
  { _id: "PL-004", name: "Lista Arandanos Clamshell", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "USD", items: [{ productId: "PROD-004", price: 2.45, minQuantity: 300 }] },
  { _id: "PL-005", name: "Lista Esparragos Verdes", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "USD", items: [{ productId: "PROD-005", price: 3.15, minQuantity: 400 }] },
  { _id: "PL-006", name: "Lista Limon Tahiti", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "USD", items: [{ productId: "PROD-006", price: 4.00, minQuantity: 1000 }] },
  { _id: "PL-007", name: "Lista Jengibre Organico", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "EUR", items: [{ productId: "PROD-007", price: 2.60, minQuantity: 300 }] },
  { _id: "PL-008", name: "Lista Granadas Wonderful", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "USD", items: [{ productId: "PROD-008", price: 1.90, minQuantity: 500 }] },
  { _id: "PL-009", name: "Lista Maracuya Export", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "USD", items: [{ productId: "PROD-009", price: 3.10, minQuantity: 500 }] },
  { _id: "PL-010", name: "Lista Cacao Fino Aroma", validFrom: new Date("2026-09-01"), validUntil: new Date("2026-12-31"), currency: "USD", items: [{ productId: "PROD-010", price: 3.90, minQuantity: 1000 }] }
]);

// 8. quality_inspections (Compatible con QualityInspection.java)
visonsDb.quality_inspections.insertMany([
  { _id: "QI-001", batchId: "BATCH-001", inspectorId: "U-006", inspectionDate: new Date("2026-09-01"), result: "PASSED", notes: "Cumple con calibres y brix optimo", evidenceUrls: ["https://docs.visons.com/evidence/qi-001.jpg"] },
  { _id: "QI-002", batchId: "BATCH-002", inspectorId: "U-006", inspectionDate: new Date("2026-09-02"), result: "PASSED", notes: "Coloracion y firmeza en rango", evidenceUrls: ["https://docs.visons.com/evidence/qi-002.jpg"] },
  { _id: "QI-003", batchId: "BATCH-003", inspectorId: "U-006", inspectionDate: new Date("2026-09-03"), result: "PASSED", notes: "Racimos uniformes sin dano", evidenceUrls: ["https://docs.visons.com/evidence/qi-003.jpg"] },
  { _id: "QI-004", batchId: "BATCH-004", inspectorId: "U-006", inspectionDate: new Date("2026-09-04"), result: "PASSED", notes: "Pruina intacta y calibre comercial", evidenceUrls: ["https://docs.visons.com/evidence/qi-004.jpg"] },
  { _id: "QI-005", batchId: "BATCH-005", inspectorId: "U-006", inspectionDate: new Date("2026-09-05"), result: "PASSED", notes: "Turion recto y punta cerrada", evidenceUrls: ["https://docs.visons.com/evidence/qi-005.jpg"] },
  { _id: "QI-006", batchId: "BATCH-006", inspectorId: "U-006", inspectionDate: new Date("2026-09-06"), result: "PASSED", notes: "Contenido de jugo mayor a 42%", evidenceUrls: ["https://docs.visons.com/evidence/qi-006.jpg"] },
  { _id: "QI-007", batchId: "BATCH-007", inspectorId: "U-006", inspectionDate: new Date("2026-09-07"), result: "PASSED", notes: "Rizoma limpio y sin plagas", evidenceUrls: ["https://docs.visons.com/evidence/qi-007.jpg"] },
  { _id: "QI-008", batchId: "BATCH-008", inspectorId: "U-006", inspectionDate: new Date("2026-09-08"), result: "PASSED", notes: "Arilos rojos intensos y brix 16", evidenceUrls: ["https://docs.visons.com/evidence/qi-008.jpg"] },
  { _id: "QI-009", batchId: "BATCH-009", inspectorId: "U-006", inspectionDate: new Date("2026-09-09"), result: "PASSED", notes: "Rendimiento de pulpa excelente", evidenceUrls: ["https://docs.visons.com/evidence/qi-009.jpg"] },
  { _id: "QI-010", batchId: "BATCH-010", inspectorId: "U-006", inspectionDate: new Date("2026-09-10"), result: "PASSED", notes: "Fermentacion al 88% y humedad 7.2%", evidenceUrls: ["https://docs.visons.com/evidence/qi-010.jpg"] }
]);

// 9. batch_inspections (Compatible con BatchInspection.java: batchId Integer y inspections array)
visonsDb.batch_inspections.insertMany([
  { _id: "BI-001", batchId: 1, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-01T10:00:00Z"), qualityStatus: "APPROVED", notes: "Brix 12.5, firmeza optima" }] },
  { _id: "BI-002", batchId: 2, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-02T10:00:00Z"), qualityStatus: "APPROVED", notes: "Brix 14.0, color optimo" }] },
  { _id: "BI-003", batchId: 3, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-03T10:00:00Z"), qualityStatus: "APPROVED", notes: "Brix 16.5, calibre XL" }] },
  { _id: "BI-004", batchId: 4, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-04T10:00:00Z"), qualityStatus: "APPROVED", notes: "Brix 13.0, firmeza alta" }] },
  { _id: "BI-005", batchId: 5, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-05T10:00:00Z"), qualityStatus: "APPROVED", notes: "Longitud 22cm punta cerrada" }] },
  { _id: "BI-006", batchId: 6, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-06T10:00:00Z"), qualityStatus: "APPROVED", notes: "Jugo 45%, acidez 5.8" }] },
  { _id: "BI-007", batchId: 7, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-07T10:00:00Z"), qualityStatus: "APPROVED", notes: "Humedad 82%, limpieza alta" }] },
  { _id: "BI-008", batchId: 8, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-08T10:00:00Z"), qualityStatus: "APPROVED", notes: "Brix 16.0, arilo rojo" }] },
  { _id: "BI-009", batchId: 9, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-09T10:00:00Z"), qualityStatus: "APPROVED", notes: "Brix 15.5, aroma intenso" }] },
  { _id: "BI-010", batchId: 10, inspections: [{ inspector: "U-006", inspectionTime: new Date("2026-09-10T10:00:00Z"), qualityStatus: "APPROVED", notes: "Fermentacion 88%, grano criollo" }] }
]);

// 10. temperature_logs (Compatible con TemperatureLog.java: shipmentId Integer)
visonsDb.temperature_logs.insertMany([
  { _id: "TL-001", shipmentId: 1, containerNumber: "MSCU1234567", timestamp: new Date("2026-09-15T10:00:00Z"), temperatureCelsius: 4.1, humidityPercentage: 88.0, location: "Callao Port", alertTriggered: false },
  { _id: "TL-002", shipmentId: 2, containerNumber: "MSKU2345678", timestamp: new Date("2026-09-16T11:00:00Z"), temperatureCelsius: 3.6, humidityPercentage: 85.0, location: "Paita Port", alertTriggered: false },
  { _id: "TL-003", shipmentId: 3, containerNumber: "CMAU3456789", timestamp: new Date("2026-09-17T12:00:00Z"), temperatureCelsius: 4.0, humidityPercentage: 90.0, location: "Callao Port", alertTriggered: false },
  { _id: "TL-004", shipmentId: 4, containerNumber: "HLCU4567890", timestamp: new Date("2026-09-20T09:00:00Z"), temperatureCelsius: 3.8, humidityPercentage: 87.0, location: "Callao Port", alertTriggered: false },
  { _id: "TL-005", shipmentId: 5, containerNumber: "ONEU5678901", timestamp: new Date("2026-09-21T14:00:00Z"), temperatureCelsius: 4.2, humidityPercentage: 89.0, location: "Paita Port", alertTriggered: false },
  { _id: "TL-006", shipmentId: 6, containerNumber: "EGLV6789012", timestamp: new Date("2026-09-22T15:30:00Z"), temperatureCelsius: 4.0, humidityPercentage: 86.0, location: "Callao Port", alertTriggered: false },
  { _id: "TL-007", shipmentId: 7, containerNumber: "COSU7890123", timestamp: new Date("2026-09-23T16:00:00Z"), temperatureCelsius: 3.9, humidityPercentage: 88.0, location: "Callao Port", alertTriggered: false },
  { _id: "TL-008", shipmentId: 8, containerNumber: "YMLU8901234", timestamp: new Date("2026-09-25T08:15:00Z"), temperatureCelsius: 4.1, humidityPercentage: 85.0, location: "Paita Port", alertTriggered: false },
  { _id: "TL-009", shipmentId: 9, containerNumber: "PCIU9012345", timestamp: new Date("2026-09-26T17:45:00Z"), temperatureCelsius: 4.0, humidityPercentage: 91.0, location: "Callao Port", alertTriggered: false },
  { _id: "TL-010", shipmentId: 10, containerNumber: "OOLU0123456", timestamp: new Date("2026-09-27T18:00:00Z"), temperatureCelsius: 3.7, humidityPercentage: 87.0, location: "Callao Port", alertTriggered: false }
]);

// 11. traceability_logs (Compatible con TraceabilityLog.java: performedBy)
visonsDb.traceability_logs.insertMany([
  { _id: "TRL-001", batchId: "BATCH-001", productId: "PROD-001", action: "HARVESTED", performedBy: "U-005", timestamp: new Date("2026-08-25"), location: "Fundo Los Olivos", additionalInfo: "Cosecha manual inicio temporada" },
  { _id: "TRL-002", batchId: "BATCH-002", productId: "PROD-002", action: "PACKED", performedBy: "U-005", timestamp: new Date("2026-08-28"), location: "Planta Piura", additionalInfo: "Lavado hidrotérmico completado" },
  { _id: "TRL-003", batchId: "BATCH-003", productId: "PROD-003", action: "INSPECTED", performedBy: "U-006", timestamp: new Date("2026-08-30"), location: "Laboratorio Ica", additionalInfo: "Inspeccion fitosanitaria SENASA" },
  { _id: "TRL-004", batchId: "BATCH-004", productId: "PROD-004", action: "COLD_STORAGE", performedBy: "U-009", timestamp: new Date("2026-09-01"), location: "Camara Frigorifica 2", additionalInfo: "Set point pre-enfriado a 4C" },
  { _id: "TRL-005", batchId: "BATCH-005", productId: "PROD-005", action: "DISPATCHED", performedBy: "U-005", timestamp: new Date("2026-09-05"), location: "Muelle Callao", additionalInfo: "Consolidado en contenedor reefer" },
  { _id: "TRL-006", batchId: "BATCH-006", productId: "PROD-006", action: "BOARDED", performedBy: "U-005", timestamp: new Date("2026-09-08"), location: "Buque EVER GIVEN", additionalInfo: "Embarcado y precintado" },
  { _id: "TRL-007", batchId: "BATCH-007", productId: "PROD-007", action: "TRANSFERRED", performedBy: "U-009", timestamp: new Date("2026-09-10"), location: "Almacen Callao", additionalInfo: "Traspaso de custodia aprobado" },
  { _id: "TRL-008", batchId: "BATCH-008", productId: "PROD-008", action: "PALLETIZED", performedBy: "U-005", timestamp: new Date("2026-09-12"), location: "Zona Consolidado", additionalInfo: "Esquineros y zunchos colocados" },
  { _id: "TRL-009", batchId: "BATCH-009", productId: "PROD-009", action: "CERTIFIED", performedBy: "U-006", timestamp: new Date("2026-09-14"), location: "Sede SENASA", additionalInfo: "Certificado fitosanitario emitido" },
  { _id: "TRL-010", batchId: "BATCH-010", productId: "PROD-010", action: "SEALED", performedBy: "U-005", timestamp: new Date("2026-09-15"), location: "Callao Terminal", additionalInfo: "Precinto aduanero verificado" }
]);

// 12. order_tracking (Compatible con OrderTracking.java: orderId Integer y events array)
visonsDb.order_tracking.insertMany([
  { _id: "OT-001", orderId: 1, events: [{ status: "COMPLETED", timestamp: new Date("2026-09-02"), location: "Callao", notes: "Orden entregada y pagada" }] },
  { _id: "OT-002", orderId: 2, events: [{ status: "COMPLETED", timestamp: new Date("2026-09-03"), location: "Paita", notes: "Completada con exito" }] },
  { _id: "OT-003", orderId: 3, events: [{ status: "COMPLETED", timestamp: new Date("2026-09-04"), location: "Callao", notes: "Retirada en planta" }] },
  { _id: "OT-004", orderId: 4, events: [{ status: "PENDING", timestamp: new Date("2026-09-04"), location: "Callao", notes: "Pendiente de confirmacion de buque" }] },
  { _id: "OT-005", orderId: 5, events: [{ status: "PENDING", timestamp: new Date("2026-09-05"), location: "Paita", notes: "Esperando documentacion aduanera" }] },
  { _id: "OT-006", orderId: 6, events: [{ status: "SHIPPED", timestamp: new Date("2026-09-06"), location: "En ruta maritima", notes: "Cargamento en transito a Yokohama" }] },
  { _id: "OT-007", orderId: 7, events: [{ status: "SHIPPED", timestamp: new Date("2026-09-07"), location: "En ruta maritima", notes: "En transito a Antwerp" }] },
  { _id: "OT-008", orderId: 8, events: [{ status: "DELIVERED", timestamp: new Date("2026-09-08"), location: "Busan Port", notes: "Entregado al consignatario" }] },
  { _id: "OT-009", orderId: 9, events: [{ status: "PROCESSING", timestamp: new Date("2026-09-09"), location: "Planta Empaque", notes: "En proceso de pesado y paletizado" }] },
  { _id: "OT-010", orderId: 10, events: [{ status: "PROCESSING", timestamp: new Date("2026-09-10"), location: "Laboratorio Control", notes: "Toma de muestras de calidad" }] }
]);

// 13. assignment_tracking (Compatible con AssignmentTracking.java: assignmentId Integer y events array)
visonsDb.assignment_tracking.insertMany([
  { _id: "AT-001", assignmentId: 1, events: [{ transferredBy: "U-001", transferredTo: "U-002", transferTime: new Date("2026-09-01"), location: "Planta Empaque", condition: "OPTIMAL", status: "COMPLETED", comments: "Empaque completado a tiempo" }] },
  { _id: "AT-002", assignmentId: 2, events: [{ transferredBy: "U-001", transferredTo: "U-003", transferTime: new Date("2026-09-02"), location: "Laboratorio Ica", condition: "OPTIMAL", status: "COMPLETED", comments: "Inspeccion fitosanitaria aprobada" }] },
  { _id: "AT-003", assignmentId: 3, events: [{ transferredBy: "U-001", transferredTo: "U-004", transferTime: new Date("2026-09-03"), location: "Muelle Callao", condition: "GOOD", status: "IN_PROGRESS", comments: "Estiba en contenedor en curso" }] },
  { _id: "AT-004", assignmentId: 4, events: [{ transferredBy: "U-001", transferredTo: "U-005", transferTime: new Date("2026-09-04"), location: "Zona Paletizado", condition: "GOOD", status: "PENDING", comments: "Esperando llegada de paletas de Piura" }] },
  { _id: "AT-005", assignmentId: 5, events: [{ transferredBy: "U-001", transferredTo: "U-006", transferTime: new Date("2026-09-05"), location: "Camara Frio 1", condition: "OPTIMAL", status: "PENDING", comments: "Muestreo de azucar programado" }] },
  { _id: "AT-006", assignmentId: 6, events: [{ transferredBy: "U-001", transferredTo: "U-007", transferTime: new Date("2026-09-06"), location: "Aduana Aerea", condition: "OPTIMAL", status: "IN_PROGRESS", comments: "Revision documentaria DAM" }] },
  { _id: "AT-007", assignmentId: 7, events: [{ transferredBy: "U-001", transferredTo: "U-008", transferTime: new Date("2026-09-07"), location: "Planta Ica", condition: "OPTIMAL", status: "COMPLETED", comments: "Pesaje certificado ok" }] },
  { _id: "AT-008", assignmentId: 8, events: [{ transferredBy: "U-001", transferredTo: "U-009", transferTime: new Date("2026-09-08"), location: "Camara Frio 3", condition: "OPTIMAL", status: "IN_PROGRESS", comments: "Monitoreo constante de temperatura" }] },
  { _id: "AT-009", assignmentId: 9, events: [{ transferredBy: "U-001", transferredTo: "U-010", transferTime: new Date("2026-09-09"), location: "Oficina Trazabilidad", condition: "GOOD", status: "PENDING", comments: "Validacion de codigo de barras lote" }] },
  { _id: "AT-010", assignmentId: 10, events: [{ transferredBy: "U-001", transferredTo: "U-002", transferTime: new Date("2026-09-10"), location: "Auditoria Interna", condition: "OPTIMAL", status: "COMPLETED", comments: "Auditoria de despacho aprobada" }] }
]);

// 14. email_verifications (Compatible con EmailVerification.java)
visonsDb.email_verifications.insertMany(Array.from({length: 10}, function(_, i) {
  return {
    _id: "EV-00" + (i + 1),
    email: "user" + (i + 1) + "@visons.com",
    token: "TOKEN-EV-" + (1000 + i),
    verificationCode: "CODE-" + (1000 + i),
    expirationDate: new Date(2027, 5, i + 1),
    verified: true
  };
}));

// 15. revoked_tokens (Compatible con RevokedToken.java)
visonsDb.revoked_tokens.insertMany(Array.from({length: 10}, function(_, i) {
  return {
    _id: "RT-00" + (i + 1),
    token: "SIG_HEX_HASH_" + (i + 1),
    tokenSignature: "SIG_HEX_HASH_" + (i + 1),
    revokedAt: new Date(),
    expiresAt: new Date(2027, 0, i + 1),
    reason: "LOGOUT_SESSION"
  };
}));

// 16. rate_limits (Compatible con RateLimit.java)
visonsDb.rate_limits.insertMany(Array.from({length: 10}, function(_, i) {
  return {
    _id: "RL-00" + (i + 1),
    ipAddress: "192.168.1." + (i + 10),
    endpoint: "/api/v1/orders",
    requestCount: (i + 1) * 2,
    windowStart: new Date(),
    windowEnd: new Date(Date.now() + 60000)
  };
}));

// schema_changes
visonsDb.schema_changes.insertMany([
  { sequence: 1, changeId: "V001__baseline", checksum: "e3b0c442", gitSha: "main", releaseVersion: "v1.0.0", appliedAt: new Date() },
  { sequence: 2, changeId: "V002__add_description", checksum: "a1b2c3d4", gitSha: "main", releaseVersion: "v1.1.0", appliedAt: new Date() },
  { sequence: 3, changeId: "V003__add_missing_collections", checksum: "b2c3d4e5", gitSha: "main", releaseVersion: "v1.2.0", appliedAt: new Date() },
  { sequence: 4, changeId: "V004__align_backend_schemas", checksum: "c3d4e5f6", gitSha: "main", releaseVersion: "v1.3.0", appliedAt: new Date() }
]);

print("=====================================================================");
print("[SUCCESS] MongoDB: 16 Colecciones 100% alineadas con el Backend Java y Python.");
print("=====================================================================");
