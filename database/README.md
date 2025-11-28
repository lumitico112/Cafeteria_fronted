# Configuración de Base de Datos - Sistema POS Cafetería

## 📋 Orden de Ejecución

Ejecutar los scripts en el siguiente orden:

### 1. Crear Esquema de Base de Datos

```bash
mysql -u root -p < database/schema.sql
```

**Qué hace:**

- Crea la base de datos `sistema_pos`
- Crea todas las tablas con relaciones
- Crea índices optimizados
- Crea triggers automáticos
- Crea vistas, procedimientos almacenados y eventos
- Inserta roles y permisos iniciales

### 2. Configurar Seguridad (OPCIONAL para desarrollo)

```bash
mysql -u root -p < database/security_config.sql
```

**Qué hace:**

- Crea usuario `cafeteria_app` con privilegios limitados
- Configura seguridad del servidor MySQL
- Habilita logs de auditoría
- Optimiza variables de rendimiento
- Crea usuario para backups

**IMPORTANTE:**

- En **desarrollo** puedes usar el usuario `root`
- En **producción** DEBES usar `cafeteria_app`

---

## 🔐 Configuración de Usuarios

### Usuario para Desarrollo (Simple)

```properties
# En .env
DB_USERNAME=root
DB_PASSWORD=TU_PASSWORD_ROOT
```

### Usuario para Producción (Seguro)

```properties
# En .env
DB_USERNAME=cafeteria_app
DB_PASSWORD=CafeteriaApp_2025!
```

**Cambiar la contraseña en `security_config.sql` antes de ejecutar en producción:**

````sql
CREATE USER 'cafeteria_app'@'localhost' IDENTIFIED BY 'Password123!';
---

## 🗄️ Estructura de la Base de Datos

### Tablas Principales (20 tablas)

- `usuario` - Usuarios del sistema (admin, empleado, cliente)
- `rol` - Roles y permisos
- `permiso` - Permisos básicos del sistema
- `rol_permiso` - Relación roles-permisos
- `cliente` - Información extendida de clientes
- `perfil_cliente` - Información adicional y puntos de fidelización
- `producto` - Catálogo de productos
- `categoria` - Categorías de productos
- `inventario` - Control de stock actual
- `movimiento_inventario` - Historial de entradas/salidas
- `pedido` - Órdenes de compra
- `detalle_pedido` - Ítems de cada pedido
- `pago` - Pagos de pedidos
- `promocion` - Promociones y descuentos
- `reserva` - Reservas de mesas y productos
- `caja` - Control de caja diaria
- `bitacora` - Auditoría del sistema
- `modulo` - Módulos del sistema (permisos avanzados)
- `operacion` - Operaciones por módulo
- `granted_permission` - Permisos otorgados a roles
- `jwt_token` - Tokens de autenticación

### Triggers Automáticos

- ✅ Crear cliente automáticamente cuando usuario tiene rol CLIENTE
- ✅ Actualizar stock al completar pedido
- ✅ Calcular total de pedido automáticamente
- ✅ Validar stock antes de crear pedido

### Vistas Útiles

- `v_productos_stock_bajo` - Productos que necesitan reabastecimiento
- `v_ventas_por_dia` - Estadísticas diarias
- `v_productos_mas_vendidos` - Top productos

---

## 🚀 Quick Start

```bash
# 1. Crear base de datos
mysql -u root -p < database/schema.sql

# 2. (OPCIONAL) Configurar seguridad
mysql -u root -p < database/security_config.sql

# 3. Crear archivo .env
copy .env.example .env

# 4. Editar .env
# Configurar DB_USERNAME, DB_PASSWORD, JWT_SECRET_KEY

# 5. Ejecutar aplicación
mvn spring-boot:run
````

---

## 🛡️ Seguridad

### Privilegios del Usuario `cafeteria_app`

- ✅ SELECT, INSERT, UPDATE, DELETE
- ✅ EXECUTE (procedimientos almacenados)
- ❌ DROP, ALTER, CREATE (bloqueados)
- ❌ GRANT (bloqueado)

### Configuración Recomendada para Producción

1. Usar usuario dedicado (`cafeteria_app`)
2. Habilitar SSL/TLS para conexiones
3. Configurar firewall (solo backend accede a MySQL)
4. Rotación periódica de contraseñas
5. Backups automáticos diarios
6. Monitoreo de consultas lentas

---

## 🔧 Mantenimiento

### Ver Logs de Consultas Lentas

```sql
SELECT * FROM mysql.slow_log
ORDER BY start_time DESC
LIMIT 10;
```

### Verificar Privilegios

```sql
SHOW GRANTS FOR 'cafeteria_app'@'localhost';
```

### Backup Manual

```bash
mysqldump -u cafeteria_backup -p sistema_pos > backup_$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
mysql -u root -p sistema_pos < backup_20251127.sql
```

---

## ⚠️ Notas Importantes

1. **DataInitializer.java** crea automáticamente:

   - Usuario admin (admin@cafeteria.com / admin123)
   - Esta creación se hace desde Spring Boot, NO desde SQL

2. **ddl-auto=validate**:

   - Spring Boot NO crea ni modifica tablas
   - El esquema debe existir antes de iniciar la aplicación
   - Si hay discrepancias, la aplicación falla (esto es bueno)

3. **Triggers**:
   - El trigger de auto-crear cliente se activa al insertar usuario con rol CLIENTE
   - DataInitializer crea el admin al inicio, su cliente NO se crea (porque es admin, no cliente)

---

## 📞 Soporte

Para más información consultar:

- `API_DOCUMENTATION.txt` - Documentación completa de la API
- `schema.sql` - Script completo de base de datos
- `security_config.sql` - Configuración de seguridad
