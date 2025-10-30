import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FilaHeader } from './FilaHeader';
import { FilaMilestone } from './FilaMilestone';
import { FilaTarea } from './FilaTarea';
import { calcularRetraso } from '../utils/calculationUtils';
import type { Tarea } from '../types';

interface TablaTareasProps {
  tareasFiltradas: Tarea[];
  tareas: Tarea[];
  fechaHoy: Date;
  editandoId: number | null;
  editandoNombre: string;
  setEditandoNombre: (nombre: string) => void;
  setEditandoId: (id: number | null) => void;
  tareaExpandida: number | null;
  setTareaExpandida: (id: number | null) => void;
  guardarEdicion: (id: number) => void;
  eliminarItem: (id: number) => void;
  actualizarTarea: (id: number, campo: keyof Tarea, valor: Tarea[keyof Tarea]) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const TablaTareas = React.memo<TablaTareasProps>(({
  tareasFiltradas,
  tareas,
  fechaHoy,
  editandoId,
  editandoNombre,
  setEditandoNombre,
  setEditandoId,
  tareaExpandida,
  setTareaExpandida,
  guardarEdicion,
  eliminarItem,
  actualizarTarea,
  handleDragEnd,
}) => {
  // useSensors debe estar en el nivel superior, NO dentro de useMemo
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Validación de seguridad sin return temprano
  const hayError = !Array.isArray(tareasFiltradas) || !Array.isArray(tareas);

  if (hayError) {
    console.error('TablaTareas: tareasFiltradas o tareas no son arrays válidos');
  }

  return hayError ? (
    <div className="bg-white shadow-lg rounded-b-lg p-8 text-center border border-gray-200">
      <p className="text-red-500">Error al cargar las tareas</p>
    </div>
  ) : (
    <div className="bg-white shadow-lg rounded-b-lg overflow-hidden border-x border-b border-gray-200">
      {/* Indicador de scroll en móviles */}
      <div className="md:hidden bg-blue-50 border-b border-blue-200 px-3 py-2 text-xs text-blue-700 text-center">
        ← Desliza horizontalmente para ver todas las columnas →
      </div>
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tareasFiltradas.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="w-full border-collapse text-sm min-w-[1000px]">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-2 md:p-3 text-left border-r border-gray-700 min-w-[200px] md:min-w-[250px] text-xs md:text-sm">Tarea / Equipo</th>
                  <th className="p-2 md:p-3 text-center border-r border-gray-700 w-[80px] md:w-[100px] text-xs md:text-sm">Duración</th>
                  <th className="p-2 md:p-3 text-center border-r border-gray-700 w-[100px] md:w-[140px] text-xs md:text-sm">Inicio</th>
                  <th className="p-2 md:p-3 text-center border-r border-gray-700 w-[100px] md:w-[140px] text-xs md:text-sm">Fin</th>
                  <th className="p-2 md:p-3 text-center border-r border-gray-700 w-[100px] md:w-[120px] text-xs md:text-sm">Estado</th>
                  <th className="p-2 md:p-3 text-center border-r border-gray-700 w-[70px] md:w-[80px] text-xs md:text-sm">Retraso</th>
                  <th className="p-2 md:p-3 text-center w-[100px] md:w-[120px] text-xs md:text-sm">Acciones</th>
                </tr>
              </thead>
            <tbody>
              {tareasFiltradas.map((tarea) => {
                if (tarea.tipo === 'header') {
                  return (
                    <FilaHeader
                      key={tarea.id}
                      tarea={tarea}
                      tareas={tareas}
                      editandoId={editandoId}
                      editandoNombre={editandoNombre}
                      setEditandoNombre={setEditandoNombre}
                      setEditandoId={setEditandoId}
                      guardarEdicion={guardarEdicion}
                      eliminarItem={eliminarItem}
                    />
                  );
                }

                if (tarea.tipo === 'milestone') {
                  return (
                    <FilaMilestone
                      key={tarea.id}
                      tarea={tarea}
                      tareas={tareas}
                      fechaHoy={fechaHoy}
                      editandoId={editandoId}
                      editandoNombre={editandoNombre}
                      setEditandoNombre={setEditandoNombre}
                      setEditandoId={setEditandoId}
                      guardarEdicion={guardarEdicion}
                      eliminarItem={eliminarItem}
                    />
                  );
                }

                const retraso = calcularRetraso(tarea, fechaHoy);
                const estaExpandida = tareaExpandida === tarea.id;

                return (
                  <FilaTarea
                    key={tarea.id}
                    tarea={tarea}
                    tareas={tareas}
                    retraso={retraso}
                    estaExpandida={estaExpandida}
                    editandoId={editandoId}
                    editandoNombre={editandoNombre}
                    setEditandoNombre={setEditandoNombre}
                    setEditandoId={setEditandoId}
                    setTareaExpandida={setTareaExpandida}
                    guardarEdicion={guardarEdicion}
                    eliminarItem={eliminarItem}
                    actualizarTarea={actualizarTarea}
                  />
                );
              })}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
      </div>
    </div>
  );
});
