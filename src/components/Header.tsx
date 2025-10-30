import React from 'react';
import { Calendar } from 'lucide-react';
import { formatearFechaCompleta } from '../utils/dateUtils';

interface HeaderProps {
  fechaActual: Date;
}

export const Header = React.memo<HeaderProps>(({ fechaActual }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-3 md:p-6 rounded-t-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
            <Calendar size={24} className="md:w-8 md:h-8" />
            <h1 className="text-lg md:text-3xl font-bold">Cronograma del Proyecto</h1>
          </div>
          <p className="text-blue-100 text-xs md:text-base">
            Fecha: <strong className="block sm:inline">{formatearFechaCompleta(fechaActual)}</strong>
          </p>
        </div>
      </div>
    </div>
  );
});
