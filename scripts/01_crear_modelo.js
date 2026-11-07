// 01_crear_modelo.js
// Crea la base de datos hce_hospitalizacion con sus colecciones, validación de esquema e índices.
// Ejecutar desde la raíz del proyecto: mongosh --file scripts/01_crear_modelo.js

const bd = db.getSiblingDB("hce_hospitalizacion");
bd.dropDatabase();

// Colecciones de referencia
["pacientes", "medicos", "camas", "diagnosticos", "medicamentos"].forEach(c => bd.createCollection(c));

// Colección principal. La evolución clínica y las prescripciones van embebidas
// porque siempre se consultan junto con la hospitalización.
bd.createCollection("hospitalizaciones", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["paciente_id", "medico_id", "cama_id", "fecha_ingreso", "estado", "diagnostico_principal"],
      properties: {
        paciente_id: { bsonType: "string" },
        medico_id: { bsonType: "string" },
        cama_id: { bsonType: "string" },
        fecha_ingreso: { bsonType: "date" },
        fecha_egreso: { bsonType: ["date", "null"] },
        estado: { enum: ["activa", "egresada"] },
        diagnostico_principal: { bsonType: "string" },
        diagnosticos_secundarios: { bsonType: "array", items: { bsonType: "string" } },
        evolucion: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["fecha", "nota", "signos"],
            properties: {
              fecha: { bsonType: "date" },
              nota: { bsonType: "string" },
              signos: {
                bsonType: "object",
                properties: { spo2: { bsonType: "int", minimum: 0, maximum: 100 } }
              }
            }
          }
        },
        prescripciones: {
          bsonType: "array",
          items: { bsonType: "object", required: ["medicamento_id", "frecuencia", "dias"] }
        },
        eliminado: { bsonType: "bool" }
      }
    }
  }
});

// Índices
bd.hospitalizaciones.createIndex({ paciente_id: 1 });
bd.hospitalizaciones.createIndex({ medico_id: 1, estado: 1 });
bd.hospitalizaciones.createIndex({ diagnostico_principal: 1 });
bd.pacientes.createIndex({ documento: 1 }, { unique: true });

print("Base de datos hce_hospitalizacion creada.");
