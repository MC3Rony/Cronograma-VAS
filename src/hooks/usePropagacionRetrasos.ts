import { useEffect, useRef, useCallback } from 'react';
import { propagarRetrasos, limpiarFechasPorDefinir } from '../utils/dependencyUtils';
import type { Tarea } from '../types';

interface UsePropagacionRetrasosProps {
  tareas: Tarea[];
  fechaActual: Date;
  cargando: boolean;
  setTareas: (tareas: Tarea[]) => void;
  guardarEnFirebase: (tareas: Tarea[]) => Promise<void>;
}

// Map global para rastrear cambios manuales recientes (ID tarea -> timestamp)
const cambiosManualesRecientes = new Map<number, number>();

/**
 * Hook personalizado para manejar la propagación automática de retrasos
 * sin causar bucles infinitos con Firebase
 */
export const usePropagacionRetrasos = ({
  tareas,
  fechaActual,
  cargando,
  setTareas,
  guardarEnFirebase
}: UsePropagacionRetrasosProps) => {
  // Refs para control de estado
  const propagandoRef = useRef(false);
  const ultimaPropagacionRef = useRef<string>('');
  const timeoutRef = useRef<number | null>(null);
  const ultimaFechaRef = useRef<string>(fechaActual.toISOString());

  // Función memoizada para propagar retrasos
  const aplicarPropagacion = useCallback(async () => {
    if (propagandoRef.current || cargando) {
      return;
    }

    propagandoRef.current = true;

    try {
      // Generar hash de las tareas actuales para comparación
      const tareasActualesHash = JSON.stringify(tareas);
      const fechaActualHash = fechaActual.toISOString();

      // Verificar si ya procesamos estas tareas con esta fecha
      const hashCompleto = `${tareasActualesHash}|${fechaActualHash}`;
      if (hashCompleto === ultimaPropagacionRef.current) {
        propagandoRef.current = false;
        return;
      }

      // Limpiar cambios manuales antiguos (más de 10 segundos)
      const ahora = Date.now();
      const DURACION_EXCEPCION = 10000; // 10 segundos
      for (const [id, timestamp] of cambiosManualesRecientes.entries()) {
        if (ahora - timestamp > DURACION_EXCEPCION) {
          cambiosManualesRecientes.delete(id);
        }
      }

      // Aplicar propagación de retrasos
      let tareasActualizadas = propagarRetrasos(tareas, fechaActual);

      // Restaurar estados de tareas con cambios manuales recientes
      tareasActualizadas = tareasActualizadas.map(tareaActualizada => {
        if (cambiosManualesRecientes.has(tareaActualizada.id)) {
          // Buscar el estado original (el que el usuario estableció)
          const tareaOriginal = tareas.find(t => t.id === tareaActualizada.id);
          if (tareaOriginal && tareaOriginal.estado !== tareaActualizada.estado) {
            // Mantener el estado que el usuario estableció manualmente
            return { ...tareaActualizada, estado: tareaOriginal.estado };
          }
        }
        return tareaActualizada;
      });

      // Limpiar fechas de tareas "Por definir"
      tareasActualizadas = limpiarFechasPorDefinir(tareasActualizadas);

      // Verificar si hubo cambios reales
      const tareasActualizadasHash = JSON.stringify(tareasActualizadas);
      const huboCambios = tareasActualesHash !== tareasActualizadasHash;

      if (huboCambios) {
        // Actualizar referencia antes de modificar estado
        ultimaPropagacionRef.current = hashCompleto;

        // Actualizar estado local
        setTareas(tareasActualizadas);

        // Guardar en Firebase (sin await para no bloquear)
        guardarEnFirebase(tareasActualizadas).catch(err => {
          console.error('Error al guardar después de propagación:', err);
        });
      } else {
        // No hubo cambios, solo actualizar referencia
        ultimaPropagacionRef.current = hashCompleto;
      }
    } finally {
      // Resetear flag después de un delay para permitir que Firebase se sincronice
      setTimeout(() => {
        propagandoRef.current = false;
      }, 1000);
    }
  }, [tareas, fechaActual, cargando, setTareas, guardarEnFirebase]);

  // Effect para detectar cambios y aplicar propagación con debounce
  useEffect(() => {
    if (cargando) return;

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Detectar si cambió la fecha (nueva día)
    const fechaActualStr = fechaActual.toISOString().split('T')[0];
    const cambioFecha = fechaActualStr !== ultimaFechaRef.current.split('T')[0];

    if (cambioFecha) {
      ultimaFechaRef.current = fechaActual.toISOString();
    }

    // Aplicar propagación con debounce
    // Si cambió la fecha, aplicar inmediatamente; si no, con delay
    const delay = cambioFecha ? 0 : 500;

    timeoutRef.current = window.setTimeout(() => {
      aplicarPropagacion();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [tareas, fechaActual, cargando, aplicarPropagacion]);

  // Retornar función para forzar propagación manual si es necesario
  return {
    forzarPropagacion: aplicarPropagacion
  };
};

/**
 * Registra un cambio manual en una tarea para que la propagación automática
 * lo respete durante los próximos 10 segundos
 */
export const registrarCambioManual = (tareaId: number) => {
  cambiosManualesRecientes.set(tareaId, Date.now());
};
