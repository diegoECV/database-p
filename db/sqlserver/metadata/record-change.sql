-- record-change.sql
-- Registra la aplicacion de un cambio en la tabla de control
INSERT INTO control.schema_change (sequence, change_id, checksum, git_sha, release_version)
VALUES ($(change_sequence), '$(change_id)', '$(checksum)', '$(git_sha)', '$(release_version)');
GO
PRINT '[OK] Cambio $(change_id) registrado en control.schema_change.';
GO
