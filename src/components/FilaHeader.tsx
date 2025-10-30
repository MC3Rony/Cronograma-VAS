import React, { useState, useMemo } from 'react';
import { Save, Edit2, Trash2, Users, Calendar } from 'lucide-react';
import { FilaArrastrable } from './FilaArrastrable';
import { calcularDiasHeader } from '../utils/calculationUtils';
import type { Tarea } from '../types';

interface FilaHeaderProps {
  tarea: Tarea;
  tareas: Tarea[];
  editandoId: number | null;
  editandoNombre: string;
  setEditandoNombre: (nombre: string) => void;
  setEditandoId: (id: number | null) => void;
  guardarEdicion: (id: number) => void;
  eliminarItem: (id: number) => void;
}

export const FilaHeader = React.memo<FilaHeaderProps>(({
  tarea,
  tareas,
  editandoId,
  editandoNombre,
  setEditandoNombre,
  setEditandoId,
  guardarEdicion,
  eliminarItem,
}) => {
  const [mostrarAcciones, setMostrarAcciones] = useState(false);
  const diasCalculados = useMemo(() =>
    calcularDiasHeader(tareas, tarea.id),
    [tareas, tarea.id]
  );

  const handleDoubleClick = () => {
    setMostrarAcciones(!mostrarAcciones);
  };

  return (
    <FilaArrastrable id={tarea.id}>
      <td
        colSpan={mostrarAcciones ? 5 : 7}
        className="p-2 border border-gray-300 bg-blue-600 cursor-pointer select-none"
        onDoubleClick={handleDoubleClick}
      >
        {editandoId === tarea.id ? (
          <input
            type="text"
            value={editandoNombre}
            onChange={(e) => setEditandoNombre(e.target.value)}
            className="w-full bg-white text-gray-900 px-2 py-1 rounded border-2 border-blue-300 focus:border-blue-500 focus:outline-none font-semibold"
            onKeyPress={(e) => e.key === 'Enter' && guardarEdicion(tarea.id)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded">
                <Users size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-base">
                {tarea.nombre}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded-full">
              <Calendar size={14} className="text-white" />
              <span className="text-white font-semibold text-sm">
                {diasCalculados}
              </span>
            </div>
          </div>
        )}
      </td>
      {mostrarAcciones && (
        <td colSpan={2} className="p-2 bg-blue-600 border border-gray-300 text-center">
          <div className="flex gap-1.5 justify-center">
            {editandoId === tarea.id ? (
              <button
                onClick={() => guardarEdicion(tarea.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors duration-150"
                title="Guardar"
              >
                <Save size={14} />
              </button>
            ) : (
              <button
                onClick={() => { setEditandoId(tarea.id); setEditandoNombre(tarea.nombre); }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors duration-150"
                title="Editar"
              >
                <Edit2 size={14} />
              </button>
            )}
            <button
              onClick={() => eliminarItem(tarea.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors duration-150"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      )}
    </FilaArrastrable>
  );
});
