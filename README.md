# Exploradores NoSQL - HCE hospitalización (MongoDB)

Tarea de Bases de Datos II, Unidad 3. Modelo documental en MongoDB para el subsistema de hospitalización de la Historia Clínica Electrónica.

Estudiante: Jhonatan Steven Ciro Amin

## Ejecución

Se necesita MongoDB y mongosh. Desde la raíz del proyecto:

    mongosh --file scripts/01_crear_modelo.js
    mongosh --file scripts/02_insertar.js
    mongosh --file scripts/03_actualizar.js
    mongosh --file scripts/04_eliminar.js
    mongosh --file scripts/05_consultas.js

## Contenido

- scripts/: creación del modelo, inserción, actualización, eliminación, consultas y generador de los datos de prueba.
- consultas/pipelines.js: las cinco consultas avanzadas.
- datos/: datos de prueba en JSON.
- capturas/: capturas de ejecución.
- informe/: informe técnico en PDF.
