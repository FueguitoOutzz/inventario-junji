from flask import Flask
import os

# crea una instancia de la aplicación Flask, utilizando el nombre del módulo actual para configurar la aplicación correctamente.
app = Flask(__name__)

# Genera una clave distinta cada vez que se reinicia el server para invalidar sesiones antiguas (fuerza relogin)
app.secret_key = os.urandom(24)
