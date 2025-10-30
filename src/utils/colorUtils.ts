export const getColorEstado = (estado?: string): string => {
  const colores: Record<string, string> = {
    'Pendiente': '#95a5a6',
    'En Curso': '#3498db',
    'Finalizada': '#27ae60',
    'Retrasada': '#e74c3c',
    'Por definir': '#f39c12'
  };
  return colores[estado || 'Pendiente'] || '#95a5a6';
};
