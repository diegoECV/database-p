# Uso Local Sin Aplicar Cambios Estructurales

Si eres un desarrollador de Frontend o Backend que solo necesita tener las bases de datos de Visons levantadas para conectar tu aplicación, y no necesitas hacer cambios en las tablas, este es el flujo de trabajo ideal.

## Flujo de Trabajo

1. Abre tu terminal en la carpeta `database-p`.
2. Asegúrate de tener tu archivo `.env` configurado.
3. Levanta los contenedores en modo "silencioso":
   ```bash
   docker compose up -d
   ```
4. Si quieres ver que los contenedores están arriba:
   ```bash
   docker ps
   ```

Los puertos habilitados para conectar tu aplicación son:
- **SQL Server:** `localhost:1433`
- **MongoDB:** `localhost:27017`

Si por alguna razón quieres destruir las bases de datos y volverlas a iniciar desde cero (para recuperar los datos de prueba originales):
```bash
docker compose down -v
docker compose up -d
```
