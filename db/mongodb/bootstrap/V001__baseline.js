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

visonsDb.clients.insertMany([
  {
    _id: "CLI-001",
    documentType: "TAX_ID",
    documentNumber: "US948201948",
    companyName: "Global Agro Imports LLC",
    contactName: "John Miller",
    country: "Estados Unidos",
    email: "jmiller@globalagro.com",
    phone: "+1-305-555-0143",
    address: "742 Evergreen Terrace, Miami, FL",
    preferredIncoterm: "CIF",
    destinationPort: "Port of Miami",
    paymentTerms: "Net 30",
    preferredCurrency: "USD",
    creditLimit: 150000.0,
    language: "en",
    isActive: true,
    createdAt: "2026-01-15T08:30:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-15T08:30:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-002",
    documentType: "VAT",
    documentNumber: "NL820491823B01",
    companyName: "EuroFruit Logistics B.V.",
    contactName: "Anouk van Dijk",
    country: "Países Bajos",
    email: "anouk@eurofruit.nl",
    phone: "+31-10-555-9821",
    address: "Havenstraat 45, Rotterdam",
    preferredIncoterm: "FOB",
    destinationPort: "Port of Rotterdam",
    paymentTerms: "Letter of Credit",
    preferredCurrency: "EUR",
    creditLimit: 250000.0,
    language: "en",
    isActive: true,
    createdAt: "2026-01-16T09:15:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-16T09:15:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-003",
    documentType: "VAT",
    documentNumber: "ESB83920194",
    companyName: "Iberia Frutas Selectas S.L.",
    contactName: "Carlos Mendoza",
    country: "España",
    email: "cmendoza@iberiafrutas.es",
    phone: "+34-91-444-1234",
    address: "Mercamadrid Nave 12, Madrid",
    preferredIncoterm: "DDP",
    destinationPort: "Puerto de Valencia",
    paymentTerms: "Net 45",
    preferredCurrency: "EUR",
    creditLimit: 120000.0,
    language: "es",
    isActive: true,
    createdAt: "2026-01-18T10:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-18T10:00:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-004",
    documentType: "BUSINESS_ID",
    documentNumber: "UK928172635",
    companyName: "GreenHarvest Wholesale UK",
    contactName: "Oliver Smith",
    country: "Reino Unido",
    email: "oliver@greenharvest.co.uk",
    phone: "+44-20-7946-0912",
    address: "Docklands Business Park, London",
    preferredIncoterm: "CFR",
    destinationPort: "Port of London Gateway",
    paymentTerms: "Net 60",
    preferredCurrency: "USD",
    creditLimit: 180000.0,
    language: "en",
    isActive: true,
    createdAt: "2026-01-20T11:20:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-20T11:20:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-005",
    documentType: "CNPJ",
    documentNumber: "12.345.678/0001-90",
    companyName: "Tropicalia Alimentos Ltda",
    contactName: "Thiago Silva",
    country: "Brasil",
    email: "thiago@tropicalia.com.br",
    phone: "+55-11-9876-5432",
    address: "Av. Paulista 1000, São Paulo",
    preferredIncoterm: "FOB",
    destinationPort: "Porto de Santos",
    paymentTerms: "Cash in Advance",
    preferredCurrency: "USD",
    creditLimit: 90000.0,
    language: "pt",
    isActive: true,
    createdAt: "2026-01-22T14:10:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-22T14:10:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-006",
    documentType: "RUT",
    documentNumber: "76.543.210-K",
    companyName: "Andina Fresh SpA",
    contactName: "Camila Gomez",
    country: "Chile",
    email: "cgomez@andinafresh.cl",
    phone: "+56-2-2345-6789",
    address: "Camino a Valparaíso 500, Santiago",
    preferredIncoterm: "FOB",
    destinationPort: "Puerto de San Antonio",
    paymentTerms: "Net 30",
    preferredCurrency: "USD",
    creditLimit: 110000.0,
    language: "es",
    isActive: true,
    createdAt: "2026-01-24T16:05:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-24T16:05:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-007",
    documentType: "TAX_ID",
    documentNumber: "DE198273645",
    companyName: "Nordic Organic Markt GmbH",
    contactName: "Lukas Weber",
    country: "Alemania",
    email: "lweber@nordicorganic.de",
    phone: "+49-40-1234-5678",
    address: "Speicherstadt Block D, Hamburg",
    preferredIncoterm: "CIF",
    destinationPort: "Port of Hamburg",
    paymentTerms: "Net 30",
    preferredCurrency: "EUR",
    creditLimit: 300000.0,
    language: "de",
    isActive: true,
    createdAt: "2026-01-25T13:45:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-25T13:45:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-008",
    documentType: "TAX_ID",
    documentNumber: "JP0918273645",
    companyName: "Tokyo Fresh Distribution K.K.",
    contactName: "Kenji Sato",
    country: "Japón",
    email: "kenji.sato@tokyofresh.jp",
    phone: "+81-3-5555-7890",
    address: "Toyosu Market District, Tokyo",
    preferredIncoterm: "CIF",
    destinationPort: "Port of Tokyo",
    paymentTerms: "Letter of Credit",
    preferredCurrency: "USD",
    creditLimit: 400000.0,
    language: "ja",
    isActive: true,
    createdAt: "2026-01-27T08:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-27T08:00:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-009",
    documentType: "TAX_ID",
    documentNumber: "CA829102938",
    companyName: "Maple Leaf Produce Canada",
    contactName: "Sarah Tremblay",
    country: "Canadá",
    email: "stremblay@mapleproduce.ca",
    phone: "+1-416-555-0199",
    address: "Queen Street West 150, Toronto, ON",
    preferredIncoterm: "DAP",
    destinationPort: "Port of Montreal",
    paymentTerms: "Net 45",
    preferredCurrency: "USD",
    creditLimit: 140000.0,
    language: "en",
    isActive: true,
    createdAt: "2026-01-28T10:30:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-28T10:30:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "CLI-010",
    documentType: "RUC",
    documentNumber: "20601234567",
    companyName: "Pacific Trade Corporation S.A.C.",
    contactName: "Alvaro Fernandez",
    country: "Perú",
    email: "afernandez@pacifictrade.pe",
    phone: "+51-1-619-8900",
    address: "Av. Elmer Faucett 2100, Callao",
    preferredIncoterm: "FOB",
    destinationPort: "Puerto del Callao",
    paymentTerms: "Net 15",
    preferredCurrency: "USD",
    creditLimit: 200000.0,
    language: "es",
    isActive: true,
    createdAt: "2026-01-30T17:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-30T17:00:00",
    updatedBy: "ADMIN"
  }
]);

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
