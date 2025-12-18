📄 Documentación Técnica de Cambios
Sistema de Gestión de Inventario JUNJI

Fecha: 18-12-2025
Motivo: Habilitar inicio automático del sistema al encender el servidor
Responsable: Equipo TI / Soporte técnico

1. Objetivo de la Intervención

El objetivo de esta intervención fue asegurar que la aplicación de Inventario JUNJI se ejecute automáticamente al encender el servidor, sin necesidad de ejecutar comandos manuales ni iniciar sesión localmente.

Antes de este cambio, la aplicación:

Funcionaba correctamente

Requería ser iniciada manualmente (ejecución directa de python main.py)

Dependía del usuario que la ejecutara

Después del cambio:

La aplicación se ejecuta como servicio del sistema

Se inicia automáticamente al prender el servidor

Mantiene la misma base de datos y la misma información

2. Estado Inicial del Sistema

Servidor Linux (Ubuntu)

Aplicación Flask funcional

Base de datos MySQL existente (inventariofinal)

Datos productivos ya cargados

Usuarios activos en el sistema

Puerto de la aplicación: 3300

MySQL configurado con autenticación por unix_socket para root

⚠️ No se realizó ninguna eliminación ni recreación de base de datos

3. Problema Detectado

Al intentar ejecutar la aplicación como servicio, se detectaron los siguientes problemas:

3.1 Autenticación MySQL con usuario root

MySQL en Ubuntu:

No permite conexión del usuario root mediante contraseña

root solo puede conectarse usando sudo mysql

Esto provocaba el error:

MySQLdb.OperationalError: (1698, "Access denied for user 'root'@'localhost'")

3.2 Puerto MySQL incorrecto

En db.py se encontraba configurado:

MYSQL_PORT = 3396


El puerto correcto del servidor MySQL es:

3306

4. Solución Implementada
4.1 Creación de usuario MySQL dedicado para la aplicación

Se creó un usuario exclusivo para el sistema de inventario, con permisos limitados a su base de datos.

CREATE USER 'inventario'@'localhost' IDENTIFIED BY 'Inventario2025!';
GRANT ALL PRIVILEGES ON inventariofinal.* TO 'inventario'@'localhost';
FLUSH PRIVILEGES;


📌 Este cambio no afecta los datos existentes
📌 No se eliminó ninguna tabla ni registro

4.2 Actualización de configuración MySQL en la aplicación

Archivo modificado:

/opt/inventario-junji/Flask/app/db.py


Configuración final aplicada:

app.config['MYSQL_USER'] = 'inventario'
app.config['MYSQL_PASSWORD'] = 'Inventario2025!'
app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_PORT'] = 3306
app.config['MYSQL_DB'] = 'inventariofinal'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'


📌 Se dejó de utilizar el usuario root
📌 Se corrigió el puerto MySQL

5. Configuración de Inicio Automático (systemd)
5.1 Ubicación del proyecto
/opt/inventario-junji

5.2 Entorno virtual
/opt/inventario-junji/venv

5.3 Servicio del sistema creado

Archivo:

/etc/systemd/system/inventario-junji.service


Contenido:

[Unit]
Description=Inventario JUNJI (Flask + Gunicorn)
After=network.target

[Service]
Type=simple
User=junji
Group=junji
WorkingDirectory=/opt/inventario-junji/Flask/app
ExecStart=/opt/inventario-junji/venv/bin/gunicorn -w 2 -b 0.0.0.0:3300 main:app
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target

5.4 Estado del servicio

El servicio fue habilitado para iniciar automáticamente:

sudo systemctl enable inventario-junji


El servicio queda activo tras reinicio o encendido del servidor.

6. Verificaciones Realizadas
6.1 Estado del servicio
sudo systemctl status inventario-junji


Resultado esperado:

Active: active (running)

6.2 Puerto de escucha
sudo ss -lntp | grep 3300


Confirmado:

Gunicorn escuchando en 0.0.0.0:3300

6.3 Prueba HTTP local
curl -I http://127.0.0.1:3300


Respuesta correcta (302 hacia /ingresar).

6.4 Prueba desde red interna
http://IP_DEL_SERVIDOR:3300


La aplicación carga correctamente y permite login.

7. Estado Final del Sistema

✅ El servidor puede apagarse completamente

✅ Al encenderlo, la aplicación se inicia sola

✅ No requiere intervención manual

✅ La base de datos permanece intacta

✅ Los usuarios y registros siguen disponibles

✅ El login funciona correctamente

8. Consideraciones Importantes

❌ No utilizar el usuario MySQL root en producción

❌ No cambiar puertos sin coordinación TI

❌ No eliminar el servicio systemd

✔ Usar siempre systemctl restart inventario-junji ante cambios

9. Comandos Útiles para Soporte
# Ver estado
sudo systemctl status inventario-junji

# Reiniciar aplicación
sudo systemctl restart inventario-junji

# Ver logs en tiempo real
sudo journalctl -u inventario-junji -f

# Detener aplicación
sudo systemctl stop inventario-junji

10. Conclusión

La intervención del 18-12-2025 permitió profesionalizar el despliegue del sistema de Inventario JUNJI, asegurando:

Continuidad operativa

Inicio automático

Mayor seguridad en el acceso a la base de datos

Estabilidad del sistema en producción