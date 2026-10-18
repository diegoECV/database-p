--liquibase formatted sql

--changeset lizeth:018-add-orders-notes
ALTER TABLE ORDERS ADD notes NVARCHAR(500) NULL;
--rollback ALTER TABLE ORDERS DROP COLUMN notes;
