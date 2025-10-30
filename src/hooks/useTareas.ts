import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import type { DragEndEvent } from '@dnd-kit/core';
import type { Tarea, TipoElemento } from '../types';
import { limpiarTareaYDependientes } from '../utils/dependencyUtils';
import { registrarCambioManual } from './usePropagacionRetrasos';

interface UseTareasProps {
  tareas: Tarea[];
  setTareas: (tareas: Tarea[]) => void;
  guardarEnFirebase: (tareas: Tarea[]) => Promise<void>;
}

export const useTareas = ({ tareas, setTareas, guardarEnFirebase }: UseTareasProps) => {
  // Estados para edición de nombre
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNombre, setEditandoNombre] = useState('');

  // Estados para formulario de nuevo item
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState<TipoElemento>('tarea');
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDuracion, setNuevaDuracion] = useState('5 días');
  const [nuevoInicio, setNuevoInicio] = useState('');
  const [nuevoFin, setNuevoFin] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<'Pendiente' | 'En Curso' | 'Finalizada' | 'Retrasada' | 'Por definir'>('Pendiente');
  const [nuevosComentarios, setNuevosComentarios] = useState('');
  const [nuevasDependencias, setNuevasDependencias] = useState<number[]>([]);

  // Estado para expansión de tareas
  const [tareaExpandida, setTareaExpandida] = useState<number | null>(null);

  const resetearFormulario = () => {
    setNuevoNombre('');
    setNuevaDuracion('5 días');
    setNuevoInicio('');
    setNuevoFin('');
    setNuevoEstado('Pendiente');
    setNuevosComentarios('');
    setNuevasDependencias([]);
    setNuevoTipo('tarea');
  };

  const actualizarTarea = async (id: number, campo: keyof Tarea, valor: Tarea[typeof campo]) => {
    const tareaActual = tareas.find(t => t.id === id);

    let nuevasTareas = tareas.map(tarea =>
      tarea.id === id ? { ...tarea, [campo]: valor } : tarea
    );

    // Si estamos cambiando el estado
    if (campo === 'estado' && tareaActual) {
      const estadoAnterior = tareaActual.estado;
      const estadoNuevo = valor as Tarea['estado'];

      // Registrar cambio manual para que la propagación automática lo respete
      registrarCambioManual(id);

      // Si la tarea estaba retrasada y ahora cambia a otro estado, limpiar dependientes
      if (estadoAnterior === 'Retrasada' && estadoNuevo !== 'Retrasada') {
        nuevasTareas = limpiarTareaYDependientes(id, nuevasTareas);
      }

      // Si el nuevo estado es "Por definir", limpiar fechas de esta tarea
      if (estadoNuevo === 'Por definir') {
        nuevasTareas = nuevasTareas.map(t => {
          if (t.id === id) {
            // Eliminar campos en lugar de undefined
            const { inicio, fin, ...tareaLimpia } = t;
            return tareaLimpia;
          }
          return t;
        });
      }
    }

    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
  };

  const agregarNuevoItem = async () => {
    const nuevoId = Math.max(...tareas.map(t => t.id), 0) + 1;
    let nuevoItem: Tarea;

    if (nuevoTipo === 'header') {
      nuevoItem = { id: nuevoId, tipo: 'header', nombre: nuevoNombre || 'Nuevo Equipo', info: '' };
    } else if (nuevoTipo === 'milestone') {
      nuevoItem = { id: nuevoId, tipo: 'milestone', nombre: nuevoNombre || 'Nuevo Milestone', fecha: nuevoInicio };
    } else {
      // Validar que el nombre no esté vacío
      if (!nuevoNombre.trim()) {
        alert('Por favor ingresa un nombre para la tarea');
        return;
      }

      nuevoItem = {
        id: nuevoId,
        tipo: 'tarea',
        nombre: nuevoNombre,
        duracion: nuevaDuracion,
        inicio: nuevoInicio,
        fin: nuevoFin,
        estado: nuevoEstado,
        comentarios: nuevosComentarios,
        dependencias: nuevasDependencias
      };
    }

    const nuevasTareas = [...tareas, nuevoItem];
    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
    setMostrarFormulario(false);
    resetearFormulario();
  };

  const eliminarItem = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
      const nuevasTareas = tareas.filter(t => t.id !== id);
      setTareas(nuevasTareas);
      await guardarEnFirebase(nuevasTareas);
    }
  };

  const guardarEdicion = async (id: number) => {
    const nuevasTareas = tareas.map(tarea =>
      tarea.id === id ? { ...tarea, nombre: editandoNombre } : tarea
    );
    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
    setEditandoId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tareas.findIndex((t) => t.id === active.id);
      const newIndex = tareas.findIndex((t) => t.id === over.id);

      const nuevasTareas = arrayMove(tareas, oldIndex, newIndex);
      setTareas(nuevasTareas);
      await guardarEnFirebase(nuevasTareas);
    }
  };

  const exportarJSON = () => {
    const dataStr = JSON.stringify(tareas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cronograma-backup.json';
    link.click();
  };

  const importarJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setTareas(data);
          await guardarEnFirebase(data);
        } catch (_error) {
          alert('Error al importar el archivo');
        }
      };
      reader.readAsText(file);
    }
  };

  return {
    // Estados de edición
    editandoId,
    setEditandoId,
    editandoNombre,
    setEditandoNombre,

    // Estados de formulario
    mostrarFormulario,
    setMostrarFormulario,
    nuevoTipo,
    setNuevoTipo,
    nuevoNombre,
    setNuevoNombre,
    nuevaDuracion,
    setNuevaDuracion,
    nuevoInicio,
    setNuevoInicio,
    nuevoFin,
    setNuevoFin,
    nuevoEstado,
    setNuevoEstado,
    nuevosComentarios,
    setNuevosComentarios,
    nuevasDependencias,
    setNuevasDependencias,

    // Estado de expansión
    tareaExpandida,
    setTareaExpandida,

    // Funciones
    resetearFormulario,
    actualizarTarea,
    agregarNuevoItem,
    eliminarItem,
    guardarEdicion,
    handleDragEnd,
    exportarJSON,
    importarJSON,
  };
};
