import React, { useState, useEffect, useMemo } from 'react';
import type { WorkoutPlan, WorkoutLog, LoggedExerciseData, PlannedExercise, DailyLog, PlannedSet, DailyPlan } from '../types';
import { WEEKS, DAYS, LOG_OPTIONS } from '../constants';
import { DumbbellIcon, PlusCircleIcon, TrashIcon } from './icons';

interface BackendData {
    estado_animo?: string;
    objetivo_mensual?: string;
    objetivo_semanal?: string;
    nivel_nutricion?: string;
    nivel_sueno?: string;
    nivel_energia?: string;
    semana: number;
    dia: number;
    ejercicio: string;
    // CAMBIO AQUI: Añadimos la columna 'serie' (que es el número de set)
    serie: number | string;
    peso: number | string;
    repeticiones: number | string;
    rir: number | string;
    rpe: number | string;
    usuario_nombre: string;
}

interface ExerciseLogCardProps {
    exercise: PlannedExercise;
    logData: LoggedExerciseData | undefined;
    onLogChange: (data: LoggedExerciseData) => void;
    onDelete: () => void;
}

const ExerciseLogCard: React.FC<ExerciseLogCardProps> = ({ exercise, logData, onLogChange, onDelete }) => {
    const [sets, setSets] = useState<PlannedSet[]>([]);

    useEffect(() => {
        setSets(logData?.sets || []);
    }, [logData]);

    const handleSetChange = (setId: string, field: keyof Omit<PlannedSet, 'id'>, value: string) => {
        const numericValue = Number(value);
        if (isNaN(numericValue) || numericValue < 0) return;

        const updatedSets = sets.map(s =>
            s.id === setId ? { ...s, [field]: numericValue } : s
        );
        setSets(updatedSets);
        onLogChange({ sets: updatedSets });
    };

    const handleAddSet = () => {
        const lastSet = sets.length > 0 ? sets[sets.length - 1] : { weight: 0, reps: 0, rir: 0, rpe: 0 };
        const newSet: PlannedSet = {
            id: `set-${Date.now()}`,
            weight: lastSet.weight,
            reps: lastSet.reps,
            rir: 0,
            rpe: 0,
        };
        const updatedSets = [...sets, newSet];
        setSets(updatedSets);
        onLogChange({ sets: updatedSets });
    }

    const handleRemoveSet = (setId: string) => {
        const updatedSets = sets.filter(s => s.id !== setId);
        setSets(updatedSets);
        onLogChange({ sets: updatedSets });
    }

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-lg font-bold text-white">{exercise.exercise}</h4>
                <button onClick={onDelete} className="text-red-500 hover:text-red-400 transition-colors" title="Eliminar ejercicio del plan de hoy">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            {exercise.observations && <p className="text-sm text-gray-400 mb-4 italic">Nota: {exercise.observations}</p>}

            <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-6 gap-2 px-2 pb-2 border-b border-gray-700">
                    <span className="text-xs font-bold text-gray-400 col-span-1">Set</span>
                    <span className="text-xs font-bold text-gray-400 col-span-1">Peso (kg)</span>
                    <span className="text-xs font-bold text-gray-400 col-span-1">Reps</span>
                    <span className="text-xs font-bold text-gray-400 col-span-1">RIR</span>
                    <span className="text-xs font-bold text-gray-400 col-span-1">RPE</span>
                </div>

                {sets.map((set, index) => (
                    <div key={set.id} className="grid grid-cols-6 gap-2 items-center">
                        <div className="flex items-center justify-center font-semibold text-gray-300 bg-gray-700/50 rounded-md h-10">
                            {index + 1}
                        </div>
                        <input type="number" value={set.weight} onChange={e => handleSetChange(set.id, 'weight', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm focus:ring-violet-500 focus:border-violet-500" />
                        <select value={set.reps} onChange={e => handleSetChange(set.id, 'reps', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm focus:ring-violet-500 focus:border-violet-500">
                            <option value="0">0</option>
                            {LOG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <input type="number" value={set.rir} onChange={e => handleSetChange(set.id, 'rir', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm focus:ring-violet-500 focus:border-violet-500" />
                        <input type="number" value={set.rpe} onChange={e => handleSetChange(set.id, 'rpe', e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm focus:ring-violet-500 focus:border-violet-500" />
                        <button onClick={() => handleRemoveSet(set.id)} className="text-red-500 hover:text-red-400 transition-colors h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))}

                <button onClick={handleAddSet} className="w-full mt-3 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-violet-400 font-bold py-2 px-4 rounded-md transition duration-200 ease-in-out">
                    <PlusCircleIcon className="w-5 h-5" /> Añadir Serie
                </button>
            </div>
        </div>
    );
};

interface TrackerViewProps {
    plan: WorkoutPlan;
    log: WorkoutLog;
    saveDailyLog: (week: number, day: number, dailyLog: DailyLog) => void;
    updatePlan: (week: number, day: number, dailyPlan: DailyPlan) => void;
    estadoAnimo: string;
    objetivos: { mensual: string, semanal: string };
    nivelNutricion: string;
    nivelSueno: string;
    nivelEnergia: string;
    userName: string;
}

const TrackerView: React.FC<TrackerViewProps> = ({ plan, log, saveDailyLog, updatePlan, estadoAnimo, objetivos, nivelNutricion, nivelSueno, nivelEnergia, userName }) => {
    const [selectedWeek, setSelectedWeek] = useState<number>(WEEKS[0]);
    const [selectedDay, setSelectedDay] = useState<number>(DAYS[0]);
    const [localDailyLog, setLocalDailyLog] = useState<DailyLog>({});
    const [isSaved, setIsSaved] = useState(true);

    const [localEstadoAnimo, setLocalEstadoAnimo] = useState(estadoAnimo);
    const [localNivelNutricion, setLocalNivelNutricion] = useState(nivelNutricion);
    const [localNivelSueno, setLocalNivelSueno] = useState(nivelSueno);
    const [localNivelEnergia, setLocalNivelEnergia] = useState(nivelEnergia);

    const globalWeek = selectedWeek;

    useEffect(() => {
        const dailyLog = log[globalWeek]?.[selectedDay] || {};
        setLocalDailyLog(dailyLog);
        setIsSaved(true);

        setLocalEstadoAnimo(estadoAnimo);
        setLocalNivelNutricion(nivelNutricion);
        setLocalNivelSueno(nivelSueno);
        setLocalNivelEnergia(nivelEnergia);

    }, [globalWeek, selectedDay, log, estadoAnimo, nivelNutricion, nivelSueno, nivelEnergia]);

    const handleLocalLogChange = (exerciseId: string, data: LoggedExerciseData) => {
        setLocalDailyLog(prev => ({
            ...prev,
            [exerciseId]: data,
        }));
        setIsSaved(false);
    };

    const handleSaveChanges = async () => {
        saveDailyLog(globalWeek, selectedDay, localDailyLog);

        const todaysPlan = plan[globalWeek]?.[selectedDay];
        if (!todaysPlan || todaysPlan.exercises.length === 0) {
            console.error("No hay plan para este día. No se puede guardar en Google Sheets.");
            alert("No hay plan para este día. El registro no se enviará.");
            setIsSaved(true);
            return;
        }

        const allExercisesData = todaysPlan.exercises.map(ex => {
            const loggedData = localDailyLog?.[ex.id];
            if (loggedData && loggedData.sets.length > 0) {
                return loggedData.sets.map((set, index) => ({
                    semana: globalWeek,
                    dia: selectedDay,
                    estado_animo: localEstadoAnimo,
                    objetivo_mensual: objetivos.mensual,
                    objetivo_semanal: objetivos.semanal,
                    nivel_nutricion: localNivelNutricion,
                    nivel_sueno: localNivelSueno,
                    nivel_energia: localNivelEnergia,
                    ejercicio: ex.exercise,
                    // CAMBIO AQUI: Incluimos el número de set
                    serie: index + 1,
                    peso: set.weight || 'N/A',
                    repeticiones: set.reps || 'N/A',
                    rir: set.rir || 'N/A',
                    rpe: set.rpe || 'N/A',
                    usuario_nombre: userName,
                }));
            }
            return [];
        }).flat();

        if (allExercisesData.length === 0) {
            alert("No se ha registrado ninguna serie para enviar.");
            setIsSaved(true);
            return;
        }

        try {
            // CAMBIO AQUÍ: La URL del servidor
            const backendUrl = 'https://[nombre-de-tu-app].onrender.com'; 

            // Iteramos sobre cada set y enviamos una solicitud individual
            for (const data of allExercisesData) {
                const response = await fetch(`${backendUrl}/guardar_registro`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error al enviar datos: ${errorData.error || 'Error desconocido'}`);
                }
            }

            alert('¡Registro guardado con éxito!');
            setIsSaved(true);
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            alert(`Hubo un error al enviar los datos: ${error.message}. Asegúrate de que el servidor esté encendido.`);
            setIsSaved(false);
        }
    };

    const handleDeleteDayLog = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar todo el registro de este día? Esta acción no se puede deshacer.')) {
            saveDailyLog(globalWeek, selectedDay, {});
            setLocalDailyLog({});
            setIsSaved(true);
        }
    }

    const handleDeleteExercise = (exerciseId: string) => {
        const todaysPlan = plan[globalWeek]?.[selectedDay];
        if (!todaysPlan) return;

        const exerciseToDelete = todaysPlan.exercises.find(e => e.id === exerciseId);
        if (!exerciseToDelete) return;

        if (window.confirm(`¿Estás seguro de que quieres eliminar "${exerciseToDelete.exercise}" del plan de hoy? También se borrará su registro.`)) {
            const updatedExercises = todaysPlan.exercises.filter(e => e.id !== exerciseId);
            const updatedDailyPlan = { ...todaysPlan, exercises: updatedExercises };
            updatePlan(globalWeek, selectedDay, updatedDailyPlan);

            setLocalDailyLog(prev => {
                const newLog = { ...prev };
                if (newLog[exerciseId]) {
                    delete newLog[exerciseId];
                }
                return newLog;
            });
            setIsSaved(false);
        }
    };

    const todaysPlan = useMemo(() => plan[globalWeek]?.[selectedDay], [plan, globalWeek, selectedDay]);

    return (
        <div className="p-4 md:p-8 space-y-8">
            <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-violet-400 flex items-center gap-3"><DumbbellIcon /> Registro de Entrenamiento</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="week-select-tracker" className="block text-sm font-medium text-gray-400 mb-1">Semana de Seguimiento</label>
                        <select id="week-select-tracker" value={selectedWeek} onChange={e => setSelectedWeek(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500">
                            {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="day-select-tracker" className="block text-sm font-medium text-gray-400 mb-1">Día</label>
                        <select id="day-select-tracker" value={selectedDay} onChange={e => setSelectedDay(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500">
                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
            </section>
            
            <section className="bg-gray-800 p-6 rounded-lg shadow-lg text-gray-300">
                <h3 className="text-xl font-semibold mb-4 text-violet-400">Check-in Diario</h3>
                <div className="space-y-4">
                    {objetivos.mensual && (
                        <div>
                            <span className="font-bold">Objetivo Mensual:</span> {objetivos.mensual}
                        </div>
                    )}
                    {objetivos.semanal && (
                        <div>
                            <span className="font-bold">Objetivo Semanal:</span> {objetivos.semanal}
                        </div>
                    )}
                    <div>
                        <span className="font-bold">Estado de Ánimo:</span> <span className={`${localEstadoAnimo === 'Bien' ? 'text-green-400' : localEstadoAnimo === 'Regular' ? 'text-yellow-400' : 'text-red-400'}`}>{localEstadoAnimo || 'No registrado'}</span>
                    </div>
                    <div>
                        <span className="font-bold">Nivel de Nutrición:</span> <span className={`${localNivelNutricion === 'Bien' ? 'text-green-400' : localNivelNutricion === 'Regular' ? 'text-yellow-400' : 'text-red-400'}`}>{localNivelNutricion || 'No registrado'}</span>
                    </div>
                    <div>
                        <span className="font-bold">Nivel de Sueño:</span> <span className={`${localNivelSueno === 'Bien' ? 'text-green-400' : localNivelSueno === 'Regular' ? 'text-yellow-400' : 'text-red-400'}`}>{localNivelSueno || 'No registrado'}</span>
                    </div>
                    <div>
                        <span className="font-bold">Nivel de Energía:</span> <span className={`${localNivelEnergia === 'Bien' ? 'text-green-400' : localNivelEnergia === 'Regular' ? 'text-yellow-400' : 'text-red-400'}`}>{localNivelEnergia || 'No registrado'}</span>
                    </div>
                </div>
            </section>

            {todaysPlan && (todaysPlan.warmups.length > 0 || todaysPlan.exercises.length > 0) && !todaysPlan.didNotTrain && (
                <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-gray-300">Plan del Día</h3>
                    <div className="text-green-400 space-y-3">
                        {todaysPlan.warmups.length > 0 && (
                            <div>
                                <h4 className="font-bold">Entrada en Calor:</h4>
                                <ul className="list-disc list-inside ml-4">
                                    {todaysPlan.warmups.map(w => <li key={w.id}>{w.exercise}</li>)}
                                </ul>
                            </div>
                        )}
                        {todaysPlan.exercises.length > 0 && (
                            <div>
                                <h4 className="font-bold">Ejercicios Principales:</h4>
                                <ul className="list-disc list-inside ml-4">
                                    {todaysPlan.exercises.map(ex => <li key={ex.id}>{ex.exercise}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <section>
                <h3 className="text-xl font-semibold mb-4 text-gray-300">Ejercicios para registrar - Semana {selectedWeek}, Día {selectedDay}</h3>
                {todaysPlan && todaysPlan.exercises.length > 0 && !todaysPlan.didNotTrain ? (
                    <div className="space-y-4">
                        {todaysPlan.exercises.map(ex => (
                            <ExerciseLogCard
                                key={ex.id}
                                exercise={ex}
                                logData={localDailyLog?.[ex.id]}
                                onLogChange={(data) => handleLocalLogChange(ex.id, data)}
                                onDelete={() => handleDeleteExercise(ex.id)}
                            />
                        ))}
                        <div className="flex justify-between items-center pt-4">
                            <button
                                onClick={handleDeleteDayLog}
                                className="bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-red-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                            >
                                Eliminar Registro del Día
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={isSaved}
                                className="bg-violet-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-violet-700 transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-violet-500"
                            >
                                {isSaved ? 'Guardado' : 'Guardar Registro'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-800 rounded-lg">
                        <p className="text-gray-400">{todaysPlan?.didNotTrain ? 'Este día está marcado como "No entrené".' : 'No hay ejercicios planificados para este día.'}</p>
                        {!todaysPlan?.didNotTrain && <p className="text-gray-500 text-sm mt-2">Ve a la pestaña "Planificador" para armar tu rutina.</p>}
                    </div>
                )}
            </section>
        </div>
    );
};

export default TrackerView;