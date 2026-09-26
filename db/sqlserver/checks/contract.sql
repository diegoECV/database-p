-- contract.sql
-- Verifica que la base de datos cumpla con el contrato esperado

SET NOCOUNT ON;
DECLARE @MissingTables INT = 0;
DECLARE @RequestedVersion INT = $(target_schema_version);
DECLARE @LatestVersion INT;

SELECT @LatestVersion = MAX(sequence) FROM control.schema_change;

IF @LatestVersion <> @RequestedVersion
BEGIN
    RAISERROR ('Historial de cambios incompatible. Se esperaba version %d pero se encontro %d', 16, 1, @RequestedVersion, @LatestVersion);
    RETURN;
END

-- Validacion de las 9 tablas transaccionales del proyecto
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ORDERS') SET @MissingTables = @MissingTables + 1;
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ORDER_DETAILS') SET @MissingTables = @MissingTables + 1;
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AUDIT_LOGS') SET @MissingTables = @MissingTables + 1;
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'PAYMENTS') SET @MissingTables = @MissingTables + 1;
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'INVOICES') SET @MissingTables = @MissingTables + 1;
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SHIPMENTS') SET @MissingTables = @MissingTables + 1;
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'SHIPMENT_ITEMS') SET @MissingTables = @MissingTables + 1;
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CERTIFICATES') SET @MissingTables = @MissingTables + 1;
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'CUSTOMS_DECLARATIONS') SET @MissingTables = @MissingTables + 1;

IF @MissingTables > 0
BEGIN
    RAISERROR ('Contrato roto: Faltan %d tablas requeridas en el esquema.', 16, 1, @MissingTables);
    RETURN;
END

PRINT 'SQL Server: Contrato verificado exitosamente. Todas las tablas existen.';
GO
