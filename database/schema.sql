-- ========================================
-- SCRIPT DE BASE DE DATOS - Sistema POS Cafetería
-- MySQL 8.0+
-- ========================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS sistema_pos 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE sistema_pos;

-- ========================================
-- TABLA: rol
-- ========================================
CREATE TABLE IF NOT EXISTS rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    INDEX idx_rol_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: permiso
-- ========================================
CREATE TABLE IF NOT EXISTS permiso (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    UNIQUE KEY uk_permiso_modulo_accion (modulo, accion),
    INDEX idx_permiso_modulo (modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: rol_permiso (relación muchos a muchos)
-- ========================================
CREATE TABLE IF NOT EXISTS rol_permiso (
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (id_permiso) REFERENCES permiso(id_permiso) ON DELETE CASCADE,
    INDEX idx_rol_permiso_rol (id_rol),
    INDEX idx_rol_permiso_permiso (id_permiso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: usuario
-- ========================================
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_rol INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    INDEX idx_usuario_correo (correo),
    INDEX idx_usuario_estado (estado),
    INDEX idx_usuario_rol (id_rol),
    INDEX idx_usuario_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: bitacora (auditoría del sistema)
-- ========================================
CREATE TABLE IF NOT EXISTS bitacora (
    id_bitacora INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modulo VARCHAR(50),
    accion VARCHAR(50),
    descripcion TEXT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    INDEX idx_bitacora_usuario (id_usuario),
    INDEX idx_bitacora_fecha (fecha_hora DESC),
    INDEX idx_bitacora_modulo (modulo),
    INDEX idx_bitacora_accion (accion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: cliente
-- ========================================
CREATE TABLE IF NOT EXISTS cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE,
    email VARCHAR(150),
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT UNIQUE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    INDEX idx_cliente_dni (dni),
    INDEX idx_cliente_email (email),
    INDEX idx_cliente_usuario (id_usuario),
    FULLTEXT idx_cliente_nombres_apellidos (nombres, apellidos)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: categoria
-- ========================================
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    INDEX idx_categoria_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: producto
-- ========================================
CREATE TABLE IF NOT EXISTS producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    impuesto DECIMAL(5, 2) DEFAULT 0,
    imagen_url VARCHAR(255),
    estado ENUM('ACTIVO', 'INACTIVO') DEFAULT 'ACTIVO',
    id_categoria INT,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria) ON DELETE SET NULL,
    INDEX idx_producto_nombre (nombre),
    INDEX idx_producto_estado (estado),
    INDEX idx_producto_categoria (id_categoria),
    INDEX idx_producto_precio (precio),
    FULLTEXT idx_producto_nombre_desc (nombre, descripcion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: inventario
-- ========================================
CREATE TABLE IF NOT EXISTS inventario (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL UNIQUE,
    cantidad_actual INT NOT NULL DEFAULT 0 CHECK (cantidad_actual >= 0),
    stock_minimo INT NOT NULL DEFAULT 10 CHECK (stock_minimo >= 0),
    unidad_medida VARCHAR(50) DEFAULT 'unidad',
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
    INDEX idx_inventario_producto (id_producto),
    INDEX idx_inventario_stock_bajo (cantidad_actual, stock_minimo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: pedido
-- ========================================
CREATE TABLE IF NOT EXISTS pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    atendido_por INT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('PENDIENTE', 'PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO') DEFAULT 'PENDIENTE',
    total DECIMAL(10, 2) DEFAULT 0 CHECK (total >= 0),
    tipo_entrega ENUM('DELIVERY', 'RETIRO', 'LOCAL') DEFAULT 'LOCAL',
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (atendido_por) REFERENCES usuario(id_usuario),
    INDEX idx_pedido_fecha (fecha),
    INDEX idx_pedido_estado (estado),
    INDEX idx_pedido_usuario (id_usuario),
    INDEX idx_pedido_atendido_por (atendido_por),
    INDEX idx_pedido_fecha_estado (fecha, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: detalle_pedido
-- ========================================
CREATE TABLE IF NOT EXISTS detalle_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    INDEX idx_detalle_pedido (id_pedido),
    INDEX idx_detalle_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: promocion
-- ========================================
CREATE TABLE IF NOT EXISTS promocion (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo ENUM('DESCUENTO', 'COMBO', 'DOS_POR_UNO') NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('ACTIVA', 'INACTIVA') DEFAULT 'ACTIVA',
    CHECK (fecha_fin > fecha_inicio),
    INDEX idx_promocion_fechas (fecha_inicio, fecha_fin),
    INDEX idx_promocion_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: producto_promocion (relación muchos a muchos)
-- ========================================
CREATE TABLE IF NOT EXISTS producto_promocion (
    id_promocion INT NOT NULL,
    id_producto INT NOT NULL,
    PRIMARY KEY (id_promocion, id_producto),
    FOREIGN KEY (id_promocion) REFERENCES promocion(id_promocion) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
    INDEX idx_producto_promocion_promocion (id_promocion),
    INDEX idx_producto_promocion_producto (id_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: MODULO (para sistema de permisos avanzado)
-- ========================================
CREATE TABLE IF NOT EXISTS MODULO (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    base_path VARCHAR(100),
    INDEX idx_modulo_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: OPERACION (para sistema de permisos avanzado)
-- ========================================
CREATE TABLE IF NOT EXISTS OPERACION (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    http_method VARCHAR(10),
    path VARCHAR(200),
    permit_all BOOLEAN DEFAULT FALSE,
    modulo_id BIGINT,
    FOREIGN KEY (modulo_id) REFERENCES MODULO(id),
    INDEX idx_operacion_modulo (modulo_id),
    INDEX idx_operacion_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: GRANTED_PERMISSION (permisos otorgados a roles)
-- ========================================
CREATE TABLE IF NOT EXISTS GRANTED_PERMISSION (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rol_id INT NOT NULL,
    operacion_id BIGINT NOT NULL,
    UNIQUE KEY uk_granted_permission (rol_id, operacion_id),
    FOREIGN KEY (rol_id) REFERENCES rol(id_rol) ON DELETE CASCADE,
    FOREIGN KEY (operacion_id) REFERENCES OPERACION(id) ON DELETE CASCADE,
    INDEX idx_granted_permission_rol (rol_id),
    INDEX idx_granted_permission_operacion (operacion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: JWT_TOKEN (tokens de autenticación)
-- ========================================
CREATE TABLE IF NOT EXISTS JWT_TOKEN (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    expiracion DATETIME,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_jwt_usuario (usuario_id),
    INDEX idx_jwt_expiration (expiracion),
    INDEX idx_jwt_valid (is_valid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: caja (control de caja diaria)
-- ========================================
CREATE TABLE IF NOT EXISTS caja (
    id_caja INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_apertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP NULL,
    saldo_inicial DECIMAL(10, 2) NOT NULL CHECK (saldo_inicial >= 0),
    saldo_final DECIMAL(10, 2) CHECK (saldo_final >= 0),
    diferencias DECIMAL(10, 2),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    INDEX idx_caja_usuario (id_usuario),
    INDEX idx_caja_fecha_apertura (fecha_apertura DESC),
    INDEX idx_caja_fecha_cierre (fecha_cierre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: movimiento_inventario (historial de movimientos)
-- ========================================
CREATE TABLE IF NOT EXISTS movimiento_inventario (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    id_usuario INT NOT NULL,
    tipo ENUM('ENTRADA', 'SALIDA') NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    motivo VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    INDEX idx_movimiento_producto (id_producto),
    INDEX idx_movimiento_usuario (id_usuario),
    INDEX idx_movimiento_fecha (fecha DESC),
    INDEX idx_movimiento_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: pago (pagos de pedidos)
-- ========================================
CREATE TABLE IF NOT EXISTS pago (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    metodo ENUM('EFECTIVO', 'TARJETA', 'BILLETERA_DIGITAL') NOT NULL,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('COMPLETADO', 'FALLIDO', 'PENDIENTE') DEFAULT 'PENDIENTE',
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    INDEX idx_pago_pedido (id_pedido),
    INDEX idx_pago_fecha (fecha DESC),
    INDEX idx_pago_estado (estado),
    INDEX idx_pago_metodo (metodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: perfil_cliente (información adicional de clientes)
-- ========================================
CREATE TABLE IF NOT EXISTS perfil_cliente (
    id_usuario INT PRIMARY KEY,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    puntos_fidelizacion INT DEFAULT 0 CHECK (puntos_fidelizacion >= 0),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_perfil_puntos (puntos_fidelizacion DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TABLA: reserva (reservas de mesas y productos)
-- ========================================
CREATE TABLE IF NOT EXISTS reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_producto INT,
    tipo ENUM('MESA', 'PRODUCTO') NOT NULL,
    fecha_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    estado ENUM('ACTIVA', 'VENCIDA', 'CANCELADA', 'COMPLETADA') DEFAULT 'ACTIVA',
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE SET NULL,
    INDEX idx_reserva_usuario (id_usuario),
    INDEX idx_reserva_producto (id_producto),
    INDEX idx_reserva_fecha (fecha_reserva, hora_reserva),
    INDEX idx_reserva_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger: Crear cliente automáticamente cuando se crea un usuario con rol CLIENTE
DELIMITER $$

CREATE TRIGGER trg_crear_cliente_auto
AFTER INSERT ON usuario
FOR EACH ROW
BEGIN
    DECLARE rol_cliente_id INT;
    
    -- Obtener el ID del rol CLIENTE
    SELECT id_rol INTO rol_cliente_id FROM rol WHERE nombre = 'CLIENTE' LIMIT 1;
    
    -- Si el usuario creado tiene rol CLIENTE, crear registro en tabla cliente y perfil_cliente
    IF NEW.id_rol = rol_cliente_id THEN
        -- Insertar en tabla cliente (legacy/reporting)
        INSERT INTO cliente (nombres, apellidos, email, telefono, direccion, id_usuario)
        VALUES (NEW.nombre, NEW.apellido, NEW.correo, NEW.telefono, NEW.direccion, NEW.id_usuario);
        
        -- Insertar en tabla perfil_cliente (usada por la aplicación Java)
        INSERT INTO perfil_cliente (id_usuario, telefono, direccion, puntos_fidelizacion)
        VALUES (NEW.id_usuario, NEW.telefono, NEW.direccion, 0);
    END IF;
END$$

-- Trigger: Actualizar stock al completar un pedido
CREATE TRIGGER trg_actualizar_stock_pedido
AFTER UPDATE ON pedido
FOR EACH ROW
BEGIN
    IF NEW.estado = 'ENTREGADO' AND OLD.estado != 'ENTREGADO' THEN
        -- Reducir stock de inventario para cada producto del pedido
        UPDATE inventario i
        INNER JOIN detalle_pedido dp ON i.id_producto = dp.id_producto
        SET i.cantidad_actual = i.cantidad_actual - dp.cantidad
        WHERE dp.id_pedido = NEW.id_pedido;
    END IF;
END$$

-- Trigger: Calcular total del pedido automáticamente
CREATE TRIGGER trg_calcular_total_pedido
AFTER INSERT ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedido 
    SET total = (
        SELECT SUM(subtotal) 
        FROM detalle_pedido 
        WHERE id_pedido = NEW.id_pedido
    )
    WHERE id_pedido = NEW.id_pedido;
END$$

-- Trigger: Actualizar total al modificar detalle
CREATE TRIGGER trg_actualizar_total_pedido
AFTER UPDATE ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedido 
    SET total = (
        SELECT SUM(subtotal) 
        FROM detalle_pedido 
        WHERE id_pedido = NEW.id_pedido
    )
    WHERE id_pedido = NEW.id_pedido;
END$$

-- Trigger: Actualizar total al eliminar detalle
CREATE TRIGGER trg_eliminar_total_pedido
AFTER DELETE ON detalle_pedido
FOR EACH ROW
BEGIN
    UPDATE pedido 
    SET total = COALESCE((
        SELECT SUM(subtotal) 
        FROM detalle_pedido 
        WHERE id_pedido = OLD.id_pedido
    ), 0)
    WHERE id_pedido = OLD.id_pedido;
END$$

-- Trigger: Validar stock antes de crear detalle de pedido
CREATE TRIGGER trg_validar_stock_antes_pedido
BEFORE INSERT ON detalle_pedido
FOR EACH ROW
BEGIN
    DECLARE stock_disponible INT;
    
    SELECT cantidad_actual INTO stock_disponible
    FROM inventario
    WHERE id_producto = NEW.id_producto;
    
    IF stock_disponible < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para completar el pedido';
    END IF;
END$$

-- Trigger: Auditoría de cambios de contraseña
CREATE TRIGGER trg_auditoria_cambio_password
BEFORE UPDATE ON usuario
FOR EACH ROW
BEGIN
    IF NEW.contrasena != OLD.contrasena THEN
        -- Aquí podrías insertar en una tabla de auditoría
        SET NEW.fecha_creacion = NEW.fecha_creacion; -- Mantener fecha original
    END IF;
END$$

DELIMITER ;

-- ========================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- ========================================

-- Índice compuesto para búsquedas frecuentes de pedidos
CREATE INDEX idx_pedido_usuario_fecha_estado 
ON pedido(id_usuario, fecha DESC, estado);

-- Índice para búsquedas de productos por categoría y estado
CREATE INDEX idx_producto_categoria_estado 
ON producto(id_categoria, estado);

-- Índice para reportes de ventas por fecha
CREATE INDEX idx_pedido_fecha_total 
ON pedido(fecha DESC, total);

-- ========================================
-- VISTAS ÚTILES
-- ========================================

-- Vista: Productos con stock bajo
CREATE OR REPLACE VIEW v_productos_stock_bajo AS
SELECT 
    p.id_producto,
    p.nombre,
    p.precio,
    c.nombre AS categoria,
    i.cantidad_actual,
    i.stock_minimo,
    (i.stock_minimo - i.cantidad_actual) AS unidades_faltantes
FROM producto p
INNER JOIN inventario i ON p.id_producto = i.id_producto
LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
WHERE i.cantidad_actual < i.stock_minimo
ORDER BY unidades_faltantes DESC;

-- Vista: Ventas por día
CREATE OR REPLACE VIEW v_ventas_por_dia AS
SELECT 
    DATE(fecha) AS fecha_venta,
    COUNT(*) AS total_pedidos,
    SUM(total) AS total_ventas,
    AVG(total) AS promedio_venta
FROM pedido
WHERE estado = 'ENTREGADO'
GROUP BY DATE(fecha)
ORDER BY fecha_venta DESC;

-- Vista: Top productos más vendidos
CREATE OR REPLACE VIEW v_productos_mas_vendidos AS
SELECT 
    p.id_producto,
    p.nombre,
    c.nombre AS categoria,
    SUM(dp.cantidad) AS total_vendido,
    SUM(dp.subtotal) AS total_ingresos
FROM producto p
INNER JOIN detalle_pedido dp ON p.id_producto = dp.id_producto
INNER JOIN pedido ped ON dp.id_pedido = ped.id_pedido
LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
WHERE ped.estado = 'ENTREGADO'
GROUP BY p.id_producto, p.nombre, c.nombre
ORDER BY total_vendido DESC;

-- ========================================
-- DATOS INICIALES (SEEDS)
-- ========================================

-- Insertar roles
INSERT INTO rol (nombre, descripcion) VALUES
('ADMIN', 'Administrador del sistema con acceso completo'),
('EMPLEADO', 'Empleado con permisos de gestión'),
('CLIENTE', 'Cliente del sistema con permisos limitados')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

-- Insertar permisos básicos
INSERT INTO permiso (modulo, accion) VALUES
('PRODUCTOS', 'LEER'),
('PRODUCTOS', 'CREAR'),
('PRODUCTOS', 'ACTUALIZAR'),
('PRODUCTOS', 'ELIMINAR'),
('PEDIDOS', 'LEER'),
('PEDIDOS', 'CREAR'),
('PEDIDOS', 'ACTUALIZAR'),
('PEDIDOS', 'CANCELAR'),
('USUARIOS', 'LEER'),
('USUARIOS', 'CREAR'),
('USUARIOS', 'ACTUALIZAR'),
('USUARIOS', 'ELIMINAR'),
('REPORTES', 'GENERAR'),
('INVENTARIO', 'LEER'),
('INVENTARIO', 'ACTUALIZAR')
ON DUPLICATE KEY UPDATE modulo = VALUES(modulo);

-- Asignar todos los permisos a ADMIN
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
CROSS JOIN permiso p
WHERE r.nombre = 'ADMIN'
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);

-- Asignar permisos a EMPLEADO
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
CROSS JOIN permiso p
WHERE r.nombre = 'EMPLEADO'
AND p.modulo IN ('PRODUCTOS', 'PEDIDOS', 'INVENTARIO', 'REPORTES')
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);

-- Asignar permisos limitados a CLIENTE
INSERT INTO rol_permiso (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM rol r
CROSS JOIN permiso p
WHERE r.nombre = 'CLIENTE'
AND (p.modulo = 'PRODUCTOS' AND p.accion = 'LEER')
OR (p.modulo = 'PEDIDOS' AND p.accion IN ('LEER', 'CREAR'))
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);

-- Crear usuario administrador por defecto (password: admin123 - debe ser hasheado por la aplicación)
-- NOTA: La contraseña debe ser hasheada con BCrypt desde la aplicación

-- ========================================
-- USUARIO Y PRIVILEGIOS DE BASE DE DATOS
-- ========================================

-- Crear usuario de aplicación (reemplazar 'YOUR_PASSWORD' con una contraseña segura)
-- CREATE USER IF NOT EXISTS 'cafeteria_app'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';

-- Otorgar privilegios necesarios
-- GRANT SELECT, INSERT, UPDATE, DELETE ON sistema_pos.* TO 'cafeteria_app'@'localhost';

-- NO otorgar privilegios de DROP, ALTER, CREATE para mayor seguridad en producción

-- FLUSH PRIVILEGES;

-- ========================================
-- CONFIGURACIÓN DE SEGURIDAD
-- ========================================

-- Habilitar logs de auditoría (requiere configuración del servidor MySQL)
-- SET GLOBAL general_log = 'ON';
-- SET GLOBAL log_output = 'TABLE';

-- Configurar tiempo de expiración de conexiones
-- SET GLOBAL wait_timeout = 28800;
-- SET GLOBAL interactive_timeout = 28800;

-- ========================================
-- PROCEDIMIENTOS ALMACENADOS
-- ========================================

DELIMITER $$

-- Procedimiento: Generar reporte de ventas
CREATE PROCEDURE sp_reporte_ventas(
    IN fecha_inicio DATE,
    IN fecha_fin DATE
)
BEGIN
    SELECT 
        DATE(p.fecha) AS fecha,
        COUNT(p.id_pedido) AS total_pedidos,
        SUM(p.total) AS total_ventas,
        AVG(p.total) AS promedio_venta,
        COUNT(DISTINCT p.id_usuario) AS clientes_unicos
    FROM pedido p
    WHERE p.estado = 'ENTREGADO'
    AND DATE(p.fecha) BETWEEN fecha_inicio AND fecha_fin
    GROUP BY DATE(p.fecha)
    ORDER BY fecha DESC;
END$$

-- Procedimiento: Obtener inventario crítico
CREATE PROCEDURE sp_inventario_critico()
BEGIN
    SELECT 
        p.id_producto,
        p.nombre,
        c.nombre AS categoria,
        i.cantidad_actual,
        i.stock_minimo,
        CASE 
            WHEN i.cantidad_actual = 0 THEN 'AGOTADO'
            WHEN i.cantidad_actual < i.stock_minimo THEN 'CRÍTICO'
            ELSE 'NORMAL'
        END AS estado_stock
    FROM producto p
    INNER JOIN inventario i ON p.id_producto = i.id_producto
    LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
    WHERE i.cantidad_actual <= i.stock_minimo
    ORDER BY i.cantidad_actual ASC;
END$$

DELIMITER ;

-- ========================================
-- EVENTOS PROGRAMADOS (requiere event_scheduler habilitado)
-- ========================================

-- Habilitar scheduler de eventos
-- SET GLOBAL event_scheduler = ON;

DELIMITER $$

-- Evento: Limpiar tokens expirados diariamente
CREATE EVENT IF NOT EXISTS evt_limpiar_tokens_expirados
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
BEGIN
    DELETE FROM jwt_token 
    WHERE expiration < NOW() 
    OR is_revoked = TRUE;
END$$

-- Evento: Actualizar estado de promociones vencidas
CREATE EVENT IF NOT EXISTS evt_actualizar_promociones_vencidas
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    UPDATE promocion 
    SET estado = 'INACTIVA' 
    WHERE fecha_fin < NOW() 
    AND estado = 'ACTIVA';
END$$

DELIMITER ;

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

-- Mostrar todas las tablas creadas
SHOW TABLES;

-- Verificar triggers creados
SHOW TRIGGERS;

-- Verificar vistas creadas
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';

-- Verificar procedimientos almacenados
SHOW PROCEDURE STATUS WHERE Db = 'sistema_pos';

-- Verificar eventos programados
SHOW EVENTS;

-- FIN DEL SCRIPT
