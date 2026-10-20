# Inicialización en una Nueva Máquina

Este documento explica cómo un desarrollador nuevo (backend, frontend o de datos) debe configurar la base de datos de Visons por primera vez tras clonar el repositorio.

## Prerrequisitos

- Docker y Docker Compose instalados.
- Git instalado.

## Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repo-visons>
   cd database-p
   ```

2. **Configurar el entorno:**
   Crea tu archivo `.env` basado en la plantilla para definir las contraseñas locales.
   ```bash
   cp .env.example .env
   ```

3. **Ejecutar la demostración de inicio:**
   La forma más segura de inicializar todo por primera vez y verificar que tu máquina soporta SQL Server y MongoDB es usando el script de inicialización.
   ```bash
   ./demo/demo-inicio.sh
   ```

4. **Verificación:**
   Si el script termina con un mensaje verde `[SUCCESS]`, significa que:
   - Se levantó SQL Server en el puerto `1433`.
   - Se levantó MongoDB en el puerto `27017`.
   - Se insertaron las semillas (datos falsos) en las 22 tablas.
   - El checker (Java) validó el contrato correctamente en el puerto `9090`.

Puedes acceder a la documentación interactiva en: `http://localhost:9090/swagger-ui`
