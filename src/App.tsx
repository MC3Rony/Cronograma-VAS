import React, { useState, useEffect } from 'react';
import { Calendar, Save, Download} from 'lucide-react';

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
  // Usar API de fecha/hora real con WorldTimeAPI
  const [fechaActual, setFechaActual] = useState(new Date());
  const fechaHoy = fechaActual;

  // Obtener fecha/hora desde API
  useEffect(() => {
    const obtenerFechaAPI = async () => {
      try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/America/Mexico_City');
        const data = await response.json();
        setFechaActual(new Date(data.datetime));
      } catch (error) {
        // Si falla la API, usar fecha del sistema
        console.log('Usando fecha del sistema');
        setFechaActual(new Date());
      }
    };

    obtenerFechaAPI();
    
    // Actualizar cada minuto
    const intervalo = setInterval(() => {
      obtenerFechaAPI();
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  const datosIniciales: Tarea[] = [
    { id: 1, tipo: 'header', nombre: 'EQUIPO FTS - Backend Recargas Recurrentes', info: '77 días: Lun 6/oct/25 - Mar 20/ene/26' },
    { id: 2, tipo: 'tarea', nombre: 'Definición diseño de contratos API', duracion: '10 días', inicio: '2025-10-06', fin: '2025-10-17', entrega: '', estado: 'Retrasada' },
    { id: 3, tipo: 'tarea', nombre: 'CRUD básico planes', duracion: '12 días', inicio: '2025-10-21', fin: '2025-11-05', entrega: '', estado: 'Pendiente' },
    { id: 4, tipo: 'tarea', nombre: 'Lógica encolado por umbral de saldo', duracion: '15 días', inicio: '2025-11-07', fin: '2025-11-27', entrega: '', estado: 'Pendiente' },
    { id: 5, tipo: 'tarea', nombre: 'Gestión de prioridades de tokens', duracion: '8 días', inicio: '2025-12-01', fin: '2025-12-10', entrega: '', estado: 'Pendiente' },
    { id: 6, tipo: 'tarea', nombre: 'Ejecución manual del plan', duracion: '15 días', inicio: '2025-12-12', fin: '2026-01-01', entrega: '', estado: 'Pendiente' },
    { id: 7, tipo: 'tarea', nombre: 'Listado de planes activos', duracion: '5 días', inicio: '2026-01-06', fin: '2026-01-12', entrega: '', estado: 'Pendiente' },
    { id: 8, tipo: 'tarea', nombre: 'Desarrollo de Autenticación de API', duracion: '5 días', inicio: '2026-01-14', fin: '2026-01-20', entrega: '', estado: 'Pendiente' },
    { id: 9, tipo: 'header', nombre: 'EQUIPO FTS/MS - Integración Pagos', info: '61 días: Lun 6/oct/25 - Lun 29/dic/25' },
    { id: 10, tipo: 'tarea', nombre: 'Cliente peticiones MS/manejo respuesta', duracion: '15 días', inicio: '2025-10-06', fin: '2025-10-24', entrega: '', estado: 'Retrasada' },
    { id: 11, tipo: 'tarea', nombre: 'Scheduler externo recargas agendadas', duracion: '12 días', inicio: '2025-10-28', fin: '2025-11-12', entrega: '', estado: 'Pendiente' },
    { id: 12, tipo: 'tarea', nombre: 'Worker de recargas por umbral', duracion: '15 días', inicio: '2025-11-14', fin: '2025-12-04', entrega: '', estado: 'Pendiente' },
    { id: 13, tipo: 'tarea', nombre: 'Recarga inmediata', duracion: '16 días', inicio: '2025-12-08', fin: '2025-12-29', entrega: '', estado: 'Pendiente' },
    { id: 14, tipo: 'header', nombre: 'EQUIPO FTS - Reportes y Extractos', info: '48 días: Lun 20/oct/25 - Mié 24/dic/25' },
    { id: 15, tipo: 'tarea', nombre: 'Consulta últimas transacciones con filtros', duracion: '6 días', inicio: '2025-10-20', fin: '2025-10-27', entrega: '', estado: 'Retrasada' },
    { id: 16, tipo: 'tarea', nombre: 'API de Solicitud asíncrona de extracto', duracion: '6 días', inicio: '2025-10-28', fin: '2025-11-04', entrega: '', estado: 'Pendiente' },
    { id: 17, tipo: 'tarea', nombre: 'Extractos (Worker) Generación PDF', duracion: '14 días', inicio: '2025-11-06', fin: '2025-11-25', entrega: '', estado: 'Pendiente' },
    { id: 18, tipo: 'tarea', nombre: 'Programa Frecuente: nivel y beneficios', duracion: '6 días', inicio: '2025-11-27', fin: '2025-12-04', entrega: '', estado: 'Pendiente' },
    { id: 19, tipo: 'tarea', nombre: 'Notificaciones Éxito/Fallo extracto', duracion: '6 días', inicio: '2025-12-05', fin: '2025-12-12', entrega: '', estado: 'Pendiente' },
    { id: 20, tipo: 'tarea', nombre: 'Dashboard y Trazabilidad completo', duracion: '7 días', inicio: '2025-12-16', fin: '2025-12-24', entrega: '', estado: 'Pendiente' },
    { id: 21, tipo: 'milestone', nombre: 'MILESTONE: Backend FTS Completado', fecha: 'Mar 30/dic/25' },
    { id: 22, tipo: 'header', nombre: 'EQUIPO AUMENTA - Infraestructura y Setup', info: '10 días: Jue 16/oct/25 - Mié 29/oct/25' },
    { id: 23, tipo: 'tarea', nombre: 'Hosting DEV', duracion: '1 día', inicio: '2025-10-16', fin: '2025-10-16', entrega: '', estado: 'Retrasada' },
    { id: 24, tipo: 'tarea', nombre: 'Instalación GIT + Cuentas desarrolladores', duracion: '1 día', inicio: '2025-10-17', fin: '2025-10-17', entrega: '', estado: 'Retrasada' },
    { id: 25, tipo: 'tarea', nombre: 'Instancias BD + Instancias Cómputo', duracion: '1 día', inicio: '2025-10-17', fin: '2025-10-17', entrega: '', estado: 'Retrasada' },
    { id: 26, tipo: 'tarea', nombre: 'Diseño base de datos', duracion: '2 días', inicio: '2025-10-20', fin: '2025-10-21', entrega: '', estado: 'Retrasada' },
    { id: 27, tipo: 'tarea', nombre: 'CRUD (Configuraciones)', duracion: '2 días', inicio: '2025-10-22', fin: '2025-10-23', entrega: '', estado: 'Pendiente' },
    { id: 28, tipo: 'tarea', nombre: 'Listas Generales', duracion: '2 días', inicio: '2025-10-24', fin: '2025-10-27', entrega: '', estado: 'Pendiente' },
    { id: 29, tipo: 'tarea', nombre: 'Usuarios + Roles', duracion: '2 días', inicio: '2025-10-28', fin: '2025-10-29', entrega: '', estado: 'Pendiente' },
    { id: 30, tipo: 'milestone', nombre: 'PRODUCCIÓN', fecha: 'Martes 3 de marzo de 2026' },
  ];

  const [tareas, setTareas] = useState<Tarea[]>(() => {
    const guardado = localStorage.getItem('cronograma-ts');
    return guardado ? JSON.parse(guardado) : datosIniciales;
  });

  const [mensaje, setMensaje] = useState('');
  const [filtroEquipo, setFiltroEquipo] = useState('Todos');
  const [tareaExpandida, setTareaExpandida] = useState<number | null>(null);

  // Actualizar fecha cada minuto para reflejar cambios de día
  useEffect(() => {
    const intervalo = setInterval(() => {
      setFechaActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    localStorage.setItem('cronograma-ts', JSON.stringify(tareas));
  }, [tareas]);

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
    // Si la tarea está finalizada, nunca hay retraso
    if (tarea.estado === 'Finalizada') return 0;
    
    const hoy = new Date(fechaHoy);
    hoy.setHours(0, 0, 0, 0);
    
    // CASO 1: Estado "Retrasada" - contar desde fecha de INICIO
    if (tarea.estado === 'Retrasada' && tarea.inicio) {
      const inicio = new Date(tarea.inicio + 'T00:00:00');
      const diffTime = hoy.getTime() - inicio.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    
    // CASO 2: Estado "En Curso" - solo mostrar retraso si pasó la fecha de entrega/fin
    if (tarea.estado === 'En Curso') {
      const fechaLimite = tarea.entrega || tarea.fin;
      if (!fechaLimite) return 0;
      
      const limite = new Date(fechaLimite + 'T00:00:00');
      const diffTime = hoy.getTime() - limite.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Solo mostrar retraso si ya pasó la fecha límite (día 15/11 si entrega era 14/11)
      return diffDays > 0 ? diffDays : 0;
    }
    
    // Otros estados (Pendiente, Por definir) no muestran retraso
    return 0;
  };

  const actualizarTarea = (id: number, campo: keyof Tarea, valor: any) => {
    setTareas(prevTareas => 
      prevTareas.map(tarea => 
        tarea.id === id ? { ...tarea, [campo]: valor } : tarea
      )
    );
  };

  const guardarCambios = () => {
    setMensaje('Cambios guardados exitosamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  const exportarJSON = () => {
    const dataStr = JSON.stringify(tareas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cronograma-proyecto.json';
    link.click();
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

  const equipos = ['Todos', 'EQUIPO FTS', 'EQUIPO AUMENTA', 'QA/DEPLOYMENT'];
  
  const tareasFiltradas = filtroEquipo === 'Todos' 
    ? tareas 
    : tareas.filter((t,) => {
        // Si es un header, verificar si coincide con el filtro
        if (t.tipo === 'header') {
          return t.nombre.includes(filtroEquipo);
        }
        // Si es una tarea o milestone, verificar si el header anterior coincide
        if (t.tipo === 'tarea' || t.tipo === 'milestone') {
          // Buscar el header más cercano hacia atrás
          for (let i = tareas.indexOf(t) - 1; i >= 0; i--) {
            if (tareas[i].tipo === 'header') {
              return tareas[i].nombre.includes(filtroEquipo);
            }
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

  // Calcular fecha de producción ajustada por retrasos
  const calcularFechaProduccion = (): { original: Date; ajustada: Date; diasRetraso: number } => {
    const fechaProduccionOriginal = new Date('2026-03-03');
    let totalDiasRetraso = 0;

    // Sumar todos los días de retraso de tareas no finalizadas
    tareas.forEach(tarea => {
      if (tarea.tipo === 'tarea' && tarea.estado !== 'Finalizada') {
        totalDiasRetraso += calcularRetraso(tarea);
      }
    });

    const fechaAjustada = new Date(fechaProduccionOriginal);
    fechaAjustada.setDate(fechaAjustada.getDate() + totalDiasRetraso);

    return {
      original: fechaProduccionOriginal,
      ajustada: fechaAjustada,
      diasRetraso: totalDiasRetraso
    };
  };

  const produccion = calcularFechaProduccion();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 rounded-t-lg shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={32} />
            <h1 className="text-3xl font-bold">Cronograma del Proyecto</h1>
          </div>
          <p className="text-blue-100">Fecha actual: <strong>{formatearFechaCompleta(fechaActual)}</strong></p>
        </div>

        {/* Estadísticas */}
        <div className="bg-white p-6 shadow-lg border-x border-gray-200">
          {produccion.diasRetraso === 0 && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-green-800">Producción en Tiempo</h3>
                  <p className="text-green-700 mt-1">
                    Fecha de producción: <strong>{formatearFechaCompleta(produccion.original)}</strong>
                  </p>
                  <p className="text-green-600 mt-2 text-sm">
                    No hay retrasos acumulados
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{estadisticas.total}</div>
              <div className="text-sm text-gray-600">Total Tareas</div>
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
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            >
              <span className="flex items-center justify-center h-full text-xs font-bold text-white">
                {progreso}%
              </span>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-white p-4 shadow-lg border-x border-gray-200 flex flex-wrap gap-3 items-center">
          <button 
            onClick={guardarCambios}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Save size={18} />
            Guardar
          </button>

          <button 
            onClick={exportarJSON}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            <Download size={18} />
            Exportar
          </button>

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
                <th className="p-3 text-center border border-gray-700 w-28">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareasFiltradas.map((tarea, index) => {
                if (tarea.tipo === 'header') {
                  return (
                    <tr key={tarea.id} className="bg-blue-600 text-white">
                      <td colSpan={8} className="p-3 font-bold border border-gray-300">
                        {tarea.nombre} {tarea.info && `(${tarea.info})`}
                      </td>
                    </tr>
                  );
                }

                if (tarea.tipo === 'milestone') {
                  // Si es el milestone de PRODUCCIÓN, mostrar fecha ajustada
                  const esMilestoneProduccion = tarea.nombre.includes('PRODUCCIÓN');
                  const fechaMostrar = esMilestoneProduccion 
                    ? formatearFechaCompleta(produccion.ajustada) + (produccion.diasRetraso > 0 ? ` (${produccion.diasRetraso} días de retraso)` : '')
                    : tarea.fecha;
                  
                  return (
                    <tr key={tarea.id} className={esMilestoneProduccion && produccion.diasRetraso > 0 ? "bg-red-500 text-white" : "bg-orange-500 text-white"}>
                      <td colSpan={8} className="p-3 font-bold border border-gray-300">
                        {tarea.nombre} - {fechaMostrar}
                      </td>
                    </tr>
                  );
                }

                const retraso = calcularRetraso(tarea);
                const bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                const estaExpandida = tareaExpandida === tarea.id;

                return (
                  <React.Fragment key={tarea.id}>
                    <tr className={`${bgColor} hover:bg-blue-50 transition-colors`}>
                      <td className="p-3 border border-gray-200 pl-8">{tarea.nombre}</td>
                      <td className="p-3 border border-gray-200 text-center text-xs">{tarea.duracion}</td>
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
                        <button
                          onClick={() => setTareaExpandida(estaExpandida ? null : tarea.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          {estaExpandida ? '▲ Cerrar' : '▼ Notas'}
                        </button>
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
                              Los comentarios se guardan automáticamente
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
