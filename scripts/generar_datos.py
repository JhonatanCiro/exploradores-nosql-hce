# Genera los datos simulados de hospitalización y los guarda en la carpeta datos/.
# Ejecutar: python3 scripts/generar_datos.py
import json, random, os
from datetime import date, datetime, timedelta

random.seed(2026)
RUTA = os.path.join(os.path.dirname(__file__), "..", "datos")

def guardar(nombre, docs):
    with open(os.path.join(RUTA, nombre + ".json"), "w", encoding="utf-8") as f:
        json.dump(docs, f, ensure_ascii=False, indent=2)

diagnosticos = [
    {"_id": "I10", "descripcion": "Hipertension esencial", "capitulo": "Enfermedades del sistema circulatorio"},
    {"_id": "E11", "descripcion": "Diabetes mellitus tipo 2", "capitulo": "Enfermedades endocrinas y metabolicas"},
    {"_id": "J18", "descripcion": "Neumonia, organismo no especificado", "capitulo": "Enfermedades del sistema respiratorio"},
    {"_id": "A09", "descripcion": "Gastroenteritis infecciosa", "capitulo": "Enfermedades infecciosas"},
    {"_id": "N39", "descripcion": "Infeccion de vias urinarias", "capitulo": "Enfermedades del sistema genitourinario"},
    {"_id": "I50", "descripcion": "Insuficiencia cardiaca", "capitulo": "Enfermedades del sistema circulatorio"},
    {"_id": "J44", "descripcion": "Enfermedad pulmonar obstructiva cronica", "capitulo": "Enfermedades del sistema respiratorio"},
    {"_id": "K35", "descripcion": "Apendicitis aguda", "capitulo": "Enfermedades del sistema digestivo"},
]

medicamentos = [
    {"_id": "MED01", "nombre": "Enalapril", "via": "oral", "clase": "Antihipertensivo"},
    {"_id": "MED02", "nombre": "Amlodipino", "via": "oral", "clase": "Antihipertensivo"},
    {"_id": "MED03", "nombre": "Metformina", "via": "oral", "clase": "Antidiabetico"},
    {"_id": "MED04", "nombre": "Insulina NPH", "via": "subcutanea", "clase": "Antidiabetico"},
    {"_id": "MED05", "nombre": "Ceftriaxona", "via": "intravenosa", "clase": "Antibiotico"},
    {"_id": "MED06", "nombre": "Azitromicina", "via": "oral", "clase": "Antibiotico"},
    {"_id": "MED07", "nombre": "Ondansetron", "via": "intravenosa", "clase": "Antiemetico"},
    {"_id": "MED08", "nombre": "Solucion salina 0.9%", "via": "intravenosa", "clase": "Hidratacion"},
    {"_id": "MED09", "nombre": "Ciprofloxacino", "via": "oral", "clase": "Antibiotico"},
    {"_id": "MED10", "nombre": "Furosemida", "via": "intravenosa", "clase": "Diuretico"},
    {"_id": "MED11", "nombre": "Salbutamol", "via": "inhalada", "clase": "Broncodilatador"},
    {"_id": "MED12", "nombre": "Prednisona", "via": "oral", "clase": "Corticoide"},
    {"_id": "MED13", "nombre": "Metronidazol", "via": "intravenosa", "clase": "Antibiotico"},
    {"_id": "MED14", "nombre": "Dipirona", "via": "intravenosa", "clase": "Analgesico"},
]

# medicamentos según el diagnóstico principal
TRATAMIENTO = {
    "I10": ["MED01", "MED02"], "E11": ["MED03", "MED04"], "J18": ["MED05", "MED06"],
    "A09": ["MED07", "MED08"], "N39": ["MED09", "MED05"], "I50": ["MED10", "MED01"],
    "J44": ["MED11", "MED12"], "K35": ["MED13", "MED14", "MED05"],
}
SECUNDARIOS = {"I50": ["I10"], "J18": ["J44"], "J44": ["I10"], "E11": ["I10"], "N39": ["E11"]}
DOSIS = {"oral": "1 tableta", "intravenosa": "dosis estandar IV", "subcutanea": "10 UI", "inhalada": "2 inhalaciones"}
FREC = ["cada 8 horas", "cada 12 horas", "cada 24 horas", "cada 6 horas"]

municipios = ["Medellin", "Bello", "Itagui", "Envigado", "Rionegro", "Apartado", "Turbo", "Caucasia"]
eps = ["Savia Salud", "Sura", "Nueva EPS", "Sanitas"]
nombres = [("Maria", "Gomez"), ("Juan", "Restrepo"), ("Luz", "Arango"), ("Carlos", "Zapata"),
           ("Ana", "Villa"), ("Pedro", "Cardona"), ("Sofia", "Munoz"), ("Andres", "Osorio"),
           ("Camila", "Giraldo"), ("Jorge", "Mejia"), ("Diana", "Ospina"), ("Luis", "Henao"),
           ("Marta", "Correa"), ("Felipe", "Londono")]

pacientes = []
for i, (n, a) in enumerate(nombres, 1):
    pacientes.append({
        "_id": f"P{i:03d}", "documento": str(1000000 + i * 7919), "nombres": n, "apellidos": a,
        "sexo": "F" if n in ("Maria", "Luz", "Ana", "Sofia", "Camila", "Diana", "Marta") else "M",
        "fecha_nacimiento": date(random.randint(1938, 2005), random.randint(1, 12), random.randint(1, 28)).isoformat(),
        "municipio": random.choice(municipios), "eps": random.choice(eps),
        "contacto": {"telefono": "300" + str(random.randint(1000000, 9999999))},
    })

esp = ["Medicina interna", "Medicina interna", "Neumologia", "Cardiologia", "Cirugia general", "Pediatria"]
medicos = [{"_id": f"M{i:03d}", "nombre": f"Dr(a). {ap}", "especialidad": e, "registro_medico": f"RM-{50000 + i * 131}"}
           for i, (e, ap) in enumerate(zip(esp, ["Salazar", "Duque", "Pineda", "Bedoya", "Escobar", "Montoya"]), 1)]

camas = []
for i in range(1, 11):
    servicio = "Medicina interna" if i <= 6 else ("Cirugia" if i <= 8 else "UCI intermedia")
    camas.append({"_id": f"C{100 + i}", "servicio": servicio, "piso": 1 if i <= 6 else 2, "estado": "libre"})

HOY = datetime(2026, 11, 5, 8, 0)
codigos = list(TRATAMIENTO.keys())
hospitalizaciones = []
activas = 0
for h in range(1, 17):
    principal = codigos[(h * 3) % len(codigos)]
    activa = h > 10
    dias = random.randint(2, 9)
    if activa:
        ingreso = HOY - timedelta(days=random.randint(1, 6), hours=random.randint(0, 5))
        egreso = None
        cama = f"C{100 + (h - 10)}"
        camas[h - 11]["estado"] = "ocupada"
    else:
        ingreso = datetime(2026, random.randint(8, 10), random.randint(1, 20), random.randint(6, 20), 0)
        egreso = ingreso + timedelta(days=dias)
        cama = f"C{100 + random.randint(1, 10)}"
    fin = egreso or HOY
    n_ev = random.randint(2, 4)
    evol = []
    for k in range(n_ev):
        f = ingreso + (fin - ingreso) * (k + 1) / (n_ev + 1)
        mal = principal in ("J18", "J44", "I50") and k == 0
        evol.append({
            "fecha": f.replace(microsecond=0).isoformat(),
            "nota": random.choice(["Paciente estable, tolera via oral", "Persisten sintomas, se ajusta manejo",
                                   "Mejoria clinica parcial", "Afebril, continua hospitalizado"]),
            "signos": {"fc": random.randint(62, 112), "pa_sistolica": random.randint(105, 160),
                       "pa_diastolica": random.randint(60, 100), "temp": round(random.uniform(36.1, 38.6), 1),
                       "spo2": random.randint(86, 91) if mal else random.randint(92, 99)},
        })
    presc = [{"medicamento_id": m, "dosis": "", "frecuencia": random.choice(FREC), "dias": random.randint(3, 10)}
             for m in TRATAMIENTO[principal]]
    vias = {m["_id"]: m["via"] for m in medicamentos}
    for p in presc:
        p["dosis"] = DOSIS[vias[p["medicamento_id"]]]
    hospitalizaciones.append({
        "_id": f"H{h:03d}", "paciente_id": pacientes[(h - 1) % len(pacientes)]["_id"],
        "medico_id": random.choice(medicos)["_id"], "cama_id": cama,
        "fecha_ingreso": ingreso.replace(microsecond=0).isoformat(),
        "fecha_egreso": egreso.replace(microsecond=0).isoformat() if egreso else None,
        "estado": "activa" if activa else "egresada",
        "diagnostico_principal": principal, "diagnosticos_secundarios": SECUNDARIOS.get(principal, []),
        "evolucion": evol, "prescripciones": presc, "eliminado": False,
    })

for nombre, docs in [("pacientes", pacientes), ("medicos", medicos), ("camas", camas),
                     ("diagnosticos", diagnosticos), ("medicamentos", medicamentos),
                     ("hospitalizaciones", hospitalizaciones)]:
    guardar(nombre, docs)
print("Datos generados:", {k: len(v) for k, v in [("pacientes", pacientes), ("hospitalizaciones", hospitalizaciones)]})
