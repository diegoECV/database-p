# Matriz de propiedad de datos - VISONS S.A.C.

Esta matriz define, para cada entidad de negocio del proyecto, en qué
motor de persistencia vive y por qué.

| Entidad de negocio | Motor de persistencia | Justificación arquitectónica |
|---|---|---|
| Pedidos (orders) | SQL Server | Consistencia referencial estricta, origen de transacciones comerciales. |
| Pagos (payments) | SQL Server | Transacciones financieras críticas, requiere consistencia ACID pura. |
| Facturas (invoices) | SQL Server | Documentos comerciales inmutables ligados directamente al pedido. |
| Embarques (shipments) | SQL Server | Trazabilidad logística central ligada al pedido y certificaciones. |
| Certificados / Aduanas | SQL Server | Documentación legal adjunta al embarque, de alto rigor relacional. |
| Auditoría (audit_logs) | SQL Server | Tabla de seguridad inmutable. Trazabilidad de todas las acciones del sistema. |
| Usuarios, Clientes, Proveedores | MongoDB | Datos maestros de acceso y contacto. Flexibles y de lectura frecuente. |
| Productos (products) | MongoDB | Posee atributos dinámicos según el tipo de cultivo (ej. brix_level). |
| Inspecciones / Logs (temperatura, trazabilidad) | MongoDB | Volúmenes masivos de datos IoT e inspecciones dinámicas según cultivo. |
| Listas de Precios (price_lists) | MongoDB | Estructuras en árbol dinámicas por cliente y producto. |

## Resumen por motor

| Motor | Entidades | Criterio principal de selección |
|---|---|---|
| SQL Server | Pedidos, Pagos, Facturas, Embarques, Certificados, Auditoría | Integridad referencial y transacciones ACID |
| MongoDB | Usuarios, Clientes, Proveedores, Productos, Inspecciones, Precios | Esquema flexible y lecturas frecuentes |

## Regla de arquitectura

La referencia entre motores es **lógica, no física**: las tablas
transaccionales de SQL Server (`ORDERS`, `ORDER_DETAILS`) guardan un `client_id` o
`product_id` que apunta al `_id` en MongoDB como un campo `VARCHAR`, pero **no existe 
una llave foránea real entre ambos motores** (SQL Server no puede validar la existencia
de un documento en MongoDB). Esta validación de integridad se resuelve
a nivel de aplicación, en el backend.

Si el precio o los atributos de un producto cambian en el catálogo vivo
(MongoDB), los registros históricos en SQL Server (por ejemplo, el
`unit_price` ya guardado en `ORDER_DETAILS`) no se alteran: cada
transacción conserva el precio que tenía en el momento en que ocurrió.
