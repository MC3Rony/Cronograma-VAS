import React, { useMemo } from 'react';
import { Save, Edit2, Trash2, Calendar, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { FilaArrastrable } from './FilaArrastrable';
import { formatearFecha } from '../utils/dateUtils';
import { calcularFechaEntregaReal, calcularNivelAlerta } from '../utils/calculationUtils';
import type { Tarea } from '../types';

interface FilaMilestoneProps {
  tarea: Tarea;
  tareas: Tarea[];
  fechaHoy: Date;
  editandoId: number | null;
  editandoNombre: string;
  setEditandoNombre: (nombre: string) => void;
  setEditandoId: (id: number | null) => void;
  guardarEdicion: (id: number) => void;
  eliminarItem: (id: number) => void;
}

export const FilaMilestone = React.memo<FilaMilestoneProps>(({
  tarea,
  tareas,
  fechaHoy,
  editandoId,
  editandoNombre,
  setEditandoNombre,
  setEditandoId,
  guardarEdicion,
  eliminarItem,
}) => {
  // Calcular la fecha real de entrega del proyecto
  const fechaRealCalculada = useMemo(() =>
    calcularFechaEntregaReal(tareas, fechaHoy),
    [tareas, fechaHoy]
  );

  const fechaMostrar = useMemo(() =>
    fechaRealCalculada ? formatearFecha(fechaRealCalculada) : 'Sin fechas asignadas',
    [fechaRealCalculada]
  );

  // Calcular nivel de alerta
  const { nivel, diasHabiles } = useMemo(() =>
    calcularNivelAlerta(fechaRealCalculada),
    [fechaRealCalculada]
  );

  // Configurar colores y estilos según nivel de alerta
  const estilosAlerta = {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: CheckCircle,
      mensaje: 'En tiempo'
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      mensaje: `Alerta: +${diasHabiles} días hábiles`
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: AlertCircle,
      mensaje: `ALERTA MÁXIMA: +${diasHabiles} días hábiles`
    }
  };

  const estilo = estilosAlerta[nivel];
  const IconoAlerta = estilo.icon;

  return (
    <FilaArrastrable id={tarea.id}>
      <td colSpan={5} className="p-3 font-bold border border-gray-300 bg-purple-50">
        {editandoId === tarea.id ? (
          <input
            type="text"
            value={editandoNombre}
            onChange={(e) => setEditandoNombre(e.target.value)}
            className="w-full bg-white text-black px-2 py-1 rounded border-2 border-purple-300"
            onKeyPress={(e) => e.key === 'Enter' && guardarEdicion(tarea.id)}
          />
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-purple-600" />
              <span className="text-purple-900">{tarea.nombre}</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${estilo.bg} ${estilo.text}`}>
                <IconoAlerta size={16} />
                <span className="font-semibold">{fechaMostrar}</span>
              </div>
              {nivel !== 'success' && (
                <div className={`text-xs font-semibold ${estilo.text}`}>
                  {estilo.mensaje}
                </div>
              )}
            </div>
          </div>
        )}
      </td>
      <td colSpan={2} className="p-2 border border-gray-300 text-center bg-purple-50">
        <div className="flex gap-2 justify-center">
          {editandoId === tarea.id ? (
            <button
              onClick={() => guardarEdicion(tarea.id)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors"
              title="Guardar"
            >
              <Save size={16} />
            </button>
          ) : (
            <button
              onClick={() => { setEditandoId(tarea.id); setEditandoNombre(tarea.nombre); }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
          )}
          <button
            onClick={() => eliminarItem(tarea.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </FilaArrastrable>
  );
});
