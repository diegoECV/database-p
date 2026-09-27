-- V002__add_assignments_and_batches.sql

CREATE TABLE ASSIGNMENTS (
  assignment_id INT IDENTITY(1,1) PRIMARY KEY,
  order_id INT NOT NULL,
  assigned_to VARCHAR(255),
  assignment_date DATE,
  status VARCHAR(50)
);

CREATE TABLE BATCHES (
  batch_id INT IDENTITY(1,1) PRIMARY KEY,
  product_code VARCHAR(255),
  production_date DATE,
  expiration_date DATE
);

ALTER TABLE ASSIGNMENTS ADD CONSTRAINT FK_assignment_order FOREIGN KEY (order_id) REFERENCES ORDERS (order_id);
