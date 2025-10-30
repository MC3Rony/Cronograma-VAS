import type { Tarea } from '../types';

/**
 * Verifica si una tarea debe estar retrasada debido a sus dependencias
 */
export const debeEstarRetrasadaPorDependencias = (
  tarea: Tarea,
  tareas: Tarea[],
  fechaHoy: Date
): boolean => {
  // Si no tiene dependencias, no se afecta
  if (!tarea.dependencias || tarea.dependencias.length === 0) {
    return false;
  }

  // Si ya está finalizada, no se modifica
  if (tarea.estado === 'Finalizada') {
    return false;
  }

  // Verificar cada dependencia
  for (const depId of tarea.dependencias) {
    const tareaDepende = tareas.find(t => t.id === depId);

    if (!tareaDepende) continue;

    // Si la tarea de la que depende está retrasada, esta también debe estarlo
    if (tareaDepende.estado === 'Retrasada') {
      return true;
    }

    // Si la tarea de la que depende no está finalizada y ya pasó su fecha de entrega
    if (tareaDepende.estado !== 'Finalizada' && tareaDepende.fin) {
      const fechaFin = new Date(tareaDepende.fin + 'T00:00:00');
      const hoy = new Date(fechaHoy);
      hoy.setHours(0, 0, 0, 0);

      if (hoy > fechaFin) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Propaga automáticamente los retrasos a tareas dependientes
 */
export const propagarRetrasos = (tareas: Tarea[], fechaHoy: Date): Tarea[] => {
  const tareasActualizadas = [...tareas];
  let huboCambios = true;
  let iteraciones = 0;
  const maxIteraciones = 10; // Evitar loops infinitos

  // Iterar hasta que no haya más cambios o se alcance el límite
  while (huboCambios && iteraciones < maxIteraciones) {
    huboCambios = false;
    iteraciones++;

    tareasActualizadas.forEach((tarea, index) => {
      if (tarea.tipo !== 'tarea') return;

      const debeRetrasarse = debeEstarRetrasadaPorDependencias(
        tarea,
        tareasActualizadas,
        fechaHoy
      );

      // Si debe estar retrasada pero no lo está, actualizar
      if (debeRetrasarse && tarea.estado !== 'Retrasada' && tarea.estado !== 'Finalizada') {
        tareasActualizadas[index] = {
          ...tarea,
          estado: 'Retrasada'
        };
        huboCambios = true;
      }
    });
  }

  return tareasActualizadas;
};

/**
 * Obtiene los nombres de las tareas de las que depende una tarea
 */
export const obtenerNombresDependencias = (
  tarea: Tarea,
  tareas: Tarea[]
): string[] => {
  if (!tarea.dependencias || tarea.dependencias.length === 0) {
    return [];
  }

  return tarea.dependencias
    .map(depId => {
      const tareaDepende = tareas.find(t => t.id === depId);
      return tareaDepende ? tareaDepende.nombre : null;
    })
    .filter((nombre): nombre is string => nombre !== null);
};

/**
 * Obtiene las tareas que pueden ser dependencias (solo tareas, no headers ni milestones)
 */
export const obtenerTareasDisponiblesParaDependencias = (
  tareas: Tarea[],
  tareaActualId?: number
): Tarea[] => {
  return tareas.filter(t =>
    t.tipo === 'tarea' &&
    t.id !== tareaActualId // No puede depender de sí misma
  );
};

/**
 * Verifica si agregar una dependencia crearía una dependencia circular
 */
export const crearíaDependenciaCircular = (
  tareaId: number,
  nuevaDependenciaId: number,
  tareas: Tarea[]
): boolean => {
  const visitados = new Set<number>();

  const verificarCirculo = (idActual: number): boolean => {
    if (idActual === tareaId) return true;
    if (visitados.has(idActual)) return false;

    visitados.add(idActual);

    const tareaActual = tareas.find(t => t.id === idActual);
    if (!tareaActual || !tareaActual.dependencias) return false;

    return tareaActual.dependencias.some(depId => verificarCirculo(depId));
  };

  return verificarCirculo(nuevaDependenciaId);
};

/**
 * Obtiene todas las tareas que dependen de una tarea específica
 */
export const obtenerTareasDependientes = (
  tareaId: number,
  tareas: Tarea[]
): Tarea[] => {
  return tareas.filter(t =>
    t.tipo === 'tarea' &&
    t.dependencias &&
    t.dependencias.includes(tareaId)
  );
};

/**
 * Limpia solo las tareas dependientes (NO la tarea principal)
 */
export const limpiarTareaYDependientes = (
  tareaId: number,
  tareas: Tarea[]
): Tarea[] => {
  const tareasActualizadas = [...tareas];
  const visitados = new Set<number>();

  const limpiarRecursivo = (id: number, esPrincipal: boolean = false) => {
    if (visitados.has(id)) return;
    visitados.add(id);

    // Encontrar la tarea actual
    const index = tareasActualizadas.findIndex(t => t.id === id);
    if (index === -1) return;

    const tarea = tareasActualizadas[index];
    if (tarea.tipo !== 'tarea') return;

    // Solo limpiar si NO es la tarea principal (la que el usuario está cambiando)
    if (!esPrincipal) {
      // Limpiar la tarea (eliminar campos en lugar de undefined)
      const { inicio, fin, ...tareaLimpia } = tarea;
      tareasActualizadas[index] = {
        ...tareaLimpia,
        estado: 'Por definir'
      };
    }

    // Limpiar recursivamente las tareas dependientes
    const dependientes = obtenerTareasDependientes(id, tareasActualizadas);
    dependientes.forEach(dep => limpiarRecursivo(dep.id, false));
  };

  // Iniciar con esPrincipal = true para no limpiar la tarea que el usuario está modificando
  limpiarRecursivo(tareaId, true);
  return tareasActualizadas;
};

/**
 * Limpia fechas de tareas en estado "Por definir"
 */
export const limpiarFechasPorDefinir = (tareas: Tarea[]): Tarea[] => {
  return tareas.map(tarea => {
    if (tarea.tipo === 'tarea' && tarea.estado === 'Por definir') {
      // Eliminar campos en lugar de undefined
      const { inicio, fin, ...tareaLimpia } = tarea;
      return tareaLimpia;
    }
    return tarea;
  });
};
