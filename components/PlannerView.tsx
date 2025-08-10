import React, { useState, useMemo, useEffect } from 'react';
import type { DailyPlan, PlannedExercise, PlannedWarmup, WorkoutPlan, CheckinData, CheckinQuality, MonthlyGoals, WeeklyGoals, ExerciseList, MainExerciseData } from '../types';
import { WEEKS, DAYS, WARMUP_EXERCISES, EXERCISE_DATA } from '../constants';
import { PlusCircleIcon, SleepIcon, NutritionIcon, EnergyIcon, TrashIcon } from './icons';

interface PlannerViewProps {
  plan: WorkoutPlan;
  updatePlan: (week: number, day: number, dailyPlan: DailyPlan) => void;
  monthlyGoals: MonthlyGoals;
  updateMonthlyGoals: (month: number, goal: string) => void;
  weeklyGoals: WeeklyGoals;
  updateWeeklyGoals: (week: number, goal: string) => void;
  customWarmupExercises: ExerciseList;
  addCustomWarmupExercise: (joint: string, exercise: string) => void;
  deleteCustomWarmupExercise: (joint: string, exercise: string) => void;
  customMainExercises: MainExerciseData;
  addCustomMainExercise: (muscleGroup: string, pattern: string, exercise: string) => void;
  deleteCustomMainExercise: (muscleGroup: string, pattern: string, exercise: string) => void;
}

const emptyDailyPlan = (day: number): DailyPlan => ({
    day: day,
    isDeload: false,
    didNotTrain: false,
    checkin: { sueño: null, comida: null, energia: null },
    warmups: [],
    exercises: [],
});

const CheckinControl: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: CheckinQuality;
    field: keyof CheckinData;
    onChange: (field: keyof CheckinData, value: CheckinQuality) => void;
}> = ({ label, icon, value, field, onChange }) => {
    
    const baseClasses = "w-full text-center px-3 py-1.5 text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
    const activeClasses = {
        bien: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
        regular: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400',
        mal: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    };
    const inactiveClasses = "bg-gray-600 text-gray-300 hover:bg-gray-500 focus:ring-yellow-500";

    const getButtonClasses = (buttonValue: 'bien' | 'regular' | 'mal') => {
        return `${baseClasses} ${value === buttonValue ? activeClasses[buttonValue] : inactiveClasses}`;
    };

    const handleClick = (buttonValue: 'bien' | 'regular' | 'mal') => {
        const newValue = value === buttonValue ? null : buttonValue;
        onChange(field, newValue);
    };

    return (
        <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                {icon}
                {label}
            </label>
            <div className="flex items-center gap-2">
                <button onClick={() => handleClick('bien')} className={getButtonClasses('bien')}>Bien</button>
                <button onClick={() => handleClick('regular')} className={getButtonClasses('regular')}>Regular</button>
                <button onClick={() => handleClick('mal')} className={getButtonClasses('mal')}>Mal</button>
            </div>
        </div>
    );
};

const PlannerView: React.FC<PlannerViewProps> = ({ 
    plan, updatePlan, monthlyGoals, updateMonthlyGoals, weeklyGoals, updateWeeklyGoals,
    customWarmupExercises, addCustomWarmupExercise, deleteCustomWarmupExercise,
    customMainExercises, addCustomMainExercise, deleteCustomMainExercise
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(WEEKS[0]);
  const [selectedDay, setSelectedDay] = useState<number>(DAYS[0]);
  
  const [localDailyPlan, setLocalDailyPlan] = useState<DailyPlan>(emptyDailyPlan(selectedDay));
  const [hasChanges, setHasChanges] = useState(false);

  const initialJoint = Object.keys(WARMUP_EXERCISES)[0];
  const initialMuscleGroup = Object.keys(EXERCISE_DATA)[0];
  const initialPattern = Object.keys(EXERCISE_DATA[initialMuscleGroup])?.[0] || '';

  const [selectedJoint, setSelectedJoint] = useState<string>(initialJoint);
  const [selectedWarmupExercise, setSelectedWarmupExercise] = useState<string>('');
  const [customWarmupExercise, setCustomWarmupExercise] = useState<string>('');

  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>(initialMuscleGroup);
  const [selectedPattern, setSelectedPattern] = useState<string>(initialPattern);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [customMainExercise, setCustomMainExercise] = useState<string>('');

  const currentMonth = useMemo(() => Math.ceil(selectedWeek / (52 / 12)), [selectedWeek]);

  useEffect(() => {
    const newDailyState = plan[selectedWeek]?.[selectedDay] || emptyDailyPlan(selectedDay);
    setLocalDailyPlan(JSON.parse(JSON.stringify(newDailyState))); // Deep copy
    setHasChanges(false);
  }, [selectedWeek, selectedDay, plan]);

  useEffect(() => { setSelectedWarmupExercise(''); setCustomWarmupExercise(''); }, [selectedJoint]);
  useEffect(() => {
      const patterns = Object.keys(EXERCISE_DATA[selectedMuscleGroup] || {});
      setSelectedPattern(patterns[0] || '');
      setSelectedExercise('');
      setCustomMainExercise('');
  }, [selectedMuscleGroup]);
  useEffect(() => { setSelectedExercise(''); setCustomMainExercise(''); }, [selectedPattern]);

  const updateLocalPlan = (newPlan: Partial<DailyPlan>) => {
    setLocalDailyPlan(prev => ({...prev, ...newPlan}));
    setHasChanges(true);
  }
  
  // Warmup Logic
  const isWarmupDeletable = useMemo(() => customWarmupExercises[selectedJoint]?.includes(selectedWarmupExercise), [customWarmupExercises, selectedJoint, selectedWarmupExercise]);
  
  const handleAddWarmup = () => {
    const exerciseName = customWarmupExercise.trim() || selectedWarmupExercise;
    if (!exerciseName) return;

    if (customWarmupExercise.trim()) {
        addCustomWarmupExercise(selectedJoint, customWarmupExercise.trim());
    }

    const newWarmup: PlannedWarmup = { id: `w-${Date.now()}`, joint: selectedJoint, exercise: exerciseName };
    updateLocalPlan({ warmups: [...localDailyPlan.warmups, newWarmup] });
    setCustomWarmupExercise('');
    setSelectedWarmupExercise('');
  };

  const handleDeleteWarmupFromList = () => {
      if (!isWarmupDeletable) return;
      if (window.confirm(`¿Estás seguro de que quieres eliminar "${selectedWarmupExercise}" de tu lista de ejercicios guardados?`)) {
          deleteCustomWarmupExercise(selectedJoint, selectedWarmupExercise);
          setSelectedWarmupExercise('');
      }
  };

  const handleRemoveWarmupFromPlan = (id: string) => {
    updateLocalPlan({ warmups: localDailyPlan.warmups.filter(w => w.id !== id) });
  };
  
  // Main Exercise Logic
  const isMainExerciseDeletable = useMemo(() => customMainExercises[selectedMuscleGroup]?.[selectedPattern]?.includes(selectedExercise), [customMainExercises, selectedMuscleGroup, selectedPattern, selectedExercise]);

  const handleAddExercise = () => {
    const exerciseName = customMainExercise.trim() || selectedExercise;
    if (!exerciseName) return;

    if (customMainExercise.trim()) {
        addCustomMainExercise(selectedMuscleGroup, selectedPattern, customMainExercise.trim());
    }

    const newExercise: PlannedExercise = { id: `e-${Date.now()}`, muscleGroup: selectedMuscleGroup, pattern: selectedPattern, exercise: exerciseName, observations: '' };
    updateLocalPlan({ exercises: [...localDailyPlan.exercises, newExercise] });
    setCustomMainExercise('');
    setSelectedExercise('');
  };

  const handleDeleteExerciseFromList = () => {
      if (!isMainExerciseDeletable) return;
      if (window.confirm(`¿Estás seguro de que quieres eliminar "${selectedExercise}" de tu lista de ejercicios guardados?`)) {
          deleteCustomMainExercise(selectedMuscleGroup, selectedPattern, selectedExercise);
          setSelectedExercise('');
      }
  };
  
  const handleRemoveExerciseFromPlan = (id: string) => {
    updateLocalPlan({ exercises: localDailyPlan.exercises.filter(e => e.id !== id) });
  };
  
  const handleCheckinChange = (field: keyof CheckinData, value: CheckinQuality) => {
      updateLocalPlan({ checkin: {...localDailyPlan.checkin, [field]: value} });
  }

  const handleDailyFlagChange = (key: 'isDeload' | 'didNotTrain', value: boolean) => {
    updateLocalPlan({ [key]: value });
  };

  // Lógica de Guardar Plan. Guarda el plan localmente y se prepara para el envío
  const handleSavePlan = () => {
    updatePlan(selectedWeek, selectedDay, localDailyPlan);
    setHasChanges(false);
  };

  // Lógica de Guardar Registro. Guarda el plan y envía el registro completo a Google Sheets.
  const handleSaveRegistro = async () => {
      // Primero, guarda los cambios locales para asegurar que el estado esté actualizado
      updatePlan(selectedWeek, selectedDay, localDailyPlan);
      
      // Ahora, construye el objeto de datos para enviar al backend
      const dataToSend = {
          ...localDailyPlan,
          semana: selectedWeek,
          dia: selectedDay,
          objetivo_mensual: monthlyGoals[currentMonth] || '',
          objetivo_semanal: weeklyGoals[selectedWeek] || '',
          nivel_sueno: localDailyPlan.checkin.sueño,
          nivel_nutricion: localDailyPlan.checkin.comida,
          nivel_energia: localDailyPlan.checkin.energia,
          estado_animo: 'No especificado', // Este campo no estaba en tu checkin, debes decidir si lo incluyes
          ejercicios: localDailyPlan.exercises,
      };

      try {
          const response = await fetch('http://127.0.0.1:5000/guardar_registro', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(dataToSend),
          });

          if (response.ok) {
              console.log('Registro guardado en Google Sheets con éxito!');
              setHasChanges(false);
              alert('Registro guardado en Google Sheets con éxito!');
          } else {
              console.error('Error al guardar el registro:', response.statusText);
              alert('Hubo un error al guardar el registro.');
          }
      } catch (error) {
          console.error('Error de red:', error);
          alert('Hubo un error de conexión con el servidor.');
      }
  };
  
  const handleClearGoals = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar los objetivos de este mes y esta semana? Esta acción no se puede deshacer.')) {
        updateMonthlyGoals(currentMonth, '');
        updateWeeklyGoals(selectedWeek, '');
    }
  };

  const handleClearPlan = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todo el plan para este día? Los ejercicios y el check-in se borrarán.')) {
        const clearedPlan = emptyDailyPlan(selectedDay);
        setLocalDailyPlan(clearedPlan);
        updatePlan(selectedWeek, selectedDay, clearedPlan);
        setHasChanges(false);
    }
  };

  const isTrainingDayDisabled = localDailyPlan.didNotTrain;

  return (
    <div className="space-y-8 p-4 md:p-8">
      
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="week-select" className="block text-sm font-medium text-gray-400 mb-1">Semana de Seguimiento</label>
                <select id="week-select" value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500">
                  {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="day-select" className="block text-sm font-medium text-gray-400 mb-1">Día</label>
                <select id="day-select" value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500">
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
             <div className="space-y-4">
                <div>
                    <label htmlFor="monthly-goal" className="block text-sm font-medium text-gray-400 mb-1">Objetivo del Mes {currentMonth}</label>
                    <textarea
                        id="monthly-goal"
                        value={monthlyGoals[currentMonth] || ''}
                        onChange={(e) => updateMonthlyGoals(currentMonth, e.target.value)}
                        rows={2}
                        className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder={`Define tu objetivo principal para el mes ${currentMonth}...`}
                    />
                </div>
                <div>
                    <label htmlFor="weekly-goal" className="block text-sm font-medium text-gray-400 mb-1">Objetivo de la Semana {selectedWeek}</label>
                    <textarea
                        id="weekly-goal"
                        value={weeklyGoals[selectedWeek] || ''}
                        onChange={(e) => updateWeeklyGoals(selectedWeek, e.target.value)}
                        rows={2}
                        className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder={`Define tu objetivo para la semana ${selectedWeek}...`}
                    />
                </div>
                <button
                    onClick={handleClearGoals}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                >
                    <TrashIcon className="w-5 h-5" /> Limpiar Objetivos
                </button>
            </div>
            <div className="flex items-center space-x-6 pt-2">
              <div className="flex items-center">
                  <input id="deload-check" type="checkbox" checked={localDailyPlan.isDeload} onChange={e => handleDailyFlagChange('isDeload', e.target.checked)} className="w-5 h-5 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"/>
                  <label htmlFor="deload-check" className={`ml-3 text-sm font-medium transition-colors ${localDailyPlan.isDeload ? 'text-yellow-400 font-semibold' : 'text-gray-300'}`}>Semana de descarga</label>
              </div>
              <div className="flex items-center">
                  <input id="notrain-check" type="checkbox" checked={localDailyPlan.didNotTrain} onChange={e => handleDailyFlagChange('didNotTrain', e.target.checked)} className="w-5 h-5 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
                  <label htmlFor="notrain-check" className={`ml-3 text-sm font-medium transition-colors ${localDailyPlan.didNotTrain ? 'text-red-400 font-semibold' : 'text-gray-300'}`}>No entrené</label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`bg-gray-800 p-6 rounded-lg shadow-lg transition-opacity ${isTrainingDayDisabled ? 'opacity-50' : ''}`}>
        <h3 className="text-xl font-semibold mb-4 text-yellow-400 border-b border-gray-700 pb-3">Entrada en Calor</h3>
        <fieldset disabled={isTrainingDayDisabled} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-300">Añadir Ejercicio</h4>
                <div>
                    <label htmlFor="joint-select" className="block text-sm font-medium text-gray-400 mb-1">Articulación</label>
                    <select id="joint-select" value={selectedJoint} onChange={e => setSelectedJoint(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500">
                    {Object.keys(WARMUP_EXERCISES).map(joint => <option key={joint} value={joint}>{joint}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="warmup-exercise-select" className="block text-sm font-medium text-gray-400 mb-1">Ejercicio de la lista</label>
                    <select id="warmup-exercise-select" value={selectedWarmupExercise} onChange={e => {setSelectedWarmupExercise(e.target.value); if(e.target.value) setCustomWarmupExercise('')}} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500">
                      <option value="">-- Seleccionar de la lista --</option>
                      <optgroup label="Ejercicios predefinidos">
                        {(WARMUP_EXERCISES[selectedJoint] || []).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                      </optgroup>
                      {(customWarmupExercises[selectedJoint] || []).length > 0 && (
                        <optgroup label="Ejercicios guardados">
                          {(customWarmupExercises[selectedJoint] || []).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </optgroup>
                      )}
                    </select>
                </div>

                <div className="flex items-center gap-2 text-gray-500">
                    <hr className="flex-grow border-gray-600" /> <span className="text-xs font-semibold">O</span> <hr className="flex-grow border-gray-600" />
                </div>

                <div>
                    <label htmlFor="custom-warmup-exercise" className="block text-sm font-medium text-gray-400 mb-1">Añadir ejercicio manual</label>
                    <input type="text" id="custom-warmup-exercise" value={customWarmupExercise} onChange={e => {setCustomWarmupExercise(e.target.value); if(e.target.value) setSelectedWarmupExercise('')}} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500" placeholder="Ej: Caminadora 5 min" aria-label="Nombre del ejercicio de calentamiento personalizado" />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleAddWarmup} className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <PlusCircleIcon className="w-5 h-5" /> Agregar al Plan
                    </button>
                    <button onClick={handleDeleteWarmupFromList} disabled={!isWarmupDeletable} title="Eliminar ejercicio de la lista" className="p-2 bg-red-800 hover:bg-red-700 text-white rounded-md transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
             <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-4">Plan de Calentamiento</h4>
                <div className="space-y-2">
                    {localDailyPlan?.warmups?.length > 0 ? (
                        <ul className="space-y-2">
                        {localDailyPlan.warmups.map(w => (
                          <li key={w.id} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-md">
                            <span>{w.exercise} <span className="text-xs text-gray-400">({w.joint})</span></span>
                            <button onClick={() => handleRemoveWarmupFromPlan(w.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full transition-colors">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                        </ul>
                    ) : <p className="text-gray-500 text-sm italic mt-2">{isTrainingDayDisabled ? 'Día marcado como no entrenado.' : 'Agrega ejercicios de calentamiento.'}</p>}
                </div>
              </div>
        </fieldset>
      </section>

      <section className={`bg-gray-800 p-6 rounded-lg shadow-lg transition-opacity ${isTrainingDayDisabled ? 'opacity-50' : ''}`}>
          <h3 className="text-xl font-semibold mb-4 text-yellow-400 border-b border-gray-700 pb-3">Ejercicios Principales</h3>
          <fieldset disabled={isTrainingDayDisabled} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-300">Añadir Ejercicio</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Grupo Muscular</label>
                        <select value={selectedMuscleGroup} onChange={e => setSelectedMuscleGroup(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500">
                            {Object.keys(EXERCISE_DATA).map(group => <option key={group} value={group}>{group}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Patrón</label>
                        <select value={selectedPattern} onChange={e => setSelectedPattern(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500">
                            {Object.keys(EXERCISE_DATA[selectedMuscleGroup] || {}).map(patt => <option key={patt} value={patt}>{patt}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Ejercicio de la lista</label>
                    <select value={selectedExercise} onChange={e => {setSelectedExercise(e.target.value); if(e.target.value) setCustomMainExercise('')}} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500">
                        <option value="">-- Seleccionar de la lista --</option>
                        <optgroup label="Ejercicios predefinidos">
                            {(EXERCISE_DATA[selectedMuscleGroup]?.[selectedPattern] || []).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </optgroup>
                        {(customMainExercises[selectedMuscleGroup]?.[selectedPattern] || []).length > 0 && (
                            <optgroup label="Ejercicios guardados">
                                {(customMainExercises[selectedMuscleGroup]?.[selectedPattern] || []).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                            </optgroup>
                        )}
                    </select>
                </div>
                
                <div className="flex items-center gap-2 text-gray-500">
                    <hr className="flex-grow border-gray-600" /> <span className="text-xs font-semibold">O</span> <hr className="flex-grow border-gray-600" />
                </div>
                
                <div>
                    <label htmlFor="custom-main-exercise" className="block text-sm font-medium text-gray-400 mb-1">Añadir ejercicio manual</label>
                    <input type="text" id="custom-main-exercise" value={customMainExercise} onChange={e => {setCustomMainExercise(e.target.value); if(e.target.value) setSelectedExercise('')}} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500" placeholder="Ej: Sentadilla Goblet" aria-label="Nombre del ejercicio principal personalizado" />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleAddExercise} className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed">
                        <PlusCircleIcon className="w-5 h-5"/> Agregar al Plan
                    </button>
                    <button onClick={handleDeleteExerciseFromList} disabled={!isMainExerciseDeletable} title="Eliminar ejercicio de la lista" className="p-2 bg-red-800 hover:bg-red-700 text-white rounded-md transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
              </div>
               <div>
                  <h4 className="text-lg font-semibold text-gray-300 mb-4">Plan de Ejercicios</h4>
                  <div className="space-y-3">
                    {localDailyPlan?.exercises?.length > 0 ? (
                        <div className="space-y-3">
                        {localDailyPlan.exercises.map(ex => (
                            <div key={ex.id} className="bg-gray-700/50 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-bold text-white">{ex.exercise}</p>
                                    <p className="text-sm text-yellow-400">{ex.muscleGroup} &gt; {ex.pattern}</p>
                                  </div>
                                  <button onClick={() => handleRemoveExerciseFromPlan(ex.id)} className="text-red-500 hover:text-red-400 p-1 rounded-full transition-colors flex-shrink-0 ml-2">
                                      <TrashIcon className="w-5 h-5" />
                                  </button>
                                </div>
                                {ex.observations && <p className="text-sm text-gray-300 mt-2 italic">"{ex.observations}"</p>}
                            </div>
                        ))}
                        </div>
                    ) : <p className="text-gray-500 text-sm italic mt-2">{isTrainingDayDisabled ? 'Día marcado como no entrenado.' : 'Agrega ejercicios a tu rutina.'}</p>}
                  </div>
              </div>
          </fieldset>
      </section>

       <section className="bg-gray-800 p-6 rounded-lg shadow-lg mt-8">
            <div className="flex justify-between items-center">
                <button 
                    onClick={handleClearPlan}
                    className="bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-red-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                >
                    Limpiar Plan del Día
                </button>
                <button 
                    onClick={handleSaveRegistro}
                    disabled={!hasChanges}
                    className="bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-yellow-700 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500"
                >
                    {hasChanges ? 'Guardar Plan del Día' : 'Guardado'}
                </button>
            </div>
        </section>
    </div>
  );
};

export default PlannerView;