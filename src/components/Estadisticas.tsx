import React, { useMemo } from 'react';
import type { Estadisticas as EstadisticasType, TipoEstado } from '../types';
import { calcularProgreso } from '../utils/calculationUtils';

interface EstadisticasProps {
  estadisticas: EstadisticasType;
  filtroEstado: TipoEstado;
  setFiltroEstado: (estado: TipoEstado) => void;
}

export const Estadisticas = React.memo<EstadisticasProps>(({ estadisticas, filtroEstado, setFiltroEstado }) => {
  const progreso = useMemo(() => calcularProgreso(estadisticas), [estadisticas]);

  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-3 md:p-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 mb-3 md:mb-4">
        <div
          onClick={() => setFiltroEstado('todos')}
          className={`p-2 md:p-4 rounded-lg text-center cursor-pointer transition-all active:scale-95 md:hover:scale-105 ${
            filtroEstado === 'todos'
              ? 'bg-blue-100 ring-2 ring-blue-600 shadow-lg'
              : 'bg-blue-50 hover:bg-blue-100'
          }`}
        >
          <div className="text-xl md:text-2xl font-bold text-blue-600">{estadisticas.total}</div>
          <div className="text-xs md:text-sm text-gray-600">Total</div>
        </div>
        <div
          onClick={() => setFiltroEstado('Finalizada')}
          className={`p-2 md:p-4 rounded-lg text-center cursor-pointer transition-all active:scale-95 md:hover:scale-105 ${
            filtroEstado === 'Finalizada'
              ? 'bg-green-100 ring-2 ring-green-600 shadow-lg'
              : 'bg-green-50 hover:bg-green-100'
          }`}
        >
          <div className="text-xl md:text-2xl font-bold text-green-600">{estadisticas.finalizadas}</div>
          <div className="text-xs md:text-sm text-gray-600">Finalizadas</div>
        </div>
        <div
          onClick={() => setFiltroEstado('En Curso')}
          className={`p-2 md:p-4 rounded-lg text-center cursor-pointer transition-all active:scale-95 md:hover:scale-105 ${
            filtroEstado === 'En Curso'
              ? 'bg-blue-100 ring-2 ring-blue-600 shadow-lg'
              : 'bg-blue-50 hover:bg-blue-100'
          }`}
        >
          <div className="text-xl md:text-2xl font-bold text-blue-600">{estadisticas.enCurso}</div>
          <div className="text-xs md:text-sm text-gray-600">En Curso</div>
        </div>
        <div
          onClick={() => setFiltroEstado('Retrasada')}
          className={`p-2 md:p-4 rounded-lg text-center cursor-pointer transition-all active:scale-95 md:hover:scale-105 ${
            filtroEstado === 'Retrasada'
              ? 'bg-red-100 ring-2 ring-red-600 shadow-lg'
              : 'bg-red-50 hover:bg-red-100'
          }`}
        >
          <div className="text-xl md:text-2xl font-bold text-red-600">{estadisticas.retrasadas}</div>
          <div className="text-xs md:text-sm text-gray-600">Retrasadas</div>
        </div>
        <div
          onClick={() => setFiltroEstado('Pendiente')}
          className={`p-2 md:p-4 rounded-lg text-center cursor-pointer transition-all active:scale-95 md:hover:scale-105 ${
            filtroEstado === 'Pendiente'
              ? 'bg-gray-100 ring-2 ring-gray-600 shadow-lg'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="text-xl md:text-2xl font-bold text-gray-600">{estadisticas.pendientes}</div>
          <div className="text-xs md:text-sm text-gray-600">Pendientes</div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-3 md:h-4">
        <div
          className="bg-gradient-to-r from-green-500 to-green-600 h-3 md:h-4 rounded-full transition-all duration-500"
          style={{ width: `${progreso}%` }}
        >
          <span className="flex items-center justify-center h-full text-xs font-bold text-white">
            {progreso}%
          </span>
        </div>
      </div>
    </div>
  );
});
