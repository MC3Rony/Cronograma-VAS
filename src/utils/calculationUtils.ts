import type { Tarea, Estadisticas, FechaProduccion } from '../types';
import { agregarDiasHabiles, calcularDiasHabiles } from './dateUtils';

export const calcularRetraso = (tarea: Tarea, fechaHoy: Date): number => {
  if (tarea.estado === 'Finalizada') return 0;
  const hoy = new Date(fechaHoy);
  hoy.setHours(0, 0, 0, 0);

  if (tarea.estado === 'Retrasada' && tarea.inicio) {
    const inicio = new Date(tarea.inicio + 'T00:00:00');
    const diffTime = hoy.getTime() - inicio.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  if (tarea.estado === 'En Curso') {
    const fechaLimite = tarea.fin;
    if (!fechaLimite) return 0;
    const limite = new Date(fechaLimite + 'T00:00:00');
    const diffTime = hoy.getTime() - limite.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
};

export const calcularEstadisticas = (tareas: Tarea[]): Estadisticas => {
  // Optimización: una sola iteración en lugar de 5 filtros separados
  return tareas.reduce((acc, t) => {
    if (t.tipo !== 'tarea') return acc;
    acc.total++;
    switch (t.estado) {
      case 'Finalizada':
        acc.finalizadas++;
        break;
      case 'En Curso':
        acc.enCurso++;
        break;
      case 'Retrasada':
        acc.retrasadas++;
        break;
      case 'Pendiente':
        acc.pendientes++;
        break;
    }
    return acc;
  }, { total: 0, finalizadas: 0, enCurso: 0, retrasadas: 0, pendientes: 0 });
};

export const calcularFechaProduccion = (tareas: Tarea[], fechaHoy: Date): FechaProduccion => {
  const fechaProduccionOriginal = new Date('2026-03-03');
  let totalDiasRetraso = 0;
  tareas.forEach(tarea => {
    if (tarea.tipo === 'tarea' && tarea.estado !== 'Finalizada') {
      totalDiasRetraso += calcularRetraso(tarea, fechaHoy);
    }
  });
  const fechaAjustada = new Date(fechaProduccionOriginal);
  fechaAjustada.setDate(fechaAjustada.getDate() + totalDiasRetraso);
  return { original: fechaProduccionOriginal, ajustada: fechaAjustada, diasRetraso: totalDiasRetraso };
};

export const calcularProgreso = (estadisticas: Estadisticas): number => {
  return Math.round((estadisticas.finalizadas / estadisticas.total) * 100) || 0;
};

export const calcularDiasHeader = (tareas: Tarea[], headerId: number): string => {
  const headerIndex = tareas.findIndex(t => t.id === headerId);
  if (headerIndex === -1) return '0 días';

  let totalDias = 0;

  // Recorrer desde el header hasta el siguiente header o el final
  for (let i = headerIndex + 1; i < tareas.length; i++) {
    const tarea = tareas[i];

    // Si encontramos otro header, terminamos
    if (tarea.tipo === 'header') break;

    // Solo contar tareas, no milestones
    if (tarea.tipo === 'tarea' && tarea.duracion) {
      // Extraer el número de la duración (ej: "5 días" -> 5, "10 días" -> 10)
      const match = tarea.duracion.match(/\d+/);
      if (match) {
        totalDias += parseInt(match[0]);
      }
    }
  }

  return `${totalDias} días`;
};

/**
 * Calcula la fecha real de entrega del proyecto basándose en:
 * - La fecha más lejana de todas las tareas con fechas asignadas
 * - Los días hábiles de retraso acumulados
 */
export const calcularFechaEntregaReal = (tareas: Tarea[], fechaHoy: Date): string | null => {
  const tareasConFechas = tareas.filter(t =>
    t.tipo === 'tarea' && t.fin
  );

  if (tareasConFechas.length === 0) {
    return null; // No hay tareas con fechas
  }

  // Encontrar la fecha más lejana
  let fechaMasLejana: Date | null = null;

  tareasConFechas.forEach(tarea => {
    const fechaFin = tarea.fin;
    if (!fechaFin) return;

    const fecha = new Date(fechaFin + 'T00:00:00');

    if (!fechaMasLejana || fecha > fechaMasLejana) {
      fechaMasLejana = fecha;
    }
  });

  if (!fechaMasLejana) return null;

  // Calcular el total de días de retraso
  let totalDiasRetraso = 0;
  tareas.forEach(tarea => {
    if (tarea.tipo === 'tarea') {
      const retraso = calcularRetraso(tarea, fechaHoy);
      totalDiasRetraso += retraso;
    }
  });

  // Ajustar la fecha con los retrasos usando días hábiles
  const fechaAjustada = agregarDiasHabiles(fechaMasLejana, totalDiasRetraso);

  // Formatear como YYYY-MM-DD
  const year = fechaAjustada.getFullYear();
  const month = String(fechaAjustada.getMonth() + 1).padStart(2, '0');
  const day = String(fechaAjustada.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Calcula el nivel de alerta del milestone basándose en la fecha límite (3/3/26)
 * @returns 'success' (verde), 'warning' (amarillo), 'danger' (rojo)
 */
export const calcularNivelAlerta = (fechaCalculada: string | null): { nivel: 'success' | 'warning' | 'danger', diasHabiles: number } => {
  if (!fechaCalculada) {
    return { nivel: 'success', diasHabiles: 0 };
  }

  const fechaLimite = new Date('2026-03-03T00:00:00');
  const fechaCalc = new Date(fechaCalculada + 'T00:00:00');

  // Si estamos en tiempo o antes
  if (fechaCalc <= fechaLimite) {
    return { nivel: 'success', diasHabiles: 0 };
  }

  // Calcular días hábiles de diferencia
  const diasHabilesRetraso = calcularDiasHabiles(fechaLimite, fechaCalc);

  // Determinar nivel de alerta
  if (diasHabilesRetraso <= 15) {
    return { nivel: 'warning', diasHabiles: diasHabilesRetraso };
  } else {
    return { nivel: 'danger', diasHabiles: diasHabilesRetraso };
  }
};
