-- ========================================
-- CONFIGURACIÓN DE SEGURIDAD - Sistema POS Cafetería
-- MySQL 8.0+
-- Versión: 1.0
-- Fecha: 2025-11-27
-- ========================================
-- PROPÓSITO:
-- Este script configura la seguridad del servidor MySQL y crea usuarios
-- con privilegios mínimos necesarios para la aplicación y backups.
--
-- INSTRUCCIONES:
-- 1. Ejecutar DESPUÉS de schema.sql
-- 2. Ejecutar como usuario root o con privilegios GRANT
-- 3. Cambiar contraseñas antes de usar en producción
-- ========================================

USE sistema_pos;

-- ========================================
-- PARTE 1: GESTIÓN DE USUARIOS
-- ========================================

-- ----------------------------------------
-- 1.1 USUARIO DE APLICACIÓN (cafeteria_app)
-- ----------------------------------------
-- Este usuario es para que la aplicación Spring Boot se conecte a la BD

-- Eliminar usuario si existe (solo desarrollo)
-- COMENTAR esta línea en producción para evitar eliminar usuario accidentalmente
DROP USER IF EXISTS 'cafeteria_app'@'localhost';

-- Crear usuario con contraseña
-- ⚠️ CAMBIAR CONTRASEÑA ANTES DE PRODUCCIÓN
-- Requisitos de contraseña segura:
-- - Mínimo 12 caracteres
-- - Mayúsculas y minúsculas
-- - Números y símbolos
-- - No utilizar palabras del diccionario
CREATE USER 'cafeteria_app'@'localhost' 
IDENTIFIED BY 'CafeteriaApp_2025!' 
PASSWORD EXPIRE INTERVAL 90 DAY  -- Expiración cada 90 días
PASSWORD HISTORY 5               -- No reutilizar últimas 5 contraseñas
FAILED_LOGIN_ATTEMPTS 3          -- Bloquear después de 3 intentos fallidos
PASSWORD_LOCK_TIME 1;            -- Bloquear por 1 día

-- ALTERNATIVA: Permitir conexión desde red local (cambiar IP según necesidad)
-- CREATE USER 'cafeteria_app'@'192.168.1.%' IDENTIFIED BY 'CafeteriaApp_2025!';

-- ----------------------------------------
-- 1.2 PRIVILEGIOS DEL USUARIO DE APLICACIÓN
-- ----------------------------------------

-- Privilegios mínimos necesarios para operación normal
GRANT SELECT, INSERT, UPDATE, DELETE ON sistema_pos.* TO 'cafeteria_app'@'localhost';

-- Privilegio para ejecutar procedimientos almacenados y funciones
GRANT EXECUTE ON sistema_pos.* TO 'cafeteria_app'@'localhost';

-- PRIVILEGIOS PELIGROSOS - NO OTORGAR EN PRODUCCIÓN:
-- ❌ DROP    - Eliminar tablas/databases
-- ❌ ALTER   - Modificar estructura de tablas
-- ❌ CREATE  - Crear tablas/databases
-- ❌ INDEX   - Crear/modificar índices
-- ❌ GRANT   - Otorgar privilegios a otros
-- ❌ SUPER   - Administración del servidor
-- ❌ FILE    - Leer/escribir archivos del sistema
-- ❌ PROCESS - Ver procesos de otros usuarios

-- ----------------------------------------
-- 1.3 USUARIO PARA BACKUPS (cafeteria_backup)
-- ----------------------------------------
-- Este usuario es SOLO para realizar backups de la base de datos

DROP USER IF EXISTS 'cafeteria_backup'@'localhost';

CREATE USER 'cafeteria_backup'@'localhost' 
IDENTIFIED BY 'BackupSecure_2025!'
PASSWORD EXPIRE NEVER;  -- No expira (es usuario de sistema)

-- Privilegios mínimos para backups
GRANT SELECT ON sistema_pos.* TO 'cafeteria_backup'@'localhost';
GRANT LOCK TABLES ON sistema_pos.* TO 'cafeteria_backup'@'localhost';
GRANT SHOW VIEW ON sistema_pos.* TO 'cafeteria_backup'@'localhost';
GRANT EVENT ON sistema_pos.* TO 'cafeteria_backup'@'localhost';
GRANT TRIGGER ON sistema_pos.* TO 'cafeteria_backup'@'localhost';

-- ----------------------------------------
-- 1.4 USUARIO DE LECTURA (OPCIONAL - para reportes)
-- ----------------------------------------
-- Descomentar si necesitas usuario de solo lectura para análisis/reportes

-- DROP USER IF EXISTS 'cafeteria_readonly'@'localhost';
-- CREATE USER 'cafeteria_readonly'@'localhost' IDENTIFIED BY 'ReadOnly_2025!';
-- GRANT SELECT ON sistema_pos.* TO 'cafeteria_readonly'@'localhost';

-- Aplicar cambios de usuarios
FLUSH PRIVILEGES;

-- ========================================
-- PARTE 2: CONFIGURACIÓN DE SEGURIDAD DEL SERVIDOR
-- ========================================

-- ----------------------------------------
-- 2.1 TIMEOUTS Y CONEXIONES
-- ----------------------------------------

-- Tiempo máximo de inactividad antes de cerrar conexión (8 horas)
SET GLOBAL wait_timeout = 28800;
SET GLOBAL interactive_timeout = 28800;

-- Tiempo máximo para completar una consulta (10 minutos)
-- Previene consultas infinitas que bloquean recursos
SET GLOBAL max_execution_time = 600000;  -- en milisegundos

-- Máximo de conexiones simultáneas (ajustar según servidor)
SET GLOBAL max_connections = 151;  -- Default MySQL 8.0

-- Máximo de errores de conexión antes de bloquear host
SET GLOBAL max_connect_errors = 100;

-- ----------------------------------------
-- 2.2 SEGURIDAD DE CONEXIONES
-- ----------------------------------------

-- Requerir conexiones seguras (SSL/TLS) - IMPORTANTE EN PRODUCCIÓN
-- ⚠️ Solo habilitar si tienes certificados SSL configurados
-- SET GLOBAL require_secure_transport = ON;

-- Deshabilitar carga de archivos locales (previene inyección)
SET GLOBAL local_infile = OFF;

-- Resolver hosts puede ser lento y exponer información
-- Recomendado: usar solo IPs
SET GLOBAL skip_name_resolve = OFF;  -- Cambiar a ON si solo usas IPs

-- ----------------------------------------
-- 2.3 VALIDACIÓN DE CONTRASEÑAS
-- ----------------------------------------

-- Plugin de validación de contraseñas (ya incluido en MySQL 8.0+)
-- Verificar configuración actual:
SHOW VARIABLES LIKE 'validate_password%';

-- Configurar políticas de contraseña (si está habilitado el plugin):
-- SET GLOBAL validate_password.policy = MEDIUM;
-- SET GLOBAL validate_password.length = 12;
-- SET GLOBAL validate_password.mixed_case_count = 1;
-- SET GLOBAL validate_password.number_count = 1;
-- SET GLOBAL validate_password.special_char_count = 1;

-- ========================================
-- PARTE 3: CONFIGURACIÓN DE LOGS Y AUDITORÍA
-- ========================================

-- ----------------------------------------
-- 3.1 LOG DE CONSULTAS LENTAS
-- ----------------------------------------

-- Habilitar log de consultas que tardan más de 2 segundos
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 2.0;

-- Guardar en tabla (más fácil de consultar que archivo)
SET GLOBAL log_output = 'TABLE';

-- También registrar consultas sin índices
SET GLOBAL log_queries_not_using_indexes = ON;

-- Consultar logs de consultas lentas:
-- SELECT * FROM mysql.slow_log 
-- WHERE query_time > 2 
-- ORDER BY start_time DESC 
-- LIMIT 20;

-- ----------------------------------------
-- 3.2 LOG GENERAL (SOLO PARA DEBUGGING)
-- ----------------------------------------

-- ⚠️ ADVERTENCIA: Genera MUCHÍSIMA información
-- Solo habilitar temporalmente para debugging

-- SET GLOBAL general_log = ON;
-- SET GLOBAL log_output = 'TABLE';

-- Consultar log general:
-- SELECT * FROM mysql.general_log 
-- ORDER BY event_time DESC 
-- LIMIT 100;

-- IMPORTANTE: Deshabilitar cuando termines de debuggear
-- SET GLOBAL general_log = OFF;

-- ----------------------------------------
-- 3.3 LOG DE ERRORES
-- ----------------------------------------

-- El log de errores siempre está habilitado
-- Ubicación del archivo:
SHOW VARIABLES LIKE 'log_error';

-- ----------------------------------------
-- 3.4 LOG BINARIO (para replicación y recuperación)
-- ----------------------------------------

-- Verificar si está habilitado (debería estar en producción)
SHOW VARIABLES LIKE 'log_bin';

-- Si no está habilitado, agregar en my.cnf:
-- [mysqld]
-- log-bin=mysql-bin
-- expire_logs_days=7

-- ========================================
-- PARTE 4: OPTIMIZACIÓN DE RENDIMIENTO
-- ========================================

-- ----------------------------------------
-- 4.1 BUFFERS Y CACHE
-- ----------------------------------------

-- Buffer para operaciones de ordenamiento
SET GLOBAL sort_buffer_size = 4194304;  -- 4MB (aumentado de default 256KB)

-- Buffer para operaciones JOIN
SET GLOBAL join_buffer_size = 4194304;  -- 4MB

-- Tamaño máximo de paquetes (para consultas grandes)
SET GLOBAL max_allowed_packet = 67108864;  -- 64MB

-- ----------------------------------------
-- 4.2 INNODB (Motor de almacenamiento)
-- ----------------------------------------

-- Buffer Pool - EL MÁS IMPORTANTE
-- Recomendado: 70-80% de RAM disponible para MySQL
-- Ejemplo para servidor con 4GB RAM dedicado a MySQL:
-- SET GLOBAL innodb_buffer_pool_size = 3221225472;  -- 3GB

-- Tamaño de archivo de log (para transacciones grandes)
-- SET GLOBAL innodb_log_file_size = 536870912;  -- 512MB

-- Número de threads para operaciones de lectura
SET GLOBAL innodb_read_io_threads = 4;

-- Número de threads para operaciones de escritura
SET GLOBAL innodb_write_io_threads = 4;

-- Modo de flush (seguridad vs rendimiento)
-- 1 = máxima seguridad (flush en cada commit)
-- 2 = mejor rendimiento (flush cada segundo)
SET GLOBAL innodb_flush_log_at_trx_commit = 1;  -- Seguridad

-- ----------------------------------------
-- 4.3 TABLA DE HILOS
-- ----------------------------------------

-- Mantener threads en cache para reutilizar
SET GLOBAL thread_cache_size = 16;

-- Consultar efectividad del cache:
-- SHOW STATUS LIKE 'Threads_created';
-- SHOW STATUS LIKE 'Connections';
-- Si Threads_created es cercano a Connections, aumentar thread_cache_size

-- ========================================
-- PARTE 5: VERIFICACIONES Y DIAGNÓSTICO
-- ========================================

-- ----------------------------------------
-- 5.1 VERIFICAR USUARIOS CREADOS
-- ----------------------------------------

SELECT 
    User,
    Host,
    account_locked,
    password_expired,
    password_lifetime,
    password_last_changed,
    password_reuse_history,
    password_reuse_time,
    Failed_login_attempts,
    Password_lock_time_days
FROM mysql.user 
WHERE User LIKE 'cafeteria%'
ORDER BY User;

-- ----------------------------------------
-- 5.2 VERIFICAR PRIVILEGIOS
-- ----------------------------------------

-- Usuario de aplicación
SHOW GRANTS FOR 'cafeteria_app'@'localhost';

-- Usuario de backups
SHOW GRANTS FOR 'cafeteria_backup'@'localhost';

-- ----------------------------------------
-- 5.3 VERIFICAR CONFIGURACIÓN DE SEGURIDAD
-- ----------------------------------------

SELECT 
    @@global.wait_timeout AS 'Wait Timeout',
    @@global.max_connections AS 'Max Connections',
    @@global.max_connect_errors AS 'Max Connect Errors',
    @@global.local_infile AS 'Local Infile',
    @@global.slow_query_log AS 'Slow Query Log',
    @@global.long_query_time AS 'Long Query Time';

-- ----------------------------------------
-- 5.4 VERIFICAR RENDIMIENTO
-- ----------------------------------------

-- Estado de conexiones
SHOW STATUS WHERE Variable_name IN (
    'Connections',
    'Max_used_connections',
    'Threads_connected',
    'Threads_running',
    'Aborted_connects',
    'Aborted_clients'
);

-- Estado del buffer pool de InnoDB
SHOW STATUS WHERE Variable_name LIKE 'Innodb_buffer_pool%';

-- ----------------------------------------
-- 5.5 VERIFICAR LOGS
-- ----------------------------------------

-- Ver si hay consultas lentas recientes
SELECT COUNT(*) AS 'Consultas Lentas Hoy' 
FROM mysql.slow_log 
WHERE start_time >= CURDATE();

-- Ver consultas más lentas de hoy
SELECT 
    ROUND(query_time, 2) AS 'Tiempo (seg)',
    SUBSTRING(sql_text, 1, 100) AS 'Consulta',
    start_time AS 'Hora'
FROM mysql.slow_log 
WHERE start_time >= CURDATE()
ORDER BY query_time DESC 
LIMIT 10;

-- ========================================
-- PARTE 6: INSTRUCCIONES PARA LA APLICACIÓN
-- ========================================

/*
┌──────────────────────────────────────────────────────────────┐
│ CONFIGURACIÓN DEL ARCHIVO .env                               │
└──────────────────────────────────────────────────────────────┘

DESARROLLO:
-----------
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_pos
DB_USERNAME=root
DB_PASSWORD=tu_password_root

PRODUCCIÓN:
-----------
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sistema_pos
DB_USERNAME=cafeteria_app
DB_PASSWORD=CafeteriaApp_2025!  ⚠️ CAMBIAR POR CONTRASEÑA SEGURA

┌──────────────────────────────────────────────────────────────┐
│ COMANDOS DE BACKUP                                            │
└──────────────────────────────────────────────────────────────┘

Backup completo:
----------------
mysqldump -u cafeteria_backup -p sistema_pos > backup_$(date +%Y%m%d_%H%M%S).sql

Backup solo estructura (sin datos):
------------------------------------
mysqldump -u cafeteria_backup -p --no-data sistema_pos > estructura.sql

Backup solo datos:
------------------
mysqldump -u cafeteria_backup -p --no-create-info sistema_pos > datos.sql

Restaurar backup:
-----------------
mysql -u root -p sistema_pos < backup_20251127_160000.sql

┌──────────────────────────────────────────────────────────────┐
│ CHECKLIST DE SEGURIDAD PARA PRODUCCIÓN                       │
└──────────────────────────────────────────────────────────────┘

□ Cambiar todas las contraseñas por contraseñas únicas y seguras
□ Habilitar SSL/TLS para conexiones a MySQL
□ Configurar firewall para permitir solo conexiones desde app
□ Establecer backups automáticos diarios
□ Configurar monitoreo de logs de errores
□ Revisar logs de consultas lentas semanalmente
□ Implementar rotación de contraseñas (cada 90 días)
□ Configurar alertas para conexiones fallidas
□ Documentar credenciales en gestor de contraseñas seguro
□ Probar proceso de recuperación de backups
□ Configurar replicación maestro-esclavo (alta disponibilidad)
□ Limitar acceso físico al servidor de base de datos
□ Mantener MySQL actualizado con parches de seguridad
□ Revisar privilegios de usuarios trimestralmente

┌──────────────────────────────────────────────────────────────┐
│ RECOMENDACIONES DE SEGURIDAD                                  │
└──────────────────────────────────────────────────────────────┘

1. CONTRASEÑAS:
   - Generar con: openssl rand -base64 32
   - No usar palabras comunes o datos personales
   - Diferente para cada entorno (dev/staging/prod)

2. ACCESO:
   - Limitar conexiones a localhost o IPs específicas
   - Usar VPN si MySQL está en servidor remoto
   - No exponer puerto MySQL a Internet

3. MONITOREO:
   - Revisar logs diariamente
   - Alertas automáticas para actividad sospechosa
   - Dashboard de métricas de rendimiento

4. BACKUPS:
   - Automatizar backups diarios
   - Almacenar en ubicación diferente al servidor
   - Probar restauración mensualmente
   - Mantener al menos 30 días de backups

5. ACTUALIZACIONES:
   - Revisar parches de seguridad de MySQL
   - Probar en staging antes de producción
   - Mantener documentación de cambios
*/

-- ========================================
-- FIN DEL SCRIPT
-- ========================================

-- Mensaje de confirmación
SELECT 
    '✅ Configuración de seguridad completada' AS 'Estado',
    'Revisar verificaciones arriba' AS 'Siguiente Paso',
    'Actualizar .env con credenciales' AS 'Acción Requerida';
