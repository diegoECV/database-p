-- V001__baseline.sql
-- Bootstrap inicial de SQL Server para VISONS S.A.C.
-- Crea la base de datos, esquemas, tablas transaccionales, tabla de control de versiones y datos semilla.

-- Esquema de control de versiones del esquema
CREATE SCHEMA control AUTHORIZATION dbo;
GO

CREATE TABLE control.schema_change (
  sequence        INT           NOT NULL PRIMARY KEY,
  change_id       NVARCHAR(120) NOT NULL UNIQUE,
  checksum        NVARCHAR(64)  NOT NULL,
  git_sha         NVARCHAR(40)  NOT NULL,
  release_version NVARCHAR(30)  NOT NULL,
  applied_at      DATETIME2     NOT NULL DEFAULT SYSDATETIME()
);
GO

-- Tablas transaccionales principales
CREATE TABLE ORDERS (
  order_id    INT IDENTITY(1,1) PRIMARY KEY,
  client_id   VARCHAR(255)  NOT NULL,
  order_code  NVARCHAR(50)  NULL UNIQUE,
  order_date  DATE          NOT NULL DEFAULT GETDATE(),
  incoterm    CHAR(3)       NULL,
  status      NVARCHAR(50)  NULL
);
GO

CREATE TABLE ORDER_DETAILS (
  order_detail_id INT IDENTITY(1,1) PRIMARY KEY,
  order_id        INT             NOT NULL,
  product_id      VARCHAR(255)    NOT NULL,
  batch_id        VARCHAR(255)    NULL,
  quantity_kg     DECIMAL(18,3)   NOT NULL,
  unit_price      DECIMAL(18,4)   NOT NULL
);
GO

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
GO

CREATE TABLE PAYMENTS (
  payment_id      INT IDENTITY(1,1) PRIMARY KEY,
  order_id        INT,
  amount          DECIMAL(18,2),
  payment_date    DATETIME2,
  payment_method  VARCHAR(50),
  reference_code  VARCHAR(100),
  notes           NVARCHAR(MAX)
);
GO

CREATE TABLE INVOICES (
  invoice_id      INT IDENTITY(1,1) PRIMARY KEY,
  order_id        INT,
  invoice_number  VARCHAR(100),
  issue_date      DATETIME2,
  due_date        DATETIME2,
  currency        VARCHAR(10),
  subtotal        DECIMAL(18,2),
  taxes           DECIMAL(18,2),
  total           DECIMAL(18,2),
  status          VARCHAR(50)
);
GO

CREATE TABLE SHIPMENTS (
  shipment_id         INT IDENTITY(1,1) PRIMARY KEY,
  order_id            INT,
  bl_number           VARCHAR(100),
  vessel_name         VARCHAR(255),
  container_number    VARCHAR(100),
  departure_port      VARCHAR(255),
  arrival_port        VARCHAR(255),
  departure_date      DATETIME2,
  estimated_arrival   DATETIME2,
  status              VARCHAR(50),
  temperature_setpoint DECIMAL(5,2)
);
GO

CREATE TABLE SHIPMENT_ITEMS (
  item_id          INT IDENTITY(1,1) PRIMARY KEY,
  shipment_id      INT,
  product_id       VARCHAR(255),
  quantity_pallets INT,
  quantity_boxes   INT,
  net_weight_kg    DECIMAL(18,2),
  gross_weight_kg  DECIMAL(18,2)
);
GO

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
GO

CREATE TABLE CUSTOMS_DECLARATIONS (
  declaration_id  INT IDENTITY(1,1) PRIMARY KEY,
  shipment_id     INT,
  dam_number      VARCHAR(100),
  fob_value       DECIMAL(18,2),
  customs_agency  VARCHAR(255),
  filing_date     DATETIME2,
  status          VARCHAR(50)
);
GO

-- Restricciones de integridad referencial
ALTER TABLE ORDER_DETAILS     ADD CONSTRAINT FK_od_order    FOREIGN KEY (order_id)    REFERENCES ORDERS (order_id);
ALTER TABLE PAYMENTS          ADD CONSTRAINT FK_pay_order   FOREIGN KEY (order_id)    REFERENCES ORDERS (order_id);
ALTER TABLE INVOICES          ADD CONSTRAINT FK_inv_order   FOREIGN KEY (order_id)    REFERENCES ORDERS (order_id);
ALTER TABLE SHIPMENTS         ADD CONSTRAINT FK_ship_order  FOREIGN KEY (order_id)    REFERENCES ORDERS (order_id);
ALTER TABLE SHIPMENT_ITEMS    ADD CONSTRAINT FK_si_ship     FOREIGN KEY (shipment_id) REFERENCES SHIPMENTS (shipment_id);
ALTER TABLE CERTIFICATES      ADD CONSTRAINT FK_cert_ship   FOREIGN KEY (shipment_id) REFERENCES SHIPMENTS (shipment_id);
ALTER TABLE CUSTOMS_DECLARATIONS ADD CONSTRAINT FK_cd_ship  FOREIGN KEY (shipment_id) REFERENCES SHIPMENTS (shipment_id);
GO

-- 5. Datos Semilla (Seed) Coherentes
PRINT 'Insertando semillas en SQL Server...';
GO

-- 10 ORDERS (Client IDs from CLI-001 to CLI-010)
INSERT INTO ORDERS (client_id, order_code, order_date, incoterm, status) VALUES
('CLI-001', 'ORD-001', '2026-09-01', 'FOB', 'COMPLETED'),
('CLI-002', 'ORD-002', '2026-09-02', 'CIF', 'COMPLETED'),
('CLI-003', 'ORD-003', '2026-09-03', 'EXW', 'COMPLETED'),
('CLI-004', 'ORD-004', '2026-09-04', 'FOB', 'PENDING'),
('CLI-005', 'ORD-005', '2026-09-05', 'CIF', 'PENDING'),
('CLI-006', 'ORD-006', '2026-09-06', 'FCA', 'SHIPPED'),
('CLI-007', 'ORD-007', '2026-09-07', 'FOB', 'SHIPPED'),
('CLI-008', 'ORD-008', '2026-09-08', 'CIF', 'DELIVERED'),
('CLI-009', 'ORD-009', '2026-09-09', 'EXW', 'PROCESSING'),
('CLI-010', 'ORD-010', '2026-09-10', 'FOB', 'PROCESSING');
GO

-- 10 ORDER_DETAILS (Referencing 10 Products and 10 Batches)
INSERT INTO ORDER_DETAILS (order_id, product_id, batch_id, quantity_kg, unit_price) VALUES
(1, 'PROD-001', 'BATCH-001', 500.00, 2.50),
(2, 'PROD-002', 'BATCH-002', 1000.00, 3.20),
(3, 'PROD-003', 'BATCH-003', 750.00, 1.80),
(4, 'PROD-004', 'BATCH-004', 1200.00, 2.45),
(5, 'PROD-005', 'BATCH-005', 800.00, 3.15),
(6, 'PROD-006', 'BATCH-006', 2000.00, 4.00),
(7, 'PROD-007', 'BATCH-007', 300.00, 2.60),
(8, 'PROD-008', 'BATCH-008', 600.00, 1.90),
(9, 'PROD-009', 'BATCH-009', 1500.00, 3.10),
(10, 'PROD-010', 'BATCH-010', 2500.00, 3.90);
GO

-- 10 AUDIT_LOGS (Referencing Users from U-001 to U-010)
INSERT INTO AUDIT_LOGS (user_id, username, action, resource, resource_id, timestamp, ip_address) VALUES
('U-001', 'Usuario 1', 'LOGIN', 'System', null, '2026-09-18T08:00:00', '192.168.1.10'),
('U-002', 'Usuario 2', 'CREATE', 'Order', '1', '2026-09-18T08:15:22', '192.168.1.12'),
('U-003', 'Usuario 3', 'UPDATE', 'Inventory', 'PROD-001', '2026-09-18T09:30:10', '192.168.1.15'),
('U-004', 'Usuario 4', 'DELETE', 'User', 'U-011', '2026-09-18T10:05:00', '192.168.1.10'),
('U-005', 'Usuario 5', 'UPDATE', 'Order', '2', '2026-09-18T11:20:00', '192.168.1.12'),
('U-006', 'Usuario 6', 'CREATE', 'Shipment', '1', '2026-09-18T13:45:00', '192.168.1.15'),
('U-007', 'Usuario 7', 'UPDATE', 'Role', 'R-02', '2026-09-18T14:10:00', '192.168.1.10'),
('U-008', 'Usuario 8', 'LOGIN', 'System', null, '2026-09-18T15:00:00', '192.168.1.12'),
('U-009', 'Usuario 9', 'UPDATE', 'Invoice', '1', '2026-09-18T16:30:00', '192.168.1.15'),
('U-010', 'Usuario 10', 'LOGOUT', 'System', null, '2026-09-18T18:00:00', '192.168.1.10');
GO

-- 10 PAYMENTS
INSERT INTO PAYMENTS (order_id, amount, payment_date, payment_method, reference_code) VALUES
(1, 1250.00, '2026-09-02', 'WIRE_TRANSFER', 'TXN-0001'),
(2, 3200.00, '2026-09-03', 'CREDIT_CARD', 'TXN-0002'),
(3, 1350.00, '2026-09-04', 'WIRE_TRANSFER', 'TXN-0003'),
(4, 2940.00, '2026-09-05', 'PAYPAL', 'TXN-0004'),
(5, 2520.00, '2026-09-06', 'WIRE_TRANSFER', 'TXN-0005'),
(6, 8000.00, '2026-09-07', 'LETTER_OF_CREDIT', 'TXN-0006'),
(7, 780.00, '2026-09-08', 'CREDIT_CARD', 'TXN-0007'),
(8, 1140.00, '2026-09-09', 'WIRE_TRANSFER', 'TXN-0008'),
(9, 4650.00, '2026-09-10', 'WIRE_TRANSFER', 'TXN-0009'),
(10, 9750.00, '2026-09-11', 'LETTER_OF_CREDIT', 'TXN-0010');
GO

-- 10 INVOICES
INSERT INTO INVOICES (order_id, invoice_number, issue_date, due_date, currency, subtotal, taxes, total, status) VALUES
(1, 'INV-001', '2026-09-02', '2026-10-02', 'USD', 1250.00, 0.00, 1250.00, 'PAID'),
(2, 'INV-002', '2026-09-03', '2026-10-03', 'USD', 3200.00, 0.00, 3200.00, 'PAID'),
(3, 'INV-003', '2026-09-04', '2026-10-04', 'EUR', 1350.00, 0.00, 1350.00, 'UNPAID'),
(4, 'INV-004', '2026-09-05', '2026-10-05', 'USD', 2940.00, 0.00, 2940.00, 'PARTIAL'),
(5, 'INV-005', '2026-09-06', '2026-10-06', 'USD', 2520.00, 0.00, 2520.00, 'PAID'),
(6, 'INV-006', '2026-09-07', '2026-10-07', 'USD', 8000.00, 0.00, 8000.00, 'PAID'),
(7, 'INV-007', '2026-09-08', '2026-10-08', 'EUR', 780.00, 0.00, 780.00, 'UNPAID'),
(8, 'INV-008', '2026-09-09', '2026-10-09', 'USD', 1140.00, 0.00, 1140.00, 'PAID'),
(9, 'INV-009', '2026-09-10', '2026-10-10', 'USD', 4650.00, 0.00, 4650.00, 'PARTIAL'),
(10, 'INV-010', '2026-09-11', '2026-10-11', 'USD', 9750.00, 0.00, 9750.00, 'PAID');
GO

-- 10 SHIPMENTS
INSERT INTO SHIPMENTS (order_id, bl_number, status) VALUES
(1, 'BL-1001', 'DELIVERED'),
(2, 'BL-1002', 'DELIVERED'),
(3, 'BL-1003', 'IN_TRANSIT'),
(4, 'BL-1004', 'IN_TRANSIT'),
(5, 'BL-1005', 'IN_TRANSIT'),
(6, 'BL-1006', 'IN_TRANSIT'),
(7, 'BL-1007', 'IN_TRANSIT'),
(8, 'BL-1008', 'DELIVERED'),
(9, 'BL-1009', 'PENDING'),
(10, 'BL-1010', 'PENDING');
GO

-- 10 SHIPMENT_ITEMS
INSERT INTO SHIPMENT_ITEMS (shipment_id, product_id, quantity_pallets) VALUES
(1, 'PROD-001', 10),
(2, 'PROD-002', 20),
(3, 'PROD-003', 15),
(4, 'PROD-004', 24),
(5, 'PROD-005', 16),
(6, 'PROD-006', 40),
(7, 'PROD-007', 6),
(8, 'PROD-008', 12),
(9, 'PROD-009', 30),
(10, 'PROD-010', 50);
GO

-- 10 CERTIFICATES
INSERT INTO CERTIFICATES (shipment_id, batch_id, type) VALUES
(1, 'BATCH-001', 'PHYTOSANITARY'),
(2, 'BATCH-002', 'CERTIFICATE_OF_ORIGIN'),
(3, 'BATCH-003', 'QUALITY_INSPECTION'),
(4, 'BATCH-004', 'PHYTOSANITARY'),
(5, 'BATCH-005', 'CERTIFICATE_OF_ORIGIN'),
(6, 'BATCH-006', 'PHYTOSANITARY'),
(7, 'BATCH-007', 'ORGANIC_CERTIFICATION'),
(8, 'BATCH-008', 'QUALITY_INSPECTION'),
(9, 'BATCH-009', 'PHYTOSANITARY'),
(10, 'BATCH-010', 'CERTIFICATE_OF_ORIGIN');
GO

-- 10 CUSTOMS_DECLARATIONS
INSERT INTO CUSTOMS_DECLARATIONS (shipment_id, dam_number, status) VALUES
(1, 'DAM-118-001', 'CLEARED'),
(2, 'DAM-118-002', 'CLEARED'),
(3, 'DAM-118-003', 'UNDER_INSPECTION'),
(4, 'DAM-118-004', 'CLEARED'),
(5, 'DAM-118-005', 'CLEARED'),
(6, 'DAM-118-006', 'UNDER_INSPECTION'),
(7, 'DAM-118-007', 'CLEARED'),
(8, 'DAM-118-008', 'CLEARED'),
(9, 'DAM-118-009', 'PENDING'),
(10, 'DAM-118-010', 'PENDING');
GO

PRINT '[SUCCESS] V001__baseline.sql aplicado: tablas transaccionales, control de versiones y semillas de prueba creados.';
GO
