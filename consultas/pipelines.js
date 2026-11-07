// pipelines.js
// Consultas avanzadas con el Aggregation Framework (de 3 a 4 etapas cada una).
// Se ejecutan desde scripts/05_consultas.js

var pipelines = {

  // Q1. Estancia promedio (en días) por diagnóstico principal en hospitalizaciones egresadas.
  //     Etapas: $match, $group, $project   (3)
  q1_estancia_por_diagnostico: {
    coleccion: "hospitalizaciones",
    pipeline: [
      { $match: { estado: "egresada", eliminado: false } },
      { $group: {
          _id: "$diagnostico_principal",
          egresos: { $sum: 1 },
          estancia_promedio_ms: { $avg: { $subtract: ["$fecha_egreso", "$fecha_ingreso"] } }
      } },
      { $project: {
          _id: 0, diagnostico: "$_id", egresos: 1,
          estancia_promedio_dias: { $round: [{ $divide: ["$estancia_promedio_ms", 86400000] }, 1] }
      } }
    ]
  },

  // Q2. Pacientes activos por médico.
  //     Etapas: $match, $group, $lookup, $project   (4)
  q2_carga_por_medico: {
    coleccion: "hospitalizaciones",
    pipeline: [
      { $match: { estado: "activa", eliminado: false } },
      { $group: { _id: "$medico_id", pacientes_activos: { $sum: 1 } } },
      { $lookup: { from: "medicos", localField: "_id", foreignField: "_id", as: "medico" } },
      { $project: {
          _id: 0, medico_id: "$_id", pacientes_activos: 1,
          nombre: { $arrayElemAt: ["$medico.nombre", 0] },
          especialidad: { $arrayElemAt: ["$medico.especialidad", 0] }
      } }
    ]
  },

  // Q3. Medicamentos más prescritos.
  //     Etapas: $unwind, $sortByCount, $lookup, $project   (4)
  q3_medicamentos_mas_prescritos: {
    coleccion: "hospitalizaciones",
    pipeline: [
      { $unwind: "$prescripciones" },
      { $sortByCount: "$prescripciones.medicamento_id" },
      { $lookup: { from: "medicamentos", localField: "_id", foreignField: "_id", as: "med" } },
      { $project: {
          _id: 0, medicamento_id: "$_id", prescripciones: "$count",
          nombre: { $arrayElemAt: ["$med.nombre", 0] },
          clase: { $arrayElemAt: ["$med.clase", 0] }
      } }
    ]
  },

  // Q4. Hospitalizaciones activas con SpO2 menor a 92 en alguna evolución,
  //     mostrando las evaluaciones críticas y el nombre del paciente.
  //     Etapas: $match, $lookup, $project   (3)
  q4_alerta_saturacion: {
    coleccion: "hospitalizaciones",
    pipeline: [
      { $match: { estado: "activa", eliminado: false, "evolucion.signos.spo2": { $lt: 92 } } },
      { $lookup: { from: "pacientes", localField: "paciente_id", foreignField: "_id", as: "paciente" } },
      { $project: {
          _id: 1, cama_id: 1, diagnostico_principal: 1,
          paciente: { $concat: [
            { $arrayElemAt: ["$paciente.nombres", 0] }, " ", { $arrayElemAt: ["$paciente.apellidos", 0] }
          ] },
          evaluaciones_criticas: { $map: {
            input: { $filter: { input: "$evolucion", as: "e", cond: { $lt: ["$$e.signos.spo2", 92] } } },
            as: "c", in: { fecha: "$$c.fecha", spo2: "$$c.signos.spo2" }
          } }
      } }
    ]
  },

  // Q5. Casos por municipio de residencia y diagnóstico principal.
  //     Etapas: $match, $lookup, $unwind, $group   (4)
  q5_casos_por_municipio: {
    coleccion: "hospitalizaciones",
    pipeline: [
      { $match: { eliminado: false } },
      { $lookup: { from: "pacientes", localField: "paciente_id", foreignField: "_id", as: "paciente" } },
      { $unwind: "$paciente" },
      { $group: {
          _id: { municipio: "$paciente.municipio", diagnostico: "$diagnostico_principal" },
          casos: { $sum: 1 }
      } }
    ]
  }
};
