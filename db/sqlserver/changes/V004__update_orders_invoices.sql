-- V004__update_orders_invoices.sql

ALTER TABLE ORDERS 
ADD currency VARCHAR(10),
    payment_terms VARCHAR(255),
    destination_port VARCHAR(255),
    estimated_shipping_date DATE;

ALTER TABLE ORDER_DETAILS 
ADD quantity_boxes INT,
    total_price DECIMAL(18,4);

ALTER TABLE INVOICES 
ADD document_type VARCHAR(50),
    exchange_rate DECIMAL(10,4),
    sunat_cdr_status VARCHAR(50);
