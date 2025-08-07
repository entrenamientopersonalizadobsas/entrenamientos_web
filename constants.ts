
export const WEEKS = Array.from({ length: 52 }, (_, i) => i + 1);
export const DAYS = [1, 2, 3];
export const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1); // [1, 2, ..., 12]
export const LOG_OPTIONS = Array.from({ length: 50 }, (_, i) => i + 1); // [1, 2, ..., 50]
export const SET_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1); // [1, 2, ..., 10]

export const WARMUP_EXERCISES: { [key: string]: string[] } = {
  Cervical: ['Rotaciones de cuello', 'Inclinaciones laterales', 'Flexión y extensión cervical'],
  Hombro: ['Círculos de brazos', 'Elevaciones frontales ligeras', 'Rotaciones cubanas'],
  Muñeca: ['Círculos de muñeca', 'Flexión y extensión de muñeca'],
  Cadera: ['Círculos de cadera', 'Balanceos de pierna', 'Puentes de glúteos'],
  Rodilla: ['Extensiones de rodilla sentado', 'Círculos de rodilla'],
  Tobillo: ['Círculos de tobillo', 'Dorsiflexión y flexión plantar'],
};

export const EXERCISE_DATA: { [key: string]: { [key: string]: string[] } } = {
  Espalda: {
    'Tracción Vertical': ['Dominadas', 'Jalón al Pecho', 'Dominadas Neutras'],
    'Tracción Horizontal': ['Remo con Barra', 'Remo con Mancuerna', 'Remo en Polea Baja'],
  },
  Pecho: {
    'Empuje Horizontal': ['Press de Banca', 'Press con Mancuernas', 'Flexiones'],
    'Empuje Inclinado': ['Press Inclinado con Barra', 'Press Inclinado con Mancuernas'],
  },
  Hombro: {
    'Empuje Vertical': ['Press Militar', 'Press Arnold', 'Push Press'],
    'Elevaciones Laterales': ['Elevaciones Laterales con Mancuerna', 'Elevaciones en Polea'],
  },
  Piernas: {
    'Dominante de Rodilla': ['Sentadillas', 'Zancadas', 'Prensa de Piernas'],
    'Dominante de Cadera': ['Peso Muerto Rumano', 'Hip Thrust', 'Buenos Días'],
  },
  Glúteos: {
    'Empuje de Cadera': ['Hip Thrust', 'Puente de Glúteos con Barra'],
    'Abducción': ['Patada de Glúteo en Polea', 'Abducción de Cadera en Máquina'],
  },
  Brazos: {
    'Bíceps': ['Curl con Barra', 'Curl con Mancuernas', 'Curl Martillo'],
    'Tríceps': ['Press Francés', 'Extensiones en Polea Alta', 'Fondos en Paralelas'],
  },
  Core: {
    'Anti-extensión': ['Plancha Abdominal', 'Rueda Abdominal'],
    'Anti-rotación': ['Press Pallof', 'Leñador en Polea'],
  },
};
