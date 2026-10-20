-- V005__update_shipments.sql
-- Add booking_number and freight_forwarder to SHIPMENTS table for Visons platform

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'SHIPMENTS') AND name = 'booking_number')
BEGIN
    ALTER TABLE SHIPMENTS ADD booking_number VARCHAR(100) NULL;
END;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'SHIPMENTS') AND name = 'freight_forwarder')
BEGIN
    ALTER TABLE SHIPMENTS ADD freight_forwarder VARCHAR(255) NULL;
END;
GO
