// 02_insertar.js
// Carga los datos de la carpeta datos/ y muestra ejemplos de inserción (Create).
// Ejecutar desde la raíz del proyecto: mongosh --file scripts/02_insertar.js

const fs = require("fs");
const bd = db.getSiblingDB("hce_hospitalizacion");

const leer = nombre => JSON.parse(fs.readFileSync("datos/" + nombre + ".json", "utf8"));

// En los JSON las fechas son texto, aquí se pasan a tipo Date
const hospitalizaciones = leer("hospitalizaciones").map(h => {
  h.fecha_ingreso = new Date(h.fecha_ingreso);
  h.fecha_egreso = h.fecha_egreso ? new Date(h.fecha_egreso) : null;
  h.evolucion.forEach(e => { e.fecha = new Date(e.fecha); e.signos.spo2 = NumberInt(e.signos.spo2); });
  return h;
});
const pacientes = leer("pacientes").map(p => { p.fecha_nacimiento = new Date(p.fecha_nacimiento); return p; });

bd.pacientes.insertMany(pacientes);
bd.medicos.insertMany(leer("medicos"));
bd.camas.insertMany(leer("camas"));
bd.diagnosticos.insertMany(leer("diagnosticos"));
bd.medicamentos.insertMany(leer("medicamentos"));
bd.hospitalizaciones.insertMany(hospitalizaciones);

print("Documentos cargados:");
["pacientes", "medicos", "camas", "diagnosticos", "medicamentos", "hospitalizaciones"]
  .forEach(c => print("  " + c + ": " + bd[c].countDocuments()));

// Insertar un paciente nuevo (con el contacto como documento anidado)
bd.pacientes.insertOne({
  _id: "P015", documento: "1200001", nombres: "Valentina", apellidos: "Rios", sexo: "F",
  fecha_nacimiento: new Date("1990-04-17"), municipio: "Sabaneta", eps: "Sura",
  contacto: { telefono: "3001234567" }
});

// Insertar una hospitalización nueva en la cama C107, con evolución y prescripción embebidas
bd.hospitalizaciones.insertOne({
  _id: "H017", paciente_id: "P015", medico_id: "M001", cama_id: "C107",
  fecha_ingreso: new Date("2026-11-05T22:30:00"), fecha_egreso: null, estado: "activa",
  diagnostico_principal: "N39", diagnosticos_secundarios: [],
  evolucion: [{
    fecha: new Date("2026-11-05T23:00:00"), nota: "Ingreso por disuria y fiebre",
    signos: { fc: 98, pa_sistolica: 118, pa_diastolica: 74, temp: 38.2, spo2: NumberInt(97) }
  }],
  prescripciones: [{ medicamento_id: "MED09", dosis: "1 tableta", frecuencia: "cada 12 horas", dias: 7 }],
  eliminado: false
});

// La cama queda ocupada
bd.camas.updateOne({ _id: "C107" }, { $set: { estado: "ocupada" } });

print("Insertados: paciente P015, hospitalización H017 y cama C107 ocupada.");
