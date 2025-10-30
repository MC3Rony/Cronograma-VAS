export const formatearFechaCompleta = (fecha: Date): string => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
};

export const formatearFecha = (fecha: string | undefined): string => {
  if (!fecha) return '-';
  const d = new Date(fecha + 'T00:00:00');
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = meses[d.getMonth()];
  const anio = d.getFullYear().toString().substring(2);
  return `${dias[d.getDay()]} ${dia}/${mes}/${anio}`;
};

/**
 * Verifica si una fecha es un día hábil (lunes a viernes)
 */
export const esDiaHabil = (fecha: Date): boolean => {
  const dia = fecha.getDay();
  // 0 = Domingo, 6 = Sábado
  return dia !== 0 && dia !== 6;
};

/**
 * Agrega días hábiles a una fecha
 */
export const agregarDiasHabiles = (fecha: Date, diasHabiles: number): Date => {
  const resultado = new Date(fecha);
  let diasAgregados = 0;

  while (diasAgregados < diasHabiles) {
    resultado.setDate(resultado.getDate() + 1);
    if (esDiaHabil(resultado)) {
      diasAgregados++;
    }
  }

  return resultado;
};

/**
 * Calcula la cantidad de días hábiles entre dos fechas
 */
export const calcularDiasHabiles = (fechaInicio: Date, fechaFin: Date): number => {
  let diasHabiles = 0;
  const actual = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  while (actual <= fin) {
    if (esDiaHabil(actual)) {
      diasHabiles++;
    }
    actual.setDate(actual.getDate() + 1);
  }

  return diasHabiles;
};
