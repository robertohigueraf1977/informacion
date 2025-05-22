/**
 * Roles de usuario en el sistema
 */
export enum UserRole {
  SUPER_USER = "SUPER_USER",
  ADMIN = "ADMIN",
  EDITOR = "EDITOR",
  USER = "USER",
}


/**
 * Tipos de casilla electoral
 */
export enum TipoCasilla {
  BASICA = "BASICA",
  CONTIGUA = "CONTIGUA",
  EXTRAORDINARIA = "EXTRAORDINARIA",
  ESPECIAL = "ESPECIAL",
}

/**
 * Estados de una tarea
 */
export enum EstadoTarea {
  PENDIENTE = "PENDIENTE",
  EN_PROGRESO = "EN_PROGRESO",
  COMPLETADA = "COMPLETADA",
  CANCELADA = "CANCELADA",
}

/**
 * Prioridades de una tarea
 */
export enum PrioridadTarea {
  BAJA = "BAJA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
  URGENTE = "URGENTE",
}
