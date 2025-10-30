import React, { useMemo } from 'react';
import type { TipoElemento, Tarea } from '../types';
import { getColorEstado } from '../utils/colorUtils';
import { obtenerTareasDisponiblesParaDependencias } from '../utils/dependencyUtils';

interface FormularioNuevoItemProps {
  mostrarFormulario: boolean;
  nuevoTipo: TipoElemento;
  setNuevoTipo: (tipo: TipoElemento) => void;
  nuevoNombre: string;
  setNuevoNombre: (nombre: string) => void;
  nuevaDuracion: string;
  setNuevaDuracion: (duracion: string) => void;
  nuevoInicio: string;
  setNuevoInicio: (inicio: string) => void;
  nuevoFin: string;
  setNuevoFin: (fin: string) => void;
  nuevoEstado: 'Pendiente' | 'En Curso' | 'Finalizada' | 'Retrasada' | 'Por definir';
  setNuevoEstado: (estado: 'Pendiente' | 'En Curso' | 'Finalizada' | 'Retrasada' | 'Por definir') => void;
  nuevosComentarios: string;
  setNuevosComentarios: (comentarios: string) => void;
  nuevasDependencias: number[];
  setNuevasDependencias: (dependencias: number[]) => void;
  agregarNuevoItem: () => void;
  setMostrarFormulario: (mostrar: boolean) => void;
  resetearFormulario: () => void;
  tareas: Tarea[];
}

export const FormularioNuevoItem = React.memo<FormularioNuevoItemProps>(({
  mostrarFormulario,
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
  agregarNuevoItem,
  setMostrarFormulario,
  resetearFormulario,
  tareas,
}) => {
  if (!mostrarFormulario) return null;

  const tareasDisponibles = useMemo(() =>
    obtenerTareasDisponiblesParaDependencias(tareas),
    [tareas]
  );

  const toggleDependencia = (tareaId: number) => {
    if (nuevasDependencias.includes(tareaId)) {
      setNuevasDependencias(nuevasDependencias.filter(id => id !== tareaId));
    } else {
      setNuevasDependencias([...nuevasDependencias, tareaId]);
    }
  };

  return (
    <div className="bg-yellow-50 p-3 md:p-6 border-x border-gray-200 shadow-lg">
      <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Agregar nuevo elemento</h3>

      {/* Selector de tipo */}
      <div className="mb-3 md:mb-4">
        <label className="block text-xs md:text-sm font-semibold mb-2">Tipo de elemento:</label>
        <select
          value={nuevoTipo}
          onChange={(e) => setNuevoTipo(e.target.value as TipoElemento)}
          className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
        >
          <option value="tarea">Tarea</option>
          <option value="header">Encabezado de Equipo</option>
          <option value="milestone">Milestone</option>
        </select>
      </div>

      {/* Campos para Tarea */}
      {nuevoTipo === 'tarea' && (
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2">
              Nombre de la tarea: <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej: Implementar API de autenticación"
              className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2">Duración:</label>
              <input
                type="text"
                value={nuevaDuracion}
                onChange={(e) => setNuevaDuracion(e.target.value)}
                placeholder="Ej: 5 días"
                className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2">Estado:</label>
              <select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value as 'Pendiente' | 'En Curso' | 'Finalizada' | 'Retrasada' | 'Por definir')}
                className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
                style={{ backgroundColor: getColorEstado(nuevoEstado), color: 'white', fontWeight: 'bold' }}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Curso">En Curso</option>
                <option value="Finalizada">Finalizada</option>
                <option value="Retrasada">Retrasada</option>
                <option value="Por definir">Por definir</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2">Fecha Inicio:</label>
              <input
                type="date"
                value={nuevoInicio}
                onChange={(e) => setNuevoInicio(e.target.value)}
                className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2">Fecha Fin:</label>
              <input
                type="date"
                value={nuevoFin}
                onChange={(e) => setNuevoFin(e.target.value)}
                className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2">Comentarios (opcional):</label>
            <textarea
              value={nuevosComentarios}
              onChange={(e) => setNuevosComentarios(e.target.value)}
              placeholder="Agrega notas o detalles sobre esta tarea..."
              className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded h-20 resize-none text-sm md:text-base"
            />
          </div>

          {/* Selector de dependencias */}
          {tareasDisponibles.length > 0 && (
            <div>
              <label className="block text-xs md:text-sm font-semibold mb-2">Depende de estas tareas (opcional):</label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2 bg-white">
                {tareasDisponibles.map((tarea) => (
                  <label
                    key={tarea.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={nuevasDependencias.includes(tarea.id)}
                      onChange={() => toggleDependencia(tarea.id)}
                      className="cursor-pointer"
                    />
                    <span className="text-xs md:text-sm">{tarea.nombre}</span>
                  </label>
                ))}
              </div>
              {nuevasDependencias.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  {nuevasDependencias.length} dependencia(s) seleccionada(s)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Campos para Header */}
      {nuevoTipo === 'header' && (
        <div>
          <label className="block text-xs md:text-sm font-semibold mb-2">Nombre del Equipo:</label>
          <input
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            placeholder="Ej: EQUIPO DESARROLLO"
            className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
          />
        </div>
      )}

      {/* Campos para Milestone */}
      {nuevoTipo === 'milestone' && (
        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2">Nombre del Milestone:</label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Ej: Entrega Final"
              className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-semibold mb-2">Fecha:</label>
            <input
              type="date"
              value={nuevoInicio}
              onChange={(e) => setNuevoInicio(e.target.value)}
              className="w-full border border-gray-300 px-2 md:px-3 py-2 rounded text-sm md:text-base"
            />
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-6">
        <button
          onClick={agregarNuevoItem}
          className="flex-1 bg-green-600 active:bg-green-700 hover:bg-green-700 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold"
        >
          Crear {nuevoTipo === 'tarea' ? 'Tarea' : nuevoTipo === 'header' ? 'Equipo' : 'Milestone'}
        </button>
        <button
          onClick={() => {
            setMostrarFormulario(false);
            resetearFormulario();
          }}
          className="bg-gray-400 active:bg-gray-500 hover:bg-gray-500 text-white px-3 md:px-4 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
});
