// 05_consultas.js
// Ejecuta las consultas avanzadas definidas en consultas/pipelines.js
// Ejecutar desde la raíz del proyecto: mongosh --file scripts/05_consultas.js

load("consultas/pipelines.js");
const bd = db.getSiblingDB("hce_hospitalizacion");

Object.keys(pipelines).forEach(nombre => {
  const q = pipelines[nombre];
  print("\n=== " + nombre + " ===");
  bd[q.coleccion].aggregate(q.pipeline).forEach(d => printjson(d));
});
