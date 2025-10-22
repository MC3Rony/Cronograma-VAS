import React, { useState, useEffect } from 'react';
import { Calendar, Save, Plus, Trash2, Edit2, Download, Upload } from 'lucide-react';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
    const anio = d.getFullYear().toString().substr(2);
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

  const agregarNuevoItem = async () => {
    const nuevoId = Math.max(...tareas.map(t => t.id), 0) + 1;
    let nuevoItem: Tarea;

    if (nuevoTipo === 'header') {
      nuevoItem = { id: nuevoId, tipo: 'header', nombre: 'Nuevo Equipo', info: '' };
    } else if (nuevoTipo === 'milestone') {
      nuevoItem = { id: nuevoId, tipo: 'milestone', nombre: 'Nuevo Milestone', fecha: '' };
    } else {
      nuevoItem = {
        id: nuevoId,
        tipo: 'tarea',
        nombre: 'Nueva Tarea',
        duracion: '5 días',
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

  const eliminarItem = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este elemento?')) {
      const nuevasTareas = tareas.filter(t => t.id !== id);
      setTareas(nuevasTareas);
      await guardarEnFirebase(nuevasTareas);
    }
  };

  const guardarEdicion = async (id: number) => {
    const nuevasTareas = tareas.map(tarea =>
      tarea.id === id ? { ...tarea, nombre: editandoNombre } : tarea
    );
    setTareas(nuevasTareas);
    await guardarEnFirebase(nuevasTareas);
    setEditandoId(null);
  };

  const exportarJSON = () => {
    const dataStr = JSON.stringify(tareas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cronograma-backup.json';
    link.click();
  };

  const importarJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          setTareas(data);
          await guardarEnFirebase(data);
          setMensaje('✓ Datos importados');
          setTimeout(() => setMensaje(''), 3000);
        } catch (error) {
          alert('Error al importar el archivo');
        }
      };
      reader.readAsText(file);
    }
  };

  const getColorEstado = (estado?: string): string => {
    const colores: Record<string, string> = {
      'Pendiente': '#95a5a6',
      'En Curso': '#3498db',
      'Finalizada': '#27ae60',
      'Retrasada': '#e74c3c',
      'Por definir': '#f39c12'
    };
    return colores[estado || 'Pendiente'] || '#95a5a6';
  };

  const calcularFechaProduccion = (): { original: Date; ajustada: Date; diasRetraso: number } => {
    const fechaProduccionOriginal = new Date('2026-03-03');
    let totalDiasRetraso = 0;
    tareas.forEach(tarea => {
      if (tarea.tipo === 'tarea' && tarea.estado !== 'Finalizada') {
        totalDiasRetraso += calcularRetraso(tarea);
      }
    });
    const fechaAjustada = new Date(fechaProduccionOriginal);
    fechaAjustada.setDate(fechaAjustada.getDate() + totalDiasRetraso);
    return { original: fechaProduccionOriginal, ajustada: fechaAjustada, diasRetraso: totalDiasRetraso };
  };

  const produccion = calcularFechaProduccion();

  const equipos = ['Todos', 'EQUIPO FTS', 'EQUIPO AUMENTA', 'QA/DEPLOYMENT','MS/FTS'];
  
  const tareasFiltradas = filtroEquipo === 'Todos' 
    ? tareas 
    : tareas.filter((t) => {
        if (t.tipo === 'header') return t.nombre.includes(filtroEquipo);
        if (t.tipo === 'tarea' || t.tipo === 'milestone') {
          for (let i = tareas.indexOf(t) - 1; i >= 0; i--) {
            if (tareas[i].tipo === 'header') return tareas[i].nombre.includes(filtroEquipo);
          }
        }
        return false;
      });

  const estadisticas = {
    total: tareas.filter(t => t.tipo === 'tarea').length,
    finalizadas: tareas.filter(t => t.tipo === 'tarea' && t.estado === 'Finalizada').length,
    enCurso: tareas.filter(t => t.tipo === 'tarea' && t.estado === 'En Curso').length,
    retrasadas: tareas.filter(t => t.tipo === 'tarea' && t.estado === 'Retrasada').length,
    pendientes: tareas.filter(t => t.tipo === 'tarea' && t.estado === 'Pendiente').length,
  };

  const progreso = Math.round((estadisticas.finalizadas / estadisticas.total) * 100) || 0;

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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={32} />
                <h1 className="text-3xl font-bold">Cronograma del Proyecto</h1>
              </div>
              <p className="text-blue-100">Fecha actual: <strong>{formatearFechaCompleta(fechaActual)}</strong></p>
              <p className="text-blue-200 text-sm mt-1">Sincronizado con Firebase</p>
            </div>
          </div>
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{estadisticas.finalizadas}</div>
              <div className="text-sm text-gray-600">Finalizadas</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.enCurso}</div>
              <div className="text-sm text-gray-600">En Curso</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{estadisticas.retrasadas}</div>
              <div className="text-sm text-gray-600">Retrasadas</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">{estadisticas.pendientes}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            >
              <span className="flex items-center justify-center h-full text-xs font-bold text-white"> {progreso}%</span>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white p-4 shadow-lg border-x border-gray-200 flex flex-wrap gap-3 items-center">
          <button 
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            <Plus size={18} />
            Agregar
          </button>

          <button 
            onClick={exportarJSON}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            <Download size={18} />
            Exportar
          </button>

          <label className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer">
            <Upload size={18} />
            Importar
            <input type="file" accept=".json" onChange={importarJSON} className="hidden" />
          </label>

          <select 
            value={filtroEquipo}
            onChange={(e) => setFiltroEquipo(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg font-semibold"
          >
            {equipos.map(equipo => (
              <option key={equipo} value={equipo}>{equipo}</option>
            ))}
          </select>

          {mensaje && (
            <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold animate-pulse">
              {mensaje}
            </div>
          )}
        </div>

        {/* Formulario agregar */}
        {mostrarFormulario && (
          <div className="bg-yellow-50 p-4 border-x border-gray-200 shadow-lg">
            <h3 className="font-bold mb-3">Agregar nuevo elemento:</h3>
            <div className="flex gap-3">
              <select 
                value={nuevoTipo}
                onChange={(e) => setNuevoTipo(e.target.value as any)}
                className="border border-gray-300 px-3 py-2 rounded"
              >
                <option value="tarea">Tarea</option>
                <option value="header">Encabezado</option>
                <option value="milestone">Milestone</option>
              </select>
              <button 
                onClick={agregarNuevoItem}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
              >
                Crear
              </button>
              <button 
                onClick={() => setMostrarFormulario(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-b-lg shadow-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 text-left border border-gray-700">Tarea</th>
                <th className="p-3 text-center border border-gray-700 w-20">Duración</th>
                <th className="p-3 text-left border border-gray-700 w-36">Inicio</th>
                <th className="p-3 text-left border border-gray-700 w-36">Fin</th>
                <th className="p-3 text-left border border-gray-700 w-36">Entrega</th>
                <th className="p-3 text-center border border-gray-700 w-32">Estado</th>
                <th className="p-3 text-center border border-gray-700 w-24">Retraso</th>
                <th className="p-3 text-center border border-gray-700 w-32">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareasFiltradas.map((tarea) => {
                if (tarea.tipo === 'header') {
                  return (
                    <tr key={tarea.id} className="bg-blue-600 text-white">
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
                          <>{tarea.nombre} {tarea.info && `(${tarea.info})`}</>
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
                    </tr>
                  );
                }

                if (tarea.tipo === 'milestone') {
                  const esMilestoneProduccion = tarea.nombre.includes('PRODUCCIÓN');
                  const fechaMostrar = esMilestoneProduccion 
                    ? formatearFechaCompleta(produccion.ajustada) + (produccion.diasRetraso > 0 ? ` (${produccion.diasRetraso} días de retraso)` : '')
                    : tarea.fecha;
                  
                  return (
                    <tr key={tarea.id} className={esMilestoneProduccion && produccion.diasRetraso > 0 ? "bg-red-500 text-white" : "bg-orange-500 text-white"}>
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
                    </tr>
                  );
                }

                const retraso = calcularRetraso(tarea);
                const tareaIndex = tareas.findIndex(t => t.id === tarea.id);
                const bgColor = tareaIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                const estaExpandida = tareaExpandida === tarea.id;

                return (
                  <React.Fragment key={tarea.id}>
                    <tr className={`${bgColor} hover:bg-blue-50 transition-colors`}>
                      <td className="p-3 border border-gray-200 pl-8">
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
                      <td className="p-2 border border-gray-200 text-center">
                        <input
                          type="text"
                          value={tarea.duracion || ''}
                          onChange={(e) => actualizarTarea(tarea.id, 'duracion', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs text-center"
                          placeholder="5 días"
                        />
                      </td>
                      <td className="p-2 border border-gray-200">
                        <input 
                          type="date"
                          value={tarea.inicio || ''}
                          onChange={(e) => actualizarTarea(tarea.id, 'inicio', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                        />
                        <div className="text-xs text-gray-600 mt-1">{formatearFecha(tarea.inicio)}</div>
                      </td>
                      <td className="p-2 border border-gray-200">
                        <input 
                          type="date"
                          value={tarea.fin || ''}
                          onChange={(e) => actualizarTarea(tarea.id, 'fin', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                        />
                        <div className="text-xs text-gray-600 mt-1">{formatearFecha(tarea.fin)}</div>
                      </td>
                      <td className="p-2 border border-gray-200">
                        <input 
                          type="date"
                          value={tarea.entrega || ''}
                          onChange={(e) => actualizarTarea(tarea.id, 'entrega', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                        />
                        <div className="text-xs text-gray-600 mt-1">{formatearFecha(tarea.entrega)}</div>
                      </td>
                      <td className="p-2 border border-gray-200 text-center">
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
                      <td className="p-3 border border-gray-200 text-center font-bold text-sm" style={{ color: retraso > 0 ? '#e74c3c' : '#666' }}>
                        {retraso > 0 ? `${retraso} días` : '-'}
                      </td>
                      <td className="p-2 border border-gray-200 text-center">
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
                    </tr>
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
        </div>
      </div>
    </div>
  );
};

export default CronogramaProyecto;