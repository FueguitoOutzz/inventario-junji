from app import app
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from env_vars import cuentas
import os
import MySQLdb  # Importar para manejar errores específicos

# Configuramos la conexión a la base de datos
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST') or 'localhost'  # localhost
app.config['MYSQL_PORT'] = int(os.getenv('MYSQL_PORT', 3396))  # Puerto por defecto 3306
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB') or 'inventariofinal'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
app.config['MYSQL_DATABASE_DEBUG'] = True  # Habilitar depuración para ver más detalles

mysql = MySQL(app)
bcrypt = Bcrypt(app)

# Manejo de errores explícitos en las funciones
def add_modelo_equipo():
    try:
        cur = mysql.connection.cursor()
        cur.execute("...")
        mysql.connection.commit()
    except MySQLdb.Error as e:
        print(f"Error MySQL: {e.args[0]}, {e.args[1]}")  # Código y descripción del error
        raise
    except Exception as e:
        print(f"Error general: {e}")
        raise
