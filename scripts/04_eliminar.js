// 04_eliminar.js
// Ejemplos de eliminación (Delete): soft delete, quitar elementos de un arreglo y borrado definitivo.
// Ejecutar desde la raíz del proyecto: mongosh --file scripts/04_eliminar.js

const bd = db.getSiblingDB("hce_hospitalizacion");

// Soft delete: la historia clínica no se borra, solo se marca como eliminada
bd.hospitalizaciones.updateOne(
  { _id: "H001" },
  { $set: { eliminado: true, fecha_eliminacion: new Date(), motivo_eliminacion: "Registro duplicado" } }
);

// Quitar una prescripción del arreglo con $pull
bd.hospitalizaciones.updateOne(
  { _id: "H017" },
  { $pull: { prescripciones: { medicamento_id: "MED09" } } }
);

// Eliminación definitiva de los datos de prueba creados en 02_insertar.js
bd.hospitalizaciones.deleteOne({ _id: "H017" });
bd.camas.updateOne({ _id: "C107" }, { $set: { estado: "libre" } });
bd.pacientes.deleteOne({ _id: "P015" });

print("Hospitalizaciones marcadas como eliminadas: " + bd.hospitalizaciones.countDocuments({ eliminado: true }));
print("Hospitalizaciones totales: " + bd.hospitalizaciones.countDocuments());
