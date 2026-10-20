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

visonsDb.products.insertMany([
  {
    _id: "PROD-001",
    code: "PROD-ESP-01",
    name: "Espárrago Verde Fresco Calibre Jumbo",
    scientificName: "Asparagus officinalis",
    categoryId: "CAT-01",
    variety: "UC-157 F1",
    caliber: "Jumbo (16-22 mm)",
    unitMeasure: "KG",
    hsCode: "0709.20.00.00",
    storageTemperature: "2°C - 4°C",
    shelfLifeDays: 28,
    packagingType: "Caja de Cartón Hydrocooler 5Kg",
    originRegion: "Ica",
    qualityGrade: "CAT_EXTRA",
    organicCertification: "GLOBAL_GAP",
    isActive: true,
    createdAt: "2026-01-10T08:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-10T08:00:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-002",
    code: "PROD-ESP-02",
    name: "Espárrago Blanco Gourmet Standard",
    scientificName: "Asparagus officinalis",
    categoryId: "CAT-01",
    variety: "Grolim",
    caliber: "Standard (12-16 mm)",
    unitMeasure: "KG",
    hsCode: "0709.20.00.00",
    storageTemperature: "1°C - 3°C",
    shelfLifeDays: 25,
    packagingType: "Caja Madera 5Kg",
    originRegion: "La Libertad",
    qualityGrade: "PREMIUM",
    organicCertification: "GLOBAL_GAP",
    isActive: true,
    createdAt: "2026-01-11T09:30:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-11T09:30:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-003",
    code: "PROD-PAL-01",
    name: "Palta Hass de Exportación Calibre 14",
    scientificName: "Persea americana Hass",
    categoryId: "CAT-02",
    variety: "Hass",
    caliber: "Calibre 14 (258-313g)",
    unitMeasure: "KG",
    hsCode: "0804.40.00.00",
    storageTemperature: "5°C - 7°C",
    shelfLifeDays: 35,
    packagingType: "Caja de Cartón Corrugado 4Kg",
    originRegion: "Ica",
    qualityGrade: "CAT_EXTRA",
    organicCertification: "USDA_ORGANIC",
    isActive: true,
    createdAt: "2026-01-12T10:15:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-12T10:15:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-004",
    code: "PROD-PAL-02",
    name: "Palta Fuerte Premium Calibre 18",
    scientificName: "Persea americana Fuerte",
    categoryId: "CAT-02",
    variety: "Fuerte",
    caliber: "Calibre 18 (203-243g)",
    unitMeasure: "KG",
    hsCode: "0804.40.00.00",
    storageTemperature: "6°C - 8°C",
    shelfLifeDays: 30,
    packagingType: "Caja Cartón 4Kg",
    originRegion: "Moquegua",
    qualityGrade: "CAT_I",
    organicCertification: "CONVENCIONAL",
    isActive: true,
    createdAt: "2026-01-14T11:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-14T11:00:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-005",
    code: "PROD-UVA-01",
    name: "Uva Red Globe de Mesa Sweet",
    scientificName: "Vitis vinifera Red Globe",
    categoryId: "CAT-03",
    variety: "Red Globe",
    caliber: "XL (24-28 mm)",
    unitMeasure: "KG",
    hsCode: "0806.10.00.00",
    storageTemperature: "0°C - 1°C",
    shelfLifeDays: 45,
    packagingType: "Caja Plástica Clamshell 8.2Kg",
    originRegion: "Piura",
    qualityGrade: "PREMIUM",
    organicCertification: "GLOBAL_GAP",
    isActive: true,
    createdAt: "2026-01-15T14:20:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-15T14:20:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-006",
    code: "PROD-UVA-02",
    name: "Uva Autumn Crisp Seedless",
    scientificName: "Vitis vinifera Autumn Crisp",
    categoryId: "CAT-03",
    variety: "Autumn Crisp",
    caliber: "Jumbo Seedless (22-26 mm)",
    unitMeasure: "KG",
    hsCode: "0806.10.00.00",
    storageTemperature: "0°C - 1°C",
    shelfLifeDays: 50,
    packagingType: "Bolsa Pouch en Cartón 8.2Kg",
    originRegion: "Ica",
    qualityGrade: "CAT_EXTRA",
    organicCertification: "GLOBAL_GAP",
    isActive: true,
    createdAt: "2026-01-16T15:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-16T15:00:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-007",
    code: "PROD-ARA-01",
    name: "Arándano Biloxi Fresco Premium",
    scientificName: "Vaccinium corymbosum",
    categoryId: "CAT-04",
    variety: "Biloxi",
    caliber: "Medium (14-16 mm)",
    unitMeasure: "KG",
    hsCode: "0810.40.00.00",
    storageTemperature: "1°C - 2°C",
    shelfLifeDays: 28,
    packagingType: "Master Box 12 Clamshells x 125g",
    originRegion: "La Libertad",
    qualityGrade: "PREMIUM",
    organicCertification: "USDA_ORGANIC",
    isActive: true,
    createdAt: "2026-01-18T08:45:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-18T08:45:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-008",
    code: "PROD-ARA-02",
    name: "Arándano Ventura Jumbo Sweet",
    scientificName: "Vaccinium corymbosum",
    categoryId: "CAT-04",
    variety: "Ventura",
    caliber: "Jumbo (> 18 mm)",
    unitMeasure: "KG",
    hsCode: "0810.40.00.00",
    storageTemperature: "1°C - 2°C",
    shelfLifeDays: 32,
    packagingType: "Master Box 12 Clamshells x 250g",
    originRegion: "Ancash",
    qualityGrade: "CAT_EXTRA",
    organicCertification: "GLOBAL_GAP",
    isActive: true,
    createdAt: "2026-01-20T11:10:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-20T11:10:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-009",
    code: "PROD-MAN-01",
    name: "Mango Kent de Exportación Aéreo",
    scientificName: "Mangifera indica Kent",
    categoryId: "CAT-05",
    variety: "Kent",
    caliber: "Calibre 9 (400-480g)",
    unitMeasure: "KG",
    hsCode: "0804.50.20.00",
    storageTemperature: "10°C - 12°C",
    shelfLifeDays: 21,
    packagingType: "Caja Telescópica 4Kg",
    originRegion: "Piura",
    qualityGrade: "CAT_EXTRA",
    organicCertification: "GLOBAL_GAP",
    isActive: true,
    createdAt: "2026-01-22T13:40:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-22T13:40:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROD-010",
    code: "PROD-MAN-02",
    name: "Mango Haden Tratamiento Hidrotérmico",
    scientificName: "Mangifera indica Haden",
    categoryId: "CAT-05",
    variety: "Haden",
    caliber: "Calibre 10 (350-400g)",
    unitMeasure: "KG",
    hsCode: "0804.50.20.00",
    storageTemperature: "10°C - 12°C",
    shelfLifeDays: 18,
    packagingType: "Caja Cartón 4Kg",
    originRegion: "Lambayeque",
    qualityGrade: "CAT_I",
    organicCertification: "CONVENCIONAL",
    isActive: true,
    createdAt: "2026-01-25T16:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-25T16:00:00",
    updatedBy: "ADMIN"
  }
]);

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

visonsDb.providers.insertMany([
  {
    _id: "PROV-001",
    documentType: "RUC",
    documentNumber: "20489102931",
    companyName: "Agrícola Fundo San José S.A.C.",
    contactName: "Mateo Carpio Ramos",
    country: "Perú",
    email: "mcarpio@fundosanjose.pe",
    phone: "+51-956-234891",
    address: "Valle de Ica Km 298, Fundo San José",
    department: "Ica",
    province: "Ica",
    district: "Santiago",
    ubigeo: "110111",
    mainCrop: "Espárrago Verde",
    bankAccountCci: "002-191-002348912301-52",
    certificationStatus: "GLOBAL_GAP_CERTIFIED",
    isActive: true,
    createdAt: "2026-01-10T08:30:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-10T08:30:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-002",
    documentType: "RUC",
    documentNumber: "20592817234",
    companyName: "Exportadora Valle Verde E.I.R.L.",
    contactName: "Valeria Palacios Núñez",
    country: "Perú",
    email: "vpalacios@valleverde.com.pe",
    phone: "+51-944-556677",
    address: "Sector Villacurí Parcela 12B",
    department: "Ica",
    province: "Ica",
    district: "Salas Guadalupe",
    ubigeo: "110108",
    mainCrop: "Palta Hass",
    bankAccountCci: "003-191-005928172341-19",
    certificationStatus: "SENASA_V5_APPROVED",
    isActive: true,
    createdAt: "2026-01-12T09:15:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-12T09:15:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-003",
    documentType: "RUC",
    documentNumber: "20601928374",
    companyName: "Corporación Agrícola del Norte S.A.",
    contactName: "Guillermo Zavaleta Vega",
    country: "Perú",
    email: "gzavaleta@agronorte.pe",
    phone: "+51-972-334455",
    address: "Valle Chicama Lote 8, Ascope",
    department: "La Libertad",
    province: "Ascope",
    district: "Chicama",
    ubigeo: "130202",
    mainCrop: "Espárrago Blanco",
    bankAccountCci: "002-193-006019283741-88",
    certificationStatus: "GLOBAL_GAP_CERTIFIED",
    isActive: true,
    createdAt: "2026-01-14T10:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-14T10:00:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-004",
    documentType: "RUC",
    documentNumber: "20518293041",
    companyName: "Frutas de Piura & Valle S.A.C.",
    contactName: "Hernan Carrasco Panta",
    country: "Perú",
    email: "hcarrasco@frutaspiura.pe",
    phone: "+51-969-112233",
    address: "Carretera Tambogrande Km 42",
    department: "Piura",
    province: "Piura",
    district: "Tambogrande",
    ubigeo: "200114",
    mainCrop: "Mango Kent",
    bankAccountCci: "011-191-005182930412-44",
    certificationStatus: "USDA_ORGANIC_VERIFIED",
    isActive: true,
    createdAt: "2026-01-16T11:20:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-16T11:20:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-005",
    documentType: "RUC",
    documentNumber: "20491827365",
    companyName: "Agroindustrial Huarmey S.A.C.",
    contactName: "Cesar Morales Benitez",
    country: "Perú",
    email: "cmorales@agrohuarmey.com",
    phone: "+51-943-778899",
    address: "Valle Culebras Sector El Molino",
    department: "Ancash",
    province: "Huarmey",
    district: "Culebras",
    ubigeo: "021103",
    mainCrop: "Arándanos Biloxi",
    bankAccountCci: "002-192-004918273652-33",
    certificationStatus: "GLOBAL_GAP_CERTIFIED",
    isActive: true,
    createdAt: "2026-01-18T14:10:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-18T14:10:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-006",
    documentType: "RUC",
    documentNumber: "20583920194",
    companyName: "Viñedos Los Huarangos S.A.C.",
    contactName: "Julio Cueto Barreto",
    country: "Perú",
    email: "jcueto@loshuarangos.pe",
    phone: "+51-956-889900",
    address: "Camino Real a Huacachina Parcela 4",
    department: "Ica",
    province: "Ica",
    district: "Subtanjalla",
    ubigeo: "110113",
    mainCrop: "Uva Red Globe",
    bankAccountCci: "003-192-005839201941-77",
    certificationStatus: "GLOBAL_GAP_CERTIFIED",
    isActive: true,
    createdAt: "2026-01-20T15:30:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-20T15:30:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-007",
    documentType: "RUC",
    documentNumber: "20603829104",
    companyName: "Campos del Chira E.I.R.L.",
    contactName: "Rosaura Mogollón Vite",
    country: "Perú",
    email: "rmogollon@camposdelchira.pe",
    phone: "+51-968-445566",
    address: "Valle del Chira Sector Marcavelica",
    department: "Piura",
    province: "Sullana",
    district: "Marcavelica",
    ubigeo: "200605",
    mainCrop: "Uva Seedless",
    bankAccountCci: "011-192-006038291042-55",
    certificationStatus: "GLOBAL_GAP_CERTIFIED",
    isActive: true,
    createdAt: "2026-01-22T08:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-22T08:00:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-008",
    documentType: "RUC",
    documentNumber: "20472819302",
    companyName: "Asociación Agroecológica Virú",
    contactName: "Efrain Alayo Huaman",
    country: "Perú",
    email: "ealayo@viruecologico.pe",
    phone: "+51-949-332211",
    address: "Panamericana Norte Km 520, Virú",
    department: "La Libertad",
    province: "Virú",
    district: "Virú",
    ubigeo: "131201",
    mainCrop: "Palta Hass Orgánica",
    bankAccountCci: "002-194-004728193021-99",
    certificationStatus: "USDA_ORGANIC_VERIFIED",
    isActive: true,
    createdAt: "2026-01-24T10:45:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-24T10:45:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-009",
    documentType: "RUC",
    documentNumber: "20604928172",
    companyName: "Productores de Berries del Centro",
    contactName: "Dario Lujan Paucar",
    country: "Perú",
    email: "dlujan@berriescentro.pe",
    phone: "+51-964-129834",
    address: "Valle de Cañete Fundo San Pedro",
    department: "Lima",
    province: "Cañete",
    district: "San Vicente",
    ubigeo: "150501",
    mainCrop: "Arándano Ventura",
    bankAccountCci: "003-193-006049281721-66",
    certificationStatus: "GLOBAL_GAP_CERTIFIED",
    isActive: true,
    createdAt: "2026-01-26T14:00:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-26T14:00:00",
    updatedBy: "ADMIN"
  },
  {
    _id: "PROV-010",
    documentType: "RUC",
    documentNumber: "20593847281",
    companyName: "Fundo Los Pinos Agroexport S.A.C.",
    contactName: "Santiago Rivas Flores",
    country: "Perú",
    email: "srivas@fundolospinos.com.pe",
    phone: "+51-956-334411",
    address: "Valle de Chincha Alta Km 201",
    department: "Ica",
    province: "Chincha",
    district: "Chincha Alta",
    ubigeo: "110201",
    mainCrop: "Espárrago Verde",
    bankAccountCci: "002-191-005938472812-11",
    certificationStatus: "SENASA_V5_APPROVED",
    isActive: true,
    createdAt: "2026-01-28T16:30:00",
    createdBy: "ADMIN",
    updatedAt: "2026-01-28T16:30:00",
    updatedBy: "ADMIN"
  }
]);

visonsDb.inventory_batches.insertMany(Array.from({length: 10}, (_, i) => ({ _id: "BATCH-00" + (i+1), product_id: "PROD-00" + (i+1), provider_id: "PROV-00" + (i+1), expiration_date: new Date(2027, 0, i+1), quantity: 1000 })));

visonsDb.email_verifications.insertMany(Array.from({length: 10}, (_, i) => ({ token: "TOKEN_V_" + (i+1), user_id: "U-00" + (i+1), expires_at: new Date(2027, 0, i+1) })));

visonsDb.revoked_tokens.insertMany(Array.from({length: 10}, (_, i) => ({ token: "TOKEN_R_" + (i+1), revoked_at: new Date() })));

visonsDb.rate_limits.insertMany(Array.from({length: 10}, (_, i) => ({ ip: "192.168.1." + (i+1), requests: i, last_request: new Date() })));

visonsDb.quality_inspections.insertMany(Array.from({length: 10}, (_, i) => ({ batch_id: "BATCH-00" + (i+1), inspector_id: "U-00" + (i+1), product: "Producto " + (i+1), status: "APPROVED", date: new Date() })));

visonsDb.temperature_logs.insertMany(Array.from({length: 10}, (_, i) => ({ shipment_id: (i+1), recorded_at: new Date(), temperature: 4.0 + (i%2) })));

visonsDb.traceability_logs.insertMany(Array.from({length: 10}, (_, i) => ({ batch_id: "BATCH-00" + (i+1), action: "TRANSFERRED", user_id: "U-00" + (i+1), timestamp: new Date() })));

visonsDb.price_lists.insertMany(Array.from({length: 10}, (_, i) => ({ product_id: "PROD-00" + (i+1), effective_date: new Date(), price: 10.50 + i })));

print('[SUCCESS] V001__baseline.js aplicado: colecciones, semilla y control de versiones inicializados.');
