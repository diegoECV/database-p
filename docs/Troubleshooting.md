# 🛠️ Guía de Diagnóstico y Resolución de Problemas (Troubleshooting)

Esta guía explica cómo resolver los problemas más comunes al ejecutar, evolucionar o probar las bases de datos de **VISONS S.A.C.** en [FN1/database-p](file:///home/diego/Documentos/UN1/FN1/database-p).

---

## 🚨 Nuevo Sistema de Diagnóstico en Scripts

Todos los scripts de la carpeta `demo/` (`demo-inicio.sh`, `demo-evolucion.sh`, `demo-liquibase.sh`, `demo-transacciones.sh`) cuentan con un **capturador inteligente de errores (`trap ERR`)**.

Si un comando falla, el script no se cerrará en silencio ni con mensajes crípticos. En su lugar, mostrará un cuadro como este:

```text
══════════════════════════════════════════════════════════════════════
  [ERROR DETECTADO] La ejecución se detuvo en el paso actual
══════════════════════════════════════════════════════════════════════
  → Línea del script: 70
  → Comando fallido:  docker compose -f compose.liquibase.yaml up --wait
  → Código de salida: 1

🔍 Diagnóstico y soluciones recomendadas:
  ...
══════════════════════════════════════════════════════════════════════
```

---

## 📌 Problemas Frecuentes y Cómo Solucionarlos

### 1. Error de Puerto Ocupado (`port is already allocated` o `address already in use`)
* **Causa:** Hay contenedores previos de Docker o servicios locales (como otro SQL Server o MongoDB) corriendo en los puertos `1433`, `27017` o `27018`.
* **Solución Rápida:**
  ```bash
  # Ver qué contenedores están corriendo
  docker ps

  # Detener todos los contenedores en ejecución
  docker stop $(docker ps -q)

  # Si un proceso del sistema usa el puerto (ej. 1433):
  sudo lsof -i :1433
  ```

---

### 2. El Servicio de Docker No Responde (`Cannot connect to the Docker daemon`)
* **Causa:** El servicio de Docker está detenido o tu usuario no tiene permisos de socket.
* **Solución:**
  ```bash
  sudo systemctl start docker
  # Opcional (para correr sin sudo si no lo tienes configurado):
  sudo usermod -aG docker $USER
  ```

---

### 3. Falta el archivo `.env`
* **Comportamiento:** Los nuevos scripts de demo ahora **crean automáticamente el archivo `.env`** copiando `.env.example` si no existe.
* **Verificación:** Si necesitas cambiar credenciales:
  ```bash
  cat .env
  # Asegúrate de que SA_PASSWORD cumpla con las políticas de complejidad de SQL Server
  # (mínimo 8 caracteres, mayúsculas, minúsculas y números/símbolos).
  ```

---

### 4. Error de Checksum en Liquibase (`ValidationFailedException: Changeset ... has changed`)
* **Causa:** La regla fundamental de Liquibase es que **nunca se edita un changeset ya ejecutado**. Si modificas un archivo dentro de `changes/` después de haberlo corrido, Liquibase detecta que el hash SHA-256 no coincide y bloquea la ejecución para prevenir corrupción.
* **Solución:**
  * Si deseas hacer un cambio nuevo: **No toques archivos viejos**. Crea un archivo nuevo incremental (`005-...`, `006-...`).
  * Si estás en desarrollo y quieres reiniciar desde cero:
    ```bash
    ./demo/demo-liquibase.sh cleanup
    ./demo/demo-liquibase.sh
    ```

---

### 5. El Replica Set de MongoDB No Elige Primary a Tiempo (`Replica Set superó el tiempo límite`)
* **Causa:** En equipos con recursos limitados o disco saturado, la inicialización del Replica Set (`rs0`) puede tardar unos segundos adicionales.
* **Diagnóstico y Solución:**
  ```bash
  # Ver el estado interno del Replica Set
  docker exec -it visons-tx-mongo mongosh --eval "rs.status()"

  # Ver logs del contenedor MongoDB
  docker logs visons-tx-mongo
  ```
  Los scripts ahora realizan un **sondeo activo inteligente (polling)** de hasta 35 segundos para esperar al Primary antes de lanzar los tests.

---

### 6. ¿Cómo Limpiar Todo y Reiniciar Limpio?

Cada script de demostración incluye su comando de limpieza:

```bash
# Limpiar Liquibase
./demo/demo-liquibase.sh cleanup

# Limpiar Transacciones ACID
./demo/demo-transacciones.sh cleanup

# Limpiar Inicio estándar
./demo/demo-inicio.sh cleanup
```
