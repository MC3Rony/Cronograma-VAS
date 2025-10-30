import React, { useState, useMemo, useCallback } from 'react';
import { Save, Edit2, Trash2 } from 'lucide-react';
import { FilaArrastrable } from './FilaArrastrable';
import { getColorEstado } from '../utils/colorUtils';
import { obtenerNombresDependencias, obtenerTareasDisponiblesParaDependencias } from '../utils/dependencyUtils';
import type { Tarea } from '../types';

interface FilaTareaProps {
  tarea: Tarea;
  tareas: Tarea[];
  retraso: number;
  estaExpandida: boolean;
  editandoId: number | null;
  editandoNombre: string;
  setEditandoNombre: (nombre: string) => void;
  setEditandoId: (id: number | null) => void;
  setTareaExpandida: (id: number | null) => void;
  guardarEdicion: (id: number) => void;
  eliminarItem: (id: number) => void;
  actualizarTarea: (id: number, campo: keyof Tarea, valor: Tarea[keyof Tarea]) => void;
}

export const FilaTarea = React.memo<FilaTareaProps>(({
  tarea,
  tareas,
  retraso,
  estaExpandida,
  editandoId,
  editandoNombre,
  setEditandoNombre,
  setEditandoId,
  setTareaExpandida,
  guardarEdicion,
  eliminarItem,
  actualizarTarea,
}) => {
  const [mostrarSelectorDep, setMostrarSelectorDep] = useState(false);

  const tareaIndex = useMemo(() =>
    tareas.findIndex(t => t.id === tarea.id),
    [tareas, tarea.id]
  );

  const bgColor = useMemo(() =>
    tareaIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white',
    [tareaIndex]
  );

  return (
    <React.Fragment>
      <FilaArrastrable id={tarea.id}>
        <td className="p-2 md:p-3 border border-gray-200 pl-4 md:pl-8">
          {editandoId === tarea.id ? (
            <input
              type="text"
              value={editandoNombre}
              onChange={(e) => setEditandoNombre(e.target.value)}
              className="w-full border border-gray-300 px-2 py-1 rounded text-xs md:text-sm"
              onKeyPress={(e) => e.key === 'Enter' && guardarEdicion(tarea.id)}
            />
          ) : (
            <span className="text-xs md:text-sm">{tarea.nombre}</span>
          )}
        </td>
        <td className="p-1 md:p-2 border border-gray-200 text-center">
          <input
            type="text"
            value={tarea.duracion || ''}
            onChange={(e) => actualizarTarea(tarea.id, 'duracion', e.target.value)}
            className="w-full border border-gray-300 rounded px-1 md:px-2 py-1 text-xs text-center"
            placeholder="5 días"
          />
        </td>
        <td className="p-1 md:p-2 border border-gray-200">
          <input
            type="date"
            value={tarea.inicio || ''}
            onChange={(e) => actualizarTarea(tarea.id, 'inicio', e.target.value)}
            className="w-full border border-gray-300 rounded px-1 md:px-2 py-1 text-xs"
          />
        </td>
        <td className="p-1 md:p-2 border border-gray-200">
          <input
            type="date"
            value={tarea.fin || ''}
            onChange={(e) => actualizarTarea(tarea.id, 'fin', e.target.value)}
            className="w-full border border-gray-300 rounded px-1 md:px-2 py-1 text-xs"
          />
        </td>
        <td className="p-1 md:p-2 border border-gray-200 text-center">
          <select
            value={tarea.estado}
            onChange={(e) => actualizarTarea(tarea.id, 'estado', e.target.value as Tarea['estado'])}
            style={{ backgroundColor: getColorEstado(tarea.estado) }}
            className="w-full text-white font-bold rounded-full px-1 md:px-2 py-1 text-xs cursor-pointer"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="En Curso">En Curso</option>
            <option value="Finalizada">Finalizada</option>
            <option value="Retrasada">Retrasada</option>
            <option value="Por definir">Por definir</option>
          </select>
        </td>
        <td className="p-2 md:p-3 border border-gray-200 text-center font-bold text-xs md:text-sm" style={{ color: retraso > 0 ? '#e74c3c' : '#666' }}>
          {retraso > 0 ? `${retraso}d` : '-'}
        </td>
        <td className="p-1 md:p-2 border border-gray-200 text-center">
          <div className="flex gap-0.5 md:gap-1 justify-center">
            {editandoId === tarea.id ? (
              <button
                onClick={() => guardarEdicion(tarea.id)}
                className="bg-green-500 active:bg-green-600 hover:bg-green-600 text-white px-1.5 md:px-2 py-1 rounded text-xs"
              >
                <Save size={12} className="md:w-3.5 md:h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => { setEditandoId(tarea.id); setEditandoNombre(tarea.nombre); }}
                className="bg-yellow-500 active:bg-yellow-600 hover:bg-yellow-600 text-white px-1.5 md:px-2 py-1 rounded text-xs"
              >
                <Edit2 size={12} className="md:w-3.5 md:h-3.5" />
              </button>
            )}
            <button
              onClick={() => setTareaExpandida(estaExpandida ? null : tarea.id)}
              className="bg-blue-500 active:bg-blue-600 hover:bg-blue-600 text-white px-1.5 md:px-2 py-1 rounded text-xs"
            >
              {estaExpandida ? '▲' : '▼'}
            </button>
            <button
              onClick={() => eliminarItem(tarea.id)}
              className="bg-red-500 active:bg-red-600 hover:bg-red-600 text-white px-1.5 md:px-2 py-1 rounded text-xs"
            >
              <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
            </button>
          </div>
        </td>
      </FilaArrastrable>
      {estaExpandida && (() => {
        const nombresDependencias = obtenerNombresDependencias(tarea, tareas);
        const tareasDisponibles = obtenerTareasDisponiblesParaDependencias(tareas, tarea.id);

        const toggleDependencia = (tareaId: number) => {
          const dependenciasActuales = tarea.dependencias || [];
          if (dependenciasActuales.includes(tareaId)) {
            actualizarTarea(tarea.id, 'dependencias', dependenciasActuales.filter(id => id !== tareaId));
          } else {
            actualizarTarea(tarea.id, 'dependencias', [...dependenciasActuales, tareaId]);
          }
        };

        return (
          <tr className={bgColor}>
            <td colSpan={7} className="p-3 md:p-4 border border-gray-200 bg-yellow-50">
              <div className="mb-2 md:mb-3">
                <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1">Comentarios / Notas:</label>
                <textarea
                  value={tarea.comentarios || ''}
                  onChange={(e) => actualizarTarea(tarea.id, 'comentarios', e.target.value)}
                  placeholder="Escribe comentarios, notas o detalles sobre esta tarea..."
                  className="w-full border border-gray-300 rounded px-2 md:px-3 py-2 text-xs md:text-sm h-20 md:h-24 resize-none"
                />
              </div>

              {/* Dependencias */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs md:text-sm font-bold text-gray-700">Dependencias:</label>
                  <button
                    onClick={() => setMostrarSelectorDep(!mostrarSelectorDep)}
                    className="text-xs bg-blue-500 active:bg-blue-600 hover:bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    {mostrarSelectorDep ? 'Cerrar' : 'Editar'}
                  </button>
                </div>

                {/* Mostrar dependencias actuales */}
                {nombresDependencias.length > 0 ? (
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-2">
                    {nombresDependencias.map((nombre, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                      >
                        🔗 <span className="hidden sm:inline">{nombre}</span>
                        <span className="sm:hidden">{nombre.length > 20 ? nombre.substring(0, 20) + '...' : nombre}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">Sin dependencias</p>
                )}

                {/* Selector de dependencias */}
                {mostrarSelectorDep && tareasDisponibles.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2 bg-white mt-2">
                    {tareasDisponibles.map((tareaDisp) => (
                      <label
                        key={tareaDisp.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={tarea.dependencias?.includes(tareaDisp.id) || false}
                          onChange={() => toggleDependencia(tareaDisp.id)}
                          className="cursor-pointer"
                        />
                        <span className="text-xs md:text-sm">{tareaDisp.nombre}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-600">
                Los cambios se guardan automáticamente
              </div>
            </td>
          </tr>
        );
      })()}
    </React.Fragment>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para evitar re-renders innecesarios
  return (
    prevProps.tarea.id === nextProps.tarea.id &&
    prevProps.tarea.nombre === nextProps.tarea.nombre &&
    prevProps.tarea.duracion === nextProps.tarea.duracion &&
    prevProps.tarea.inicio === nextProps.tarea.inicio &&
    prevProps.tarea.fin === nextProps.tarea.fin &&
    prevProps.tarea.estado === nextProps.tarea.estado &&
    prevProps.tarea.comentarios === nextProps.tarea.comentarios &&
    prevProps.retraso === nextProps.retraso &&
    prevProps.estaExpandida === nextProps.estaExpandida &&
    prevProps.editandoId === nextProps.editandoId &&
    prevProps.editandoNombre === nextProps.editandoNombre &&
    JSON.stringify(prevProps.tarea.dependencias) === JSON.stringify(nextProps.tarea.dependencias)
  );
});
