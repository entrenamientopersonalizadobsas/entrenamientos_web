#!/bin/bash

# Iniciar el backend con Gunicorn
echo "Iniciando el backend (Flask con Gunicorn)..."
gunicorn --workers 4 --bind 0.0.0.0:10000 --chdir backend backend:app &

# Iniciar el frontend
echo "Iniciando el frontend (React)..."
cd frontend
npm install
npm run build

echo "Despliegue completado."

wait