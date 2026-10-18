--liquibase formatted sql

--changeset lizeth:001-create-orders
CREATE TABLE ORDERS (
  order_id                INT IDENTITY(1,1) PRIMARY KEY,
  client_id               VARCHAR(255)  NOT NULL,
  order_code              NVARCHAR(50)  NULL UNIQUE,
  order_date              DATE          NOT NULL DEFAULT GETDATE(),
  incoterm                CHAR(3)       NULL,
  status                  NVARCHAR(50)  NULL,
  status_description      NVARCHAR(255) NULL,
  currency                VARCHAR(10)   NULL,
  payment_terms           VARCHAR(255)  NULL,
  destination_port        VARCHAR(255)  NULL,
  estimated_shipping_date DATE          NULL
);
--rollback DROP TABLE ORDERS;

--changeset lizeth:002-create-order-details
CREATE TABLE ORDER_DETAILS (
  order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
  order_id        INT             NOT NULL,
  product_id      VARCHAR(255)    NOT NULL,
  batch_id        VARCHAR(255)    NULL,
  quantity_kg     DECIMAL(18,3)   NOT NULL,
  unit_price      DECIMAL(18,4)   NOT NULL,
  quantity_boxes  INT             NULL,
  total_price     DECIMAL(18,4)   NULL
);
--rollback DROP TABLE ORDER_DETAILS;

--changeset diego:003-create-audit-logs
CREATE TABLE AUDIT_LOGS (
  id              BIGINT IDENTITY(1,1) PRIMARY KEY,
  user_id         VARCHAR(255),
  username        VARCHAR(255),
  action          VARCHAR(50),
  resource        VARCHAR(100),
  resource_id     VARCHAR(255),
  timestamp       DATETIME2,
  changes_before  NVARCHAR(MAX),
  changes_after   NVARCHAR(MAX),
  ip_address      VARCHAR(100)
);
--rollback DROP TABLE AUDIT_LOGS;

--changeset camila:004-create-payments
CREATE TABLE PAYMENTS (
  payment_id      INT IDENTITY(1,1) PRIMARY KEY,
  order_id        INT,
  amount          DECIMAL(18,2),
  payment_date    DATETIME2,
  payment_method  VARCHAR(50),
  reference_code  VARCHAR(100),
  notes           NVARCHAR(MAX)
);
--rollback DROP TABLE PAYMENTS;

--changeset camila:005-create-invoices
CREATE TABLE INVOICES (
  invoice_id        INT IDENTITY(1,1) PRIMARY KEY,
  order_id          INT,
  invoice_number    VARCHAR(100),
  issue_date        DATETIME2,
  due_date          DATETIME2,
  currency          VARCHAR(10),
  subtotal          DECIMAL(18,2),
  taxes             DECIMAL(18,2),
  total             DECIMAL(18,2),
  status            VARCHAR(50),
  document_type     VARCHAR(50)   NULL,
  exchange_rate     DECIMAL(10,4) NULL,
  sunat_cdr_status  VARCHAR(50)   NULL
);
--rollback DROP TABLE INVOICES;

--changeset diego:006-create-shipments
CREATE TABLE SHIPMENTS (
  shipment_id          INT IDENTITY(1,1) PRIMARY KEY,
  order_id             INT,
  bl_number            VARCHAR(100),
  vessel_name          VARCHAR(255),
  container_number     VARCHAR(100),
  departure_port       VARCHAR(255),
  arrival_port         VARCHAR(255),
  departure_date       DATETIME2,
  estimated_arrival    DATETIME2,
  status               VARCHAR(50),
  temperature_setpoint DECIMAL(5,2)
);
--rollback DROP TABLE SHIPMENTS;

--changeset diego:007-create-shipment-items
CREATE TABLE SHIPMENT_ITEMS (
  item_id          INT IDENTITY(1,1) PRIMARY KEY,
  shipment_id      INT,
  product_id       VARCHAR(255),
  quantity_pallets INT,
  quantity_boxes   INT,
  net_weight_kg    DECIMAL(18,2),
  gross_weight_kg  DECIMAL(18,2)
);
--rollback DROP TABLE SHIPMENT_ITEMS;

--changeset lizeth:008-create-certificates
CREATE TABLE CERTIFICATES (
  certificate_id      INT IDENTITY(1,1) PRIMARY KEY,
  shipment_id         INT,
  batch_id            VARCHAR(255),
  type                VARCHAR(100),
  issued_by           VARCHAR(255),
  issue_date          DATETIME2,
  expiry_date         DATETIME2,
  certificate_number  VARCHAR(100),
  file_url            NVARCHAR(MAX)
);
--rollback DROP TABLE CERTIFICATES;

--changeset lizeth:009-create-customs-declarations
CREATE TABLE CUSTOMS_DECLARATIONS (
  declaration_id  INT IDENTITY(1,1) PRIMARY KEY,
  shipment_id     INT,
  dam_number      VARCHAR(100),
  fob_value       DECIMAL(18,2),
  customs_agency  VARCHAR(255),
  filing_date     DATETIME2,
  status          VARCHAR(50)
);
--rollback DROP TABLE CUSTOMS_DECLARATIONS;

--changeset diego:010-create-batches
CREATE TABLE BATCHES (
  batch_id        INT IDENTITY(1,1) PRIMARY KEY,
  product_code    VARCHAR(255),
  provider_id     VARCHAR(255),
  field_name      VARCHAR(255),
  harvest_date    DATE,
  packing_date    DATE,
  production_date DATE,
  expiration_date DATE
);
--rollback DROP TABLE BATCHES;

--changeset lizeth:011-create-assignments
CREATE TABLE ASSIGNMENTS (
  assignment_id   INT IDENTITY(1,1) PRIMARY KEY,
  order_id        INT NOT NULL,
  assignment_type VARCHAR(100),
  assigned_to     VARCHAR(255),
  assigned_by     VARCHAR(255),
  priority        VARCHAR(50),
  status          VARCHAR(50),
  notes           NVARCHAR(MAX),
  assignment_date DATE,
  due_date        DATE,
  completion_date DATE
);
--rollback DROP TABLE ASSIGNMENTS;
