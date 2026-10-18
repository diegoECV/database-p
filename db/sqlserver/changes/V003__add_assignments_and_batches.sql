-- V002__add_assignments_and_batches.sql

CREATE TABLE ASSIGNMENTS (
  assignment_id INT IDENTITY(1,1) PRIMARY KEY,
  order_id INT NOT NULL,
  assignment_type VARCHAR(100),
  assigned_to VARCHAR(255),
  assigned_by VARCHAR(255),
  priority VARCHAR(50),
  status VARCHAR(50),
  notes NVARCHAR(MAX),
  assignment_date DATE,
  due_date DATE,
  completion_date DATE
);

CREATE TABLE BATCHES (
  batch_id INT IDENTITY(1,1) PRIMARY KEY,
  product_code VARCHAR(255),
  provider_id VARCHAR(255),
  field_name VARCHAR(255),
  harvest_date DATE,
  packing_date DATE,
  production_date DATE,
  expiration_date DATE
);

ALTER TABLE ASSIGNMENTS ADD CONSTRAINT FK_assignment_order FOREIGN KEY (order_id) REFERENCES ORDERS (order_id);
