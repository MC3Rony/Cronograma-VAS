import React from 'react';
import { Plus } from 'lucide-react';

interface ControlesProps {
  mostrarFormulario: boolean;
  setMostrarFormulario: (mostrar: boolean) => void;
  mensaje: string;
}

export const Controles = React.memo<ControlesProps>(({
  mostrarFormulario,
  setMostrarFormulario,
  mensaje,
}) => {
  return (
    <div className="bg-white p-3 md:p-4 shadow-lg border-x border-gray-200 flex flex-wrap gap-2 md:gap-3 items-center justify-between">
      <button
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
        className="flex items-center gap-1 md:gap-2 bg-green-600 active:bg-green-700 hover:bg-green-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-colors w-full sm:w-auto justify-center"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Agregar Nuevo Item</span>
        <span className="sm:hidden">Agregar Item</span>
      </button>

      {mensaje && (
        <div className="bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-semibold animate-pulse w-full sm:w-auto text-center">
          {mensaje}
        </div>
      )}
    </div>
  );
});
