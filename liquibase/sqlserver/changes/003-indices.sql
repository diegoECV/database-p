--liquibase formatted sql

--changeset lizeth:014-indices-pedidos
CREATE NONCLUSTERED INDEX IX_orders_client ON ORDERS (client_id);
CREATE NONCLUSTERED INDEX IX_orders_status ON ORDERS (status);
CREATE NONCLUSTERED INDEX IX_orders_date   ON ORDERS (order_date DESC);
CREATE NONCLUSTERED INDEX IX_assignments_order ON ASSIGNMENTS (order_id);
--rollback DROP INDEX IX_assignments_order ON ASSIGNMENTS;
--rollback DROP INDEX IX_orders_date ON ORDERS;
--rollback DROP INDEX IX_orders_status ON ORDERS;
--rollback DROP INDEX IX_orders_client ON ORDERS;

--changeset camila:015-indices-facturas-pagos
CREATE NONCLUSTERED INDEX IX_invoices_status   ON INVOICES (status);
CREATE NONCLUSTERED INDEX IX_invoices_due_date ON INVOICES (due_date ASC) WHERE status = 'PENDING';
CREATE NONCLUSTERED INDEX IX_payments_order    ON PAYMENTS (order_id);
CREATE NONCLUSTERED INDEX IX_batches_code      ON BATCHES (product_code);
--rollback DROP INDEX IX_batches_code ON BATCHES;
--rollback DROP INDEX IX_payments_order ON PAYMENTS;
--rollback DROP INDEX IX_invoices_due_date ON INVOICES;
--rollback DROP INDEX IX_invoices_status ON INVOICES;

--changeset diego:016-indices-embarques-auditoria
CREATE NONCLUSTERED INDEX IX_shipments_status  ON SHIPMENTS (status);
CREATE NONCLUSTERED INDEX IX_shipments_arrival ON SHIPMENTS (estimated_arrival ASC);
CREATE NONCLUSTERED INDEX IX_audit_user        ON AUDIT_LOGS (user_id, timestamp DESC);
CREATE NONCLUSTERED INDEX IX_audit_action      ON AUDIT_LOGS (action, timestamp DESC);
CREATE NONCLUSTERED INDEX IX_customs_status    ON CUSTOMS_DECLARATIONS (status);
--rollback DROP INDEX IX_customs_status ON CUSTOMS_DECLARATIONS;
--rollback DROP INDEX IX_audit_action ON AUDIT_LOGS;
--rollback DROP INDEX IX_audit_user ON AUDIT_LOGS;
--rollback DROP INDEX IX_shipments_arrival ON SHIPMENTS;
--rollback DROP INDEX IX_shipments_status ON SHIPMENTS;
