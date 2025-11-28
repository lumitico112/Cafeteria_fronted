# Schema Changelog - Sistema POS Cafetería

## ✅ Schema Validado y Funcional (Noviembre 27, 2025)

### Estado Actual

- ✅ **`ddl-auto=validate`** configurado en `application.properties`
- ✅ **Todas las tablas sincronizadas** con entidades Java
- ✅ **Aplicación arranca exitosamente** sin errores de validación

---

## Tablas Corregidas y Validadas

### 1. **MODULO**

- Columna principal: `id` tipo `BIGINT` (antes: `id_modulo INT`)
- Campos: `id`, `nombre`, `base_path`

### 2. **OPERACION**

- Columna principal: `id` tipo `BIGINT` (antes: `id_operacion INT`)
- Campo FK: `modulo_id BIGINT` (antes: `id_modulo INT`)
- Campo: `http_method VARCHAR(10)` (antes: ENUM)

### 3. **GRANTED_PERMISSION**

- Columna principal: `id` tipo `BIGINT` (antes: `id_granted_permission INT`)
- Campos FK: `rol_id INT`, `operacion_id BIGINT`
- Referencias: `rol(id_rol)`, `OPERACION(id)`

### 4. **JWT_TOKEN**

- Columna principal: `id` tipo `BIGINT` (antes: `id_token INT`)
- Campo FK: `usuario_id INT` (antes: `id_usuario`)
- Campo: `is_valid BOOLEAN` (antes: `is_expired`, `is_revoked`)
- Campo: `expiracion DATETIME` (antes: `expiration TIMESTAMP`)

### 5. **pedido**

- Campo FK: `atendido_por INT` (antes: `id_empleado`)
- Campo: `fecha DATETIME` (antes: `TIMESTAMP`)
- Estados: `'PENDIENTE', 'PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'`
  - (antes: `'PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'`)
- Tipo entrega: `'DELIVERY', 'RETIRO', 'LOCAL'`
  - (antes: `'LOCAL', 'DOMICILIO'`)

### 6. **detalle_pedido**

- Columna principal: `id_detalle` (antes: `id_detalle_pedido`)
- Campo: `subtotal` sin `GENERATED ALWAYS` (calculado en aplicación)

### 7. **producto**

- Nuevo campo: `impuesto DECIMAL(5, 2) DEFAULT 0`
- Estados: `'ACTIVO', 'INACTIVO'`
  - (antes: `'DISPONIBLE', 'AGOTADO', 'DESCONTINUADO'`)

### 8. **promocion**

- Nuevo campo: `tipo ENUM('DESCUENTO', 'COMBO', 'DOS_POR_UNO')`
- Campos de fecha: `fecha_inicio DATE`, `fecha_fin DATE` (antes: TIMESTAMP)
- Removidos: `porcentaje_descuento`, `imagen_url`

### 9. **producto_promocion** (NUEVA)

- Tabla de relación muchos a muchos entre `producto` y `promocion`
- Columnas: `id_promocion INT`, `id_producto INT`
- Primary key compuesta

---

## Triggers Actualizados

### `trg_actualizar_stock_pedido`

- Ahora usa estado `'ENTREGADO'` (antes: `'COMPLETADO'`)

---

## Vistas Actualizadas

### `v_ventas_por_dia`

- Filtra por `estado = 'ENTREGADO'` (antes: `'COMPLETADO'`)

### `v_productos_mas_vendidos`

- Filtra por `estado = 'ENTREGADO'` (antes: `'COMPLETADO'`)

---

## Procedimientos Almacenados Actualizados

### `sp_reporte_ventas`

- Filtra por `estado = 'ENTREGADO'` (antes: `'COMPLETADO'`)

---

## Resumen de Cambios Principales

| Categoría                 | Cambios                                              |
| ------------------------- | ---------------------------------------------------- |
| **Nombres de columnas**   | Sincronizados con anotaciones `@Column` de entidades |
| **Tipos de datos**        | `Long` → `BIGINT`, campos según entity               |
| **Estados ENUM**          | Actualizados a valores reales de entidades           |
| **Relaciones ManyToMany** | Agregada tabla `producto_promocion`                  |
| **Triggers/Views/SP**     | Actualizados para usar estados correctos             |

---

## Validación Final

```bash
# El comando siguiente debe ejecutarse sin errores:
mvn spring-boot:run

# Verificar logs:
# ✅ "Started SistemaPosApplication"
# ✅ Sin errores de schema validation
# ✅ Tomcat running on port 8080
```

---

## Notas Importantes

1. **ddl-auto=validate**: La aplicación solo valida, no modifica tablas
2. **Gestión manual del schema**: Todos los cambios deben hacerse en `schema.sql`
3. **Sincronización**: Entidades Java ↔ Tablas MySQL 100% sincronizadas
4. **Testing**: Schema probado y funcional

---

**Última actualización**: 27 de noviembre de 2025  
**Estado**: ✅ PRODUCCIÓN READY
