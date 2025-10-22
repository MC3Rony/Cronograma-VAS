import React, { useState, useEffect } from 'react';
import { Calendar, Save, Plus, Trash2, Edit2, Download, Upload } from 'lucide-react';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Tarea {
  id: number;
  tipo: 'header' | 'tarea' | 'milestone';
  nombre: string;
  duracion?: string;
  inicio?: string;
  fin?: string;
  entrega?: string;
  estado?: 'Pendiente' | 'En Curso' | 'Finalizada' | 'Retrasada' | 'Por definir';
  info?: string;
  fecha?: string;
  comentarios?: string;
}

// Componente para hacer las filas arrastrables
const FilaArrastrable: React.FC<{ id: number; children: React.ReactNode }> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  );
};

const CronogramaProyecto: React.FC = () => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const fechaHoy = fechaActual;

  const datosIniciales: Tarea[] = [
    { id: 1, tipo: 'header', nombre: 'EQUIPO FTS - Backend Recargas Recurrentes', info: '77 días' },
    { id: 2, tipo: 'tarea', nombre: 'Definición diseño de contratos API', duracion: '10 días', inicio: '2025-10-06', fin: '2025-10-17', entrega: '', estado: 'Retrasada', comentarios: '' },
  ];

  const [tareas, setTareas] = useState<Tarea[]>(datosIniciales);
  const [mensaje, setMensaje] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('Todos');
  const [tareaExpandida, setTareaExpandida] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editandoNombre, setEditandoNombre] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState<'header' | 'tarea' | 'milestone'>('tarea');
  const [cargando, setCargando] = useState(true);

  // Configurar sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Obtener fecha desde API
  useEffect(() => {
    const obtenerFechaAPI = async () => {
      try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/America/Mexico_City');
        const data = await response.json();
        setFechaActual(new Date(data.datetime));
      } catch (error) {
        setFechaActual(new Date());
      }
    };
    obtenerFechaAPI();
    const intervalo = setInterval(obtenerFechaAPI, 60000);
    return () => clearInterval(intervalo);
  }, []);

  // Cargar datos desde Firebase en tiempo real
  useEffect(() => {
    const docRef = doc(db, 'cronograma', 'tareas');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setTareas(docSnap.data().lista || datosIniciales);
      } else {
        // Si no existe, crear documento inicial
        setDoc(docRef, { lista: datosIniciales });
        setTareas(datosIniciales);
      }
      setCargando(false);
    }, (error) => {
      console.error('Error al cargar datos:', error);
      setTareas(datosIniciales);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Guardar en Firebase
  const guardarEnFirebase = async (nuevasTareas: Tarea[]) => {
    try {
      const docRef = doc(db, 'cronograma', 'tareas');
      await setDoc(docRef, { lista: nuevasTareas });
      setMensaje('Guardado en la nube');
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje('Error al guardar');
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const formatearFechaCompleta = (fecha: Date): string => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return '-';
    const d = new Date(fecha + 'T00:00:00');
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = meses[d.getMonth()];
    const anio = d.getFullYear().toString().substring(2);
    return `${dias[d.getDay()]} ${dia}/${mes}/${anio}`;
  };

  const calcularRetraso = (tarea: Tarea): number => {
    if (tarea.estado === 'Finalizada') return 0;
    const hoy = new Date(fechaHoy);
    hoy.setHours(0, 0, 0, 0);
    
    if (tarea.estado === 'Retrasada' && tarea.inicio) {
      const inicio = new Date(tarea.inicio + 'T00:00:00');
      const diffTime = hoy.getTime() - inicio.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    
    if (tarea.estado === 'En Curso') {
      const fechaLimite = tarea.entrega || tarea.fin;
      if (!fechaLimite) return 0;
      const limite = new Date(fechaLimite + 'T00:00:00');
      const diffTime = hoy.getTime() - limite.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const actualizarTarea = async (id: number, campo: keyof Tarea, valor: any) => {
    const nuevasTareas = tareas.map(tarea => 
      tarea.id === id ? { ...tarea, [campo]: valor } : tarea
    );
    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
  };

  const eliminarItem = async (id: number) => {
    const nuevasTareas = tareas.filter(tarea => tarea.id !== id);
    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
  };

  const agregarNuevoItem = async (tipo: 'header' | 'tarea' | 'milestone') => {
    const nuevoId = Math.max(...tareas.map(t => t.id), 0) + 1;
    let nuevoItem: Tarea;

    if (tipo === 'header') {
      nuevoItem = { id: nuevoId, tipo: 'header', nombre: 'Nuevo Equipo', info: '' };
    } else if (tipo === 'milestone') {
      nuevoItem = { id: nuevoId, tipo: 'milestone', nombre: 'Nuevo Milestone', fecha: '' };
    } else {
      nuevoItem = {
        id: nuevoId,
        tipo: 'tarea',
        nombre: 'Nueva Tarea',
        duracion: '',
        inicio: '',
        fin: '',
        entrega: '',
        estado: 'Pendiente',
        comentarios: ''
      };
    }

    const nuevasTareas = [...tareas, nuevoItem];
    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
    setMostrarFormulario(false);
  };

  const guardarEdicion = async (id: number) => {
    const nuevasTareas = tareas.map(tarea => 
      tarea.id === id ? { ...tarea, nombre: editandoNombre } : tarea
    );
    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
    setEditandoId(null);
    setEditandoNombre('');
  };

  const getColorEstado = (estado?: string) => {
    switch (estado) {
      case 'Finalizada': return '#27ae60';
      case 'En Curso': return '#3498db';
      case 'Retrasada': return '#e74c3c';
      case 'Por definir': return '#95a5a6';
      default: return '#f39c12';
    }
  };

  const exportarJSON = () => {
    const dataStr = JSON.stringify(tareas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cronograma_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importarJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const contenido = e.target?.result as string;
        const tareasImportadas = JSON.parse(contenido);
        setTareas(tareasImportadas);
        await guardarEnFirebase(tareasImportadas);
        setMensaje('Datos importados correctamente');
        setTimeout(() => setMensaje(''), 3000);
      } catch (error) {
        setMensaje('Error al importar archivo');
        setTimeout(() => setMensaje(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tareas.findIndex((tarea) => tarea.id === active.id);
    const newIndex = tareas.findIndex((tarea) => tarea.id === over.id);
    
    const nuevasTareas = arrayMove(tareas, oldIndex, newIndex);
    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
  };

  const tareasFiltradas = filtroEquipo === 'Todos' 
    ? tareas 
    : tareas.filter(t => {
        if (t.tipo === 'header') {
          return t.nombre.includes(filtroEquipo);
        }
        const headerAnterior = tareas.slice(0, tareas.indexOf(t)).reverse().find(h => h.tipo === 'header');
        return headerAnterior?.nombre.includes(filtroEquipo);
      });

  const equipos = ['Todos', ...Array.from(new Set(tareas.filter(t => t.tipo === 'header').map(t => t.nombre)))];

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-bold">Cargando cronograma...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Cronograma de Proyecto</h1>
                <p className="text-sm text-gray-600">{formatearFechaCompleta(fechaActual)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filtroEquipo}
                onChange={(e) => setFiltroEquipo(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                {equipos.map(equipo => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>
              <button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={20} />
                Agregar
              </button>
              <button
                onClick={exportarJSON}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Download size={20} />
                Exportar
              </button>
              <label className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer">
                <Upload size={20} />
                Importar
                <input type="file" accept=".json" onChange={importarJSON} className="hidden" />
              </label>
            </div>
          </div>

          {mensaje && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {mensaje}
            </div>
          )}

          {mostrarFormulario && (
            <div className="bg-blue-50 border border-blue-300 rounded p-4 mb-4">
              <h3 className="font-bold mb-2">Agregar nuevo elemento:</h3>
              <div className="flex gap-2">
                <select
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value as any)}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  <option value="header">Equipo (Header)</option>
                  <option value="tarea">Tarea</option>
                  <option value="milestone">Milestone</option>
                </select>
                <button
                  onClick={() => agregarNuevoItem(nuevoTipo)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Crear
                </button>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={tareasFiltradas.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="p-3 text-left border border-gray-600">Tarea / Equipo</th>
                    <th className="p-3 text-center border border-gray-600" style={{ width: '100px' }}>Duración</th>
                    <th className="p-3 text-center border border-gray-600" style={{ width: '150px' }}>Inicio</th>
                    <th className="p-3 text-center border border-gray-600" style={{ width: '150px' }}>Fin</th>
                    <th className="p-3 text-center border border-gray-600" style={{ width: '150px' }}>Entrega</th>
                    <th className="p-3 text-center border border-gray-600" style={{ width: '130px' }}>Estado</th>
                    <th className="p-3 text-center border border-gray-600" style={{ width: '80px' }}>Retraso</th>
                    <th className="p-3 text-center border border-gray-600" style={{ width: '120px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tareasFiltradas.map((tarea) => {
                    if (tarea.tipo === 'header') {
                      return (
                        <FilaArrastrable key={tarea.id} id={tarea.id}>
                          <td colSpan={6} className="p-3 font-bold bg-blue-600 text-white border border-gray-300">
                            {editandoId === tarea.id ? (
                              <input
                                type="text"
                                value={editandoNombre}
                                onChange={(e) => setEditandoNombre(e.target.value)}
                                className="w-full bg-white text-black px-2 py-1 rounded"
                                onKeyPress={(e) => e.key === 'Enter' && guardarEdicion(tarea.id)}
                              />
                            ) : (
                              <>{tarea.nombre} {tarea.info && `- ${tarea.info}`}</>
                            )}
                          </td>
                          <td colSpan={2} className="p-2 bg-blue-600 border border-gray-300 text-center">
                            {editandoId === tarea.id ? (
                              <button onClick={() => guardarEdicion(tarea.id)} className="bg-green-500 px-3 py-1 rounded mr-2">
                                <Save size={16} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => { setEditandoId(tarea.id); setEditandoNombre(tarea.nombre); }}
                                className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded mr-2"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => eliminarItem(tarea.id)}
                              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </FilaArrastrable>
                      );
                    }

                    if (tarea.tipo === 'milestone') {
                      const fechaMostrar = tarea.fecha 
                        ? formatearFecha(tarea.fecha)
                        : tarea.fecha;
                      
                      return (
                        <FilaArrastrable key={tarea.id} id={tarea.id}>
                          <td colSpan={6} className="p-3 font-bold border border-gray-300">
                            {editandoId === tarea.id ? (
                              <input
                                type="text"
                                value={editandoNombre}
                                onChange={(e) => setEditandoNombre(e.target.value)}
                                className="w-full bg-white text-black px-2 py-1 rounded"
                                onKeyPress={(e) => e.key === 'Enter' && guardarEdicion(tarea.id)}
                              />
                            ) : (
                              <>{tarea.nombre} - {fechaMostrar}</>
                            )}
                          </td>
                          <td colSpan={2} className="p-2 border border-gray-300 text-center">
                            {editandoId === tarea.id ? (
                              <button onClick={() => guardarEdicion(tarea.id)} className="bg-green-500 px-3 py-1 rounded mr-2">
                                <Save size={16} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => { setEditandoId(tarea.id); setEditandoNombre(tarea.nombre); }}
                                className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded mr-2"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => eliminarItem(tarea.id)}
                              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </FilaArrastrable>
                      );
                    }

                    const retraso = calcularRetraso(tarea);
                    const tareaIndex = tareas.findIndex(t => t.id === tarea.id);
                    const bgColor = tareaIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                    const estaExpandida = tareaExpandida === tarea.id;

                    return (
                      <React.Fragment key={tarea.id}>
                        <FilaArrastrable id={tarea.id}>
                          <td className={`p-3 border border-gray-200 pl-8 ${bgColor}`}>
                            {editandoId === tarea.id ? (
                              <input
                                type="text"
                                value={editandoNombre}
                                onChange={(e) => setEditandoNombre(e.target.value)}
                                className="w-full border border-gray-300 px-2 py-1 rounded"
                                onKeyPress={(e) => e.key === 'Enter' && guardarEdicion(tarea.id)}
                              />
                            ) : (
                              tarea.nombre
                            )}
                          </td>
                          <td className={`p-2 border border-gray-200 text-center ${bgColor}`}>
                            <input
                              type="text"
                              value={tarea.duracion || ''}
                              onChange={(e) => actualizarTarea(tarea.id, 'duracion', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-center"
                              placeholder="5 días"
                            />
                          </td>
                          <td className={`p-2 border border-gray-200 ${bgColor}`}>
                            <input 
                              type="date"
                              value={tarea.inicio || ''}
                              onChange={(e) => actualizarTarea(tarea.id, 'inicio', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            />
                            <div className="text-xs text-gray-600 mt-1">{formatearFecha(tarea.inicio)}</div>
                          </td>
                          <td className={`p-2 border border-gray-200 ${bgColor}`}>
                            <input 
                              type="date"
                              value={tarea.fin || ''}
                              onChange={(e) => actualizarTarea(tarea.id, 'fin', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            />
                            <div className="text-xs text-gray-600 mt-1">{formatearFecha(tarea.fin)}</div>
                          </td>
                          <td className={`p-2 border border-gray-200 ${bgColor}`}>
                            <input 
                              type="date"
                              value={tarea.entrega || ''}
                              onChange={(e) => actualizarTarea(tarea.id, 'entrega', e.target.value)}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            />
                            <div className="text-xs text-gray-600 mt-1">{formatearFecha(tarea.entrega)}</div>
                          </td>
                          <td className={`p-2 border border-gray-200 text-center ${bgColor}`}>
                            <select
                              value={tarea.estado}
                              onChange={(e) => actualizarTarea(tarea.id, 'estado', e.target.value as Tarea['estado'])}
                              style={{ backgroundColor: getColorEstado(tarea.estado) }}
                              className="w-full text-white font-bold rounded-full px-2 py-1 text-xs cursor-pointer"
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="En Curso">En Curso</option>
                              <option value="Finalizada">Finalizada</option>
                              <option value="Retrasada">Retrasada</option>
                              <option value="Por definir">Por definir</option>
                            </select>
                          </td>
                          <td className={`p-3 border border-gray-200 text-center font-bold text-sm ${bgColor}`} style={{ color: retraso > 0 ? '#e74c3c' : '#666' }}>
                            {retraso > 0 ? `${retraso} días` : '-'}
                          </td>
                          <td className={`p-2 border border-gray-200 text-center ${bgColor}`}>
                            <div className="flex gap-1 justify-center">
                              {editandoId === tarea.id ? (
                                <button
                                  onClick={() => guardarEdicion(tarea.id)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  <Save size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setEditandoId(tarea.id); setEditandoNombre(tarea.nombre); }}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                                >
                                  <Edit2 size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => setTareaExpandida(estaExpandida ? null : tarea.id)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                              >
                                {estaExpandida ? '▲' : '▼'}
                              </button>
                              <button
                                onClick={() => eliminarItem(tarea.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </FilaArrastrable>
                        {estaExpandida && (
                          <tr className={bgColor}>
                            <td colSpan={8} className="p-4 border border-gray-200 bg-yellow-50">
                              <div className="mb-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Comentarios / Notas:</label>
                                <textarea
                                  value={tarea.comentarios || ''}
                                  onChange={(e) => actualizarTarea(tarea.id, 'comentarios', e.target.value)}
                                  placeholder="Escribe comentarios, notas o detalles sobre esta tarea..."
                                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24 resize-none"
                                />
                              </div>
                              <div className="text-xs text-gray-600">
                                Los comentarios se guardan automáticamente en Firebase
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default CronogramaProyecto;