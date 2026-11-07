// 03_actualizar.js
// Ejemplos de actualización (Update) en campos simples y anidados.
// Ejecutar desde la raíz del proyecto: mongosh --file scripts/03_actualizar.js

const bd = db.getSiblingDB("hce_hospitalizacion");

// Campo simple: cambio de EPS
bd.pacientes.updateOne({ _id: "P015" }, { $set: { eps: "Nueva EPS" } });

// Campo anidado: nuevo teléfono de contacto
bd.pacientes.updateOne({ _id: "P015" }, { $set: { "contacto.telefono": "3109876543" } });

// Agregar una evolución clínica al arreglo con $push
bd.hospitalizaciones.updateOne(
  { _id: "H017" },
  { $push: { evolucion: {
      fecha: new Date("2026-11-06T08:00:00"), nota: "Afebril, buena respuesta al antibiótico",
      signos: { fc: 80, pa_sistolica: 115, pa_diastolica: 72, temp: 36.8, spo2: NumberInt(98) }
  } } }
);

// Modificar un campo dentro de un elemento del arreglo con el operador posicional $
bd.hospitalizaciones.updateOne(
  { _id: "H017", "evolucion.nota": "Ingreso por disuria y fiebre" },
  { $set: { "evolucion.$.signos.spo2": NumberInt(96) } }
);

// Varios documentos: 2 días más de Ceftriaxona en las hospitalizaciones activas (arrayFilters)
bd.hospitalizaciones.updateMany(
  { estado: "activa" },
  { $inc: { "prescripciones.$[p].dias": 2 } },
  { arrayFilters: [{ "p.medicamento_id": "MED05" }] }
);

// Egreso: cambia el estado, se registra la fecha y se libera la cama
bd.hospitalizaciones.updateOne(
  { _id: "H011" },
  { $set: { estado: "egresada", fecha_egreso: new Date("2026-11-06T10:00:00") } }
);
const h11 = bd.hospitalizaciones.findOne({ _id: "H011" }, { cama_id: 1 });
bd.camas.updateOne({ _id: h11.cama_id }, { $set: { estado: "libre" } });

print("Actualizaciones aplicadas.");
printjson(bd.hospitalizaciones.findOne({ _id: "H017" }, { evolucion: 1, prescripciones: 1 }));
