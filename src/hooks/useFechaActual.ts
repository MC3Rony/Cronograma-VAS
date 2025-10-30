import { useState, useEffect } from 'react';

export const useFechaActual = () => {
  const [fechaActual, setFechaActual] = useState(new Date());

  useEffect(() => {
    const obtenerFechaAPI = async () => {
      try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/America/Mexico_City');
        const data = await response.json();
        setFechaActual(new Date(data.datetime));
      } catch (_error) {
        setFechaActual(new Date());
      }
    };
    obtenerFechaAPI();
    const intervalo = setInterval(obtenerFechaAPI, 60000);
    return () => clearInterval(intervalo);
  }, []);

  return fechaActual;
};
