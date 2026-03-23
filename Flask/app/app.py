from flask import Flask
import os

# crea una instancia de la aplicación Flask, utilizando el nombre del módulo actual para configurar la aplicación correctamente.
app = Flask(__name__)

# protege las cookies y datos de sesion del usuario
app.secret_key = os.getenv('SECRET_KEY', 'mysecretkey')