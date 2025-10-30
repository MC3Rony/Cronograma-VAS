import { useState, useEffect, useRef, useMemo, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Estadisticas } from './components/Estadisticas';
import { Controles } from './components/Controles';
import { useFechaActual } from './hooks/useFechaActual';
import { useFirebase } from './hooks/useFirebase';
import { useTareas } from './hooks/useTareas';
import { calcularEstadisticas } from './utils/calculationUtils';
import { propagarRetrasos, limpiarFechasPorDefinir } from './utils/dependencyUtils';
import type { TipoEstado } from './types';
import './App.css';

// Lazy loading de componentes grandes
const FormularioNuevoItem = lazy(() => import('./components/FormularioNuevoItem').then(module => ({ default: module.FormularioNuevoItem })));
const TablaTareas = lazy(() => import('./components/TablaTareas').then(module => ({ default: module.TablaTareas })));

const CronogramaProyecto: React.FC = () => {
  const fechaActual = useFechaActual();
  const { tareas, setTareas, cargando, mensaje, error, guardarEnFirebase } = useFirebase();

  const tareasManager = useTareas({ tareas, setTareas, guardarEnFirebase });

  const [filtroEstado, setFiltroEstado] = useState<TipoEstado>('todos');

  // TODO: Implementar propagación automática sin bucles infinitos
  // La propagación automática fue deshabilitada temporalmente porque causaba bucles infinitos con Firebase
  // Por ahora, la propagación de retrasos debe hacerse manualmente

  // Filtrar por estado (memoizado)
  const tareasFiltradas = useMemo(() => {
    try {
      if (filtroEstado === 'todos') return tareas;

      return tareas.filter((t) => {
        if (!t) return false; // Seguridad: verificar que t existe

        // Mantener headers y milestones para contexto
        if (t.tipo === 'header' || t.tipo === 'milestone') {
          // Verificar si hay tareas con ese estado bajo este header
          const indiceTarea = tareas.indexOf(t);
          for (let i = indiceTarea + 1; i < tareas.length; i++) {
            const tareaActual = tareas[i];
            if (!tareaActual) continue; // Seguridad: verificar que existe
            if (tareaActual.tipo === 'header') break;
            if (tareaActual.tipo === 'tarea' && tareaActual.estado === filtroEstado) {
              return true;
            }
          }
          return false;
        }

        // Para tareas normales, verificar el estado
        return t.tipo === 'tarea' && t.estado === filtroEstado;
      });
    } catch (error) {
      console.error('Error al filtrar tareas:', error);
      return tareas; // En caso de error, mostrar todas las tareas
    }
  }, [tareas, filtroEstado]);

  const estadisticas = useMemo(() => calcularEstadisticas(tareas), [tareas]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos desde Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <Header fechaActual={fechaActual} />
        <Estadisticas
          estadisticas={estadisticas}
          filtroEstado={filtroEstado}
          setFiltroEstado={setFiltroEstado}
        />
        <Controles
          mostrarFormulario={tareasManager.mostrarFormulario}
          setMostrarFormulario={tareasManager.setMostrarFormulario}
          mensaje={mensaje}
        />
        <Suspense fallback={<div className="text-center py-4">Cargando formulario...</div>}>
          <FormularioNuevoItem
            mostrarFormulario={tareasManager.mostrarFormulario}
            nuevoTipo={tareasManager.nuevoTipo}
            setNuevoTipo={tareasManager.setNuevoTipo}
            nuevoNombre={tareasManager.nuevoNombre}
            setNuevoNombre={tareasManager.setNuevoNombre}
            nuevaDuracion={tareasManager.nuevaDuracion}
            setNuevaDuracion={tareasManager.setNuevaDuracion}
            nuevoInicio={tareasManager.nuevoInicio}
            setNuevoInicio={tareasManager.setNuevoInicio}
            nuevoFin={tareasManager.nuevoFin}
            setNuevoFin={tareasManager.setNuevoFin}
            nuevoEstado={tareasManager.nuevoEstado}
            setNuevoEstado={tareasManager.setNuevoEstado}
            nuevosComentarios={tareasManager.nuevosComentarios}
            setNuevosComentarios={tareasManager.setNuevosComentarios}
            nuevasDependencias={tareasManager.nuevasDependencias}
            setNuevasDependencias={tareasManager.setNuevasDependencias}
            agregarNuevoItem={tareasManager.agregarNuevoItem}
            setMostrarFormulario={tareasManager.setMostrarFormulario}
            resetearFormulario={tareasManager.resetearFormulario}
            tareas={tareas}
          />
        </Suspense>
        <Suspense fallback={<div className="text-center py-4">Cargando tabla...</div>}>
          {tareasFiltradas.length === 0 && filtroEstado !== 'todos' ? (
            <div className="bg-white shadow-lg rounded-b-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500 text-lg">No hay tareas con el estado seleccionado</p>
              <button
                onClick={() => setFiltroEstado('todos')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Ver todas las tareas
              </button>
            </div>
          ) : (
            <TablaTareas
              tareasFiltradas={tareasFiltradas}
              tareas={tareas}
              fechaHoy={fechaActual}
              editandoId={tareasManager.editandoId}
              editandoNombre={tareasManager.editandoNombre}
              setEditandoNombre={tareasManager.setEditandoNombre}
              setEditandoId={tareasManager.setEditandoId}
              tareaExpandida={tareasManager.tareaExpandida}
              setTareaExpandida={tareasManager.setTareaExpandida}
              guardarEdicion={tareasManager.guardarEdicion}
              eliminarItem={tareasManager.eliminarItem}
              actualizarTarea={tareasManager.actualizarTarea}
              handleDragEnd={tareasManager.handleDragEnd}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default CronogramaProyecto;
