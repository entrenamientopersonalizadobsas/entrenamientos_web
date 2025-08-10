import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime

# Configuración de Flask
app = Flask(__name__)
CORS(app) # Permite solicitudes desde el frontend

# Configuración de Google Sheets
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

# Intenta cargar las credenciales de una variable de entorno (para Render)
# Si no la encuentra, usa el archivo local (para tu desarrollo)
try:
    creds_json = os.environ.get('GOOGLE_CREDENTIALS')
    if creds_json:
        creds_data = json.loads(creds_json)
        creds = ServiceAccountCredentials.from_json(creds_data, scope)
        print("Credenciales cargadas desde la variable de entorno.")
    else:
        print("No se encontró la variable GOOGLE_CREDENTIALS. Intentando cargar el archivo local.")
        creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
except Exception as e:
    print(f"Error al cargar credenciales: {e}")
    creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)

client = gspread.authorize(creds)
# Reemplaza con el nombre de tu hoja
sheet = client.open("Entrenamiento").sheet1

@app.route('/guardar_registro', methods=['POST'])
def guardar_registro():
    try:
        data = request.get_json()
        
        # Obtén todos los datos del JSON
        usuario_nombre = data.get('usuario_nombre', 'N/A')
        estado_animo = data.get('estado_animo', 'N/A')
        objetivo_mensual = data.get('objetivo_mensual', 'N/A')
        objetivo_semanal = data.get('objetivo_semanal', 'N/A')
        nivel_nutricion = data.get('nivel_nutricion', 'N/A')
        nivel_sueno = data.get('nivel_sueno', 'N/A')
        nivel_energia = data.get('nivel_energia', 'N/A')
        semana = data.get('semana', 'N/A')
        dia = data.get('dia', 'N/A')
        ejercicio = data.get('ejercicio', 'N/A')
        serie = data.get('serie', 'N/A')
        peso = data.get('peso', 'N/A')
        repeticiones = data.get('repeticiones', 'N/A')
        rir = data.get('rir', 'N/A')
        rpe = data.get('rpe', 'N/A')
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Prepara la fila de datos para el Google Sheet
        fila = [
            usuario_nombre,
            timestamp,
            estado_animo,
            objetivo_mensual,
            objetivo_semanal,
            nivel_nutricion,
            nivel_sueno,
            nivel_energia,
            semana,
            dia,
            ejercicio,
            serie,
            peso,
            repeticiones,
            rir,
            rpe
        ]
        
        sheet.append_row(fila)
        print(f"Nuevo registro para '{usuario_nombre}' (Ej: {ejercicio}, Serie: {serie}) guardado con éxito.")

        return jsonify({"message": "Registro guardado con éxito"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Para desarrollo local, usa un puerto diferente si es necesario
    app.run(debug=True)