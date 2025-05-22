// Archivo de seed para partidos políticos

export interface Partido {
  nombre: string;
  siglas?: string;
}

export const partidos: Partido[] = [
  { nombre: "Partido Acción Nacional", siglas: "PAN" },
  { nombre: "Lista Nacional", siglas: "LN" },
  { nombre: "Partido Verde Ecologista de México - Partido del Trabajo", siglas: "PVEM_PT" },
  { nombre: "Partido Revolucionario Institucional", siglas: "PRI" },
  { nombre: "Partido Verde Ecologista de México", siglas: "PVEM" },
  { nombre: "No Registradas", siglas: "NR" },
  { nombre: "Nulos", siglas: "NULOS" },
  { nombre: "Partido del Trabajo", siglas: "PT" },
  { nombre: "Movimiento Ciudadano", siglas: "MC" },
  { nombre: "Partido de la Revolución Democrática", siglas: "PRD" },
  { nombre: "Partido Acción Nacional - Partido Revolucionario Institucional - Partido de la Revolución Democrática", siglas: "PAN-PRI-PRD" },
  { nombre: "Partido Acción Nacional - Partido Revolucionario Institucional", siglas: "PAN-PRI" },
  { nombre: "Partido Acción Nacional - Partido de la Revolución Democrática", siglas: "PAN-PRD" },
  { nombre: "Partido Revolucionario Institucional - Partido de la Revolución Democrática", siglas: "PRI-PRD" },
  { nombre: "Partido Verde Ecologista de México - Partido del Trabajo - MORENA", siglas: "PVEM_PT_MORENA" },
  { nombre: "Partido Verde Ecologista de México - MORENA", siglas: "PVEM_MORENA" },
  { nombre: "Partido del Trabajo - MORENA", siglas: "PT_MORENA" },
  { nombre: "MORENA", siglas: "MORENA" }
];

