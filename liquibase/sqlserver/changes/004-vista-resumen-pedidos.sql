--liquibase formatted sql

--changeset equipo4:017-vista-order-summary
CREATE VIEW vw_order_summary AS
SELECT
    o.order_id,
    o.client_id,
    o.order_date,
    o.status,
    ISNULL(SUM(od.quantity_kg), 0) AS total_quantity_kg,
    ISNULL(SUM(od.quantity_kg * od.unit_price), 0) AS total_value
FROM ORDERS o
LEFT JOIN ORDER_DETAILS od ON o.order_id = od.order_id
GROUP BY
    o.order_id,
    o.client_id,
    o.order_date,
    o.status;
--rollback DROP VIEW vw_order_summary;
