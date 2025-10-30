import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import type { Tarea } from '../types';

const datosIniciales: Tarea[] = [
  { id: 1, tipo: 'header', nombre: 'EQUIPO FTS - Backend Recargas Recurrentes', info: '77 días' },
  { id: 2, tipo: 'tarea', nombre: 'Definición diseño de contratos API', duracion: '10 días', inicio: '2025-10-06', fin: '2025-10-17', estado: 'Retrasada', comentarios: '' },
];

export const useFirebase = () => {
  const [tareas, setTareas] = useState<Tarea[]>(datosIniciales);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Referencia para evitar actualizaciones innecesarias
  const ultimasTareasRef = useRef<string>(JSON.stringify(datosIniciales));
  const guardandoRef = useRef(false);

  // Cargar datos desde Firebase en tiempo real
  useEffect(() => {
    const docRef = doc(db, 'cronograma', 'tareas');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data().lista;
          if (Array.isArray(data)) {
            // Solo actualizar si los datos son diferentes y no estamos guardando
            const dataString = JSON.stringify(data);
            if (dataString !== ultimasTareasRef.current && !guardandoRef.current) {
              ultimasTareasRef.current = dataString;
              setTareas(data);
              setError(null);
            }
          } else {
            throw new Error('Datos inválidos en Firebase');
          }
        } else {
          // Si no existe, crear documento inicial
          setDoc(docRef, { lista: datosIniciales }).catch((err) => {
            console.error('Error al crear documento inicial:', err);
            setError('Error al inicializar Firebase');
          });
          setTareas(datosIniciales);
        }
        setCargando(false);
      } catch (err) {
        console.error('Error al procesar datos:', err);
        setError('Error al cargar datos de Firebase');
        setTareas(datosIniciales);
        setCargando(false);
      }
    }, (err) => {
      console.error('Error al conectar con Firebase:', err);
      setError(`Error de conexión: ${err.message || 'No se pudo conectar a Firebase'}`);
      setTareas(datosIniciales);
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  // Guardar en Firebase
  const guardarEnFirebase = useCallback(async (nuevasTareas: Tarea[]) => {
    try {
      guardandoRef.current = true;
      const nuevasTareasString = JSON.stringify(nuevasTareas);

      // Solo guardar si realmente hay cambios
      if (nuevasTareasString === ultimasTareasRef.current) {
        guardandoRef.current = false;
        return;
      }

      ultimasTareasRef.current = nuevasTareasString;
      const docRef = doc(db, 'cronograma', 'tareas');
      await setDoc(docRef, { lista: nuevasTareas });
      setMensaje('Guardado en la nube');
      setError(null);
      setTimeout(() => setMensaje(''), 3000);

      // Esperar un poco antes de permitir nuevas actualizaciones desde Firebase
      setTimeout(() => {
        guardandoRef.current = false;
      }, 500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al guardar:', err);
      setError(`Error al guardar: ${errorMessage}`);
      setMensaje('Error al guardar');
      setTimeout(() => setMensaje(''), 5000);
      guardandoRef.current = false;
    }
  }, []);

  return { tareas, setTareas, cargando, mensaje, error, guardarEnFirebase };
};
