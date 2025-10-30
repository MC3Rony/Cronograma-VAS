export interface Tarea {
  id: number;
  tipo: 'header' | 'tarea' | 'milestone';
  nombre: string;
  duracion?: string;
  inicio?: string;
  fin?: string;
  estado?: 'Pendiente' | 'En Curso' | 'Finalizada' | 'Retrasada' | 'Por definir';
  info?: string;
  fecha?: string;
  comentarios?: string;
  dependencias?: number[]; // IDs de tareas de las que depende
}

export interface Estadisticas {
  total: number;
  finalizadas: number;
  enCurso: number;
  retrasadas: number;
  pendientes: number;
}

export interface FechaProduccion {
  original: Date;
  ajustada: Date;
  diasRetraso: number;
}

export type TipoEstado = 'todos' | 'En Curso' | 'Pendiente' | 'Retrasada' | 'Finalizada';
export type TipoElemento = 'header' | 'tarea' | 'milestone';

// Tipo para valores de actualización de tareas
export type TareaValor = string | number | number[] | Tarea['tipo'] | Tarea['estado'] | undefined;
