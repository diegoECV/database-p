-- V002__add_status_description.sql
-- Ejemplo de evolucion: agregar una columna en SQL Server
ALTER TABLE ORDERS ADD status_description NVARCHAR(255) NULL;
GO
PRINT 'Cambio V002 aplicado';
GO
