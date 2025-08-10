
import React, { useMemo, useState, useEffect } from 'react';
import type { WorkoutPlan, MonthlyGoals, WeeklyGoals, WorkoutLog, DailyPlan } from '../types';
import { MONTHS, WEEKS, DAYS } from '../constants';
import DoughnutChart from './DoughnutChart';
import LineChart from './LineChart';
import BarChart from './BarChart';
import { SleepIcon, NutritionIcon, EnergyIcon } from './icons';

interface SeguimientoViewProps {
  plan: WorkoutPlan;
  log: WorkoutLog;
  monthlyGoals: MonthlyGoals;
  weeklyGoals: WeeklyGoals;
}

const timeframes = [
    { label: '1 Mes', weeks: 4 },
    { label: '3 Meses', weeks: 13 },
    { label: '6 Meses', weeks: 26 },
    { label: '1 Año', weeks: 52 },
];


const SeguimientoView: React.FC<SeguimientoViewProps> = ({ plan, log, monthlyGoals, weeklyGoals }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(MONTHS[0]);
  
  const weeksForMonth = useMemo(() => {
    return WEEKS.filter(w => Math.ceil(w / (52 / 12)) === selectedMonth);
  }, [selectedMonth]);

  const [selectedGoalWeek, setSelectedGoalWeek] = useState<number>(weeksForMonth[0] || WEEKS[0]);
  
  useEffect(() => {
    // Reset selected week when month changes
    setSelectedGoalWeek(weeksForMonth[0] || WEEKS[0]);
  }, [weeksForMonth]);
  
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [timeframe, setTimeframe] = useState<number>(13); // Default to 3 months
  
  const loggedExercises = useMemo(() => {
    const exercises = new Set<string>();
    Object.values(plan).forEach(weeklyPlan => {
      Object.values(weeklyPlan).forEach((dailyPlan: unknown) => {
        if(dailyPlan && typeof dailyPlan === 'object' && 'exercises' in dailyPlan && Array.isArray((dailyPlan as DailyPlan).exercises)) {
            (dailyPlan as DailyPlan).exercises.forEach(ex => exercises.add(ex.exercise));
        }
      });
    });
    return Array.from(exercises).sort();
  }, [plan]);
  
  const loggedWeeks = useMemo(() => Object.keys(log).map(Number).sort((a,b) => b-a), [log]);
  const [selectedAnalysisWeek, setSelectedAnalysisWeek] = useState<number>(loggedWeeks[0] || WEEKS[0]);

  useEffect(() => {
    if (!selectedExercise && loggedExercises.length > 0) {
      setSelectedExercise(loggedExercises[0]);
    }
  }, [loggedExercises, selectedExercise]);
  
   useEffect(() => {
    if (loggedWeeks.length > 0 && !loggedWeeks.includes(selectedAnalysisWeek)) {
      setSelectedAnalysisWeek(loggedWeeks[0]);
    }
  }, [loggedWeeks, selectedAnalysisWeek]);


  const weeklyChartData = useMemo(() => {
    if (!selectedExercise || !selectedAnalysisWeek) return { weightData: [], repsData: [] };

    const weightData: { label: string; value: number }[] = [];
    const repsData: { label: string; value: number }[] = [];

    const weeklyLog = log[selectedAnalysisWeek];
    if (!weeklyLog) return { weightData: [], repsData: [] };

    DAYS.forEach(day => {
        const dailyLog = weeklyLog[day];
        const dailyPlan = plan[selectedAnalysisWeek]?.[day];
        if (!dailyLog || !dailyPlan) return;

        const planExercise = dailyPlan.exercises.find(e => e.exercise === selectedExercise);
        if (!planExercise) return;

        const logData = dailyLog[planExercise.id];
        if (!logData || !logData.sets || logData.sets.length === 0) return;

        const dayMaxSet = logData.sets.reduce((maxSet, currentSet) => 
            currentSet.weight > maxSet.weight ? currentSet : maxSet, 
            { weight: -1, reps: 0, id: '', rir: 0, rpe: 0 }
        );

        if (dayMaxSet.weight >= 0) {
            weightData.push({ label: `Día ${day}`, value: dayMaxSet.weight });
            repsData.push({ label: `Día ${day}`, value: dayMaxSet.reps });
        }
    });

    return {
        weightData,
        repsData
    };
  }, [log, plan, selectedExercise, selectedAnalysisWeek]);
  
  const checkinDataByCategory = useMemo(() => {
    const stats = {
      sueño: { bien: 0, regular: 0, mal: 0 },
      comida: { bien: 0, regular: 0, mal: 0 },
      energia: { bien: 0, regular: 0, mal: 0 },
    };

    weeksForMonth.forEach(week => {
      const weeklyPlan = plan[week];
      if (weeklyPlan) {
        Object.values(weeklyPlan).forEach(dayPlan => {
          if (dayPlan?.checkin) {
            const { sueño, comida, energia } = dayPlan.checkin;
            if (sueño) stats.sueño[sueño]++;
            if (comida) stats.comida[comida]++;
            if (energia) stats.energia[energia]++;
          }
        });
      }
    });
    
    const colors = { bien: '#22c55e', regular: '#eab308', mal: '#ef4444' };
    
    const formatData = (category: keyof typeof stats) => (
        Object.entries(stats[category]).map(([key, count]) => ({
            label: key,
            count,
            color: colors[key as keyof typeof colors]
        }))
    );
    
    return {
        sueño: formatData('sueño'),
        comida: formatData('comida'),
        energia: formatData('energia'),
    };
  }, [plan, weeksForMonth]);

  const { yearlyWeightSeries, yearlyRepsSeries } = useMemo(() => {
    if (!selectedExercise) return { yearlyWeightSeries: [], yearlyRepsSeries: [] };

    const weeklyMaxes = new Map<number, { maxWeight: number, repsAtMax: number }>();

    Object.keys(log).forEach(weekStr => {
        const week = Number(weekStr);
        const weeklyLog = log[week];
        if (!weeklyLog) return;
        
        let weekMaxWeight = -1;
        let weekRepsAtMax = 0;

        Object.keys(weeklyLog).forEach(dayStr => {
            const day = Number(dayStr);
            const dailyLog = weeklyLog[day];
            const dailyPlan = plan[week]?.[day];
            if (!dailyLog || !dailyPlan) return;

            const planExercise = dailyPlan.exercises.find(e => e.exercise === selectedExercise);
            if (!planExercise) return;
            
            const logData = dailyLog[planExercise.id];
            if (!logData || !logData.sets || logData.sets.length === 0) return;

            const dayMaxSet = logData.sets.reduce((maxSet, currentSet) => {
                return currentSet.weight > maxSet.weight ? currentSet : maxSet;
            }, { weight: -1, reps: 0, id:'', rir:0, rpe:0 });

            if (dayMaxSet.weight > weekMaxWeight) {
                weekMaxWeight = dayMaxSet.weight;
                weekRepsAtMax = dayMaxSet.reps;
            }
        });
        
        if (weekMaxWeight >= 0) {
            weeklyMaxes.set(week, { maxWeight: weekMaxWeight, repsAtMax: weekRepsAtMax });
        }
    });

    const weightData: { x: number; y: number }[] = [];
    weeklyMaxes.forEach((value, week) => {
        if (week <= timeframe && value.maxWeight > 0) {
           weightData.push({ x: week, y: value.maxWeight });
        }
    });

    const repsData: { x: number; y: number }[] = [];
    weeklyMaxes.forEach((value, week) => {
        if (week <= timeframe && value.maxWeight > 0) {
           repsData.push({ x: week, y: value.repsAtMax });
        }
    });
    
    weightData.sort((a, b) => a.x - b.x);
    repsData.sort((a, b) => a.x - b.x);

    return {
        yearlyWeightSeries: [{
            name: 'Peso Máximo (kg)',
            color: '#eab308', // yellow
            data: weightData,
        }],
        yearlyRepsSeries: [{
            name: 'Reps con Peso Máximo',
            color: '#8b5cf6', // violet
            data: repsData,
        }],
    };
  }, [plan, log, selectedExercise, timeframe]);


  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-violet-400 mb-6">Check-in y Objetivos</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
            {/* Monthly Goal Column */}
            <div className="space-y-2">
                <label htmlFor="summary-month-select" className="block text-sm font-medium text-gray-400">Objetivo del Mes</label>
                <select
                  id="summary-month-select"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  {MONTHS.map(m => <option key={m} value={m}>Mes {m}</option>)}
                </select>
                <div className="bg-gray-700/50 p-4 rounded-md min-h-[80px] flex items-center justify-center">
                    {monthlyGoals[selectedMonth] ? (
                         <p className="text-gray-300 italic text-center">"{monthlyGoals[selectedMonth]}"</p>
                    ) : (
                        <p className="text-gray-500 italic text-center">No se ha definido objetivo para este mes.</p>
                    )}
                </div>
            </div>

            {/* Weekly Goal Column */}
            <div className="space-y-2">
                <label htmlFor="goal-week-select" className="block text-sm font-medium text-gray-400">Objetivo de la Semana</label>
                <select
                  id="goal-week-select"
                  value={selectedGoalWeek}
                  onChange={e => setSelectedGoalWeek(Number(e.target.value))}
                  className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
                  disabled={weeksForMonth.length === 0}
                >
                  {weeksForMonth.length > 0 ? (
                      weeksForMonth.map(w => <option key={w} value={w}>Semana {w}</option>)
                  ) : (
                      <option>No hay semanas en este mes</option>
                  )}
                </select>
                <div className="bg-gray-700/50 p-4 rounded-md min-h-[80px] flex items-center justify-center">
                    {weeklyGoals[selectedGoalWeek] ? (
                         <p className="text-gray-300 italic text-center">"{weeklyGoals[selectedGoalWeek]}"</p>
                    ) : (
                        <p className="text-gray-500 italic text-center">No se ha definido objetivo para esta semana.</p>
                    )}
                </div>
            </div>
        </div>
      </section>

      {loggedExercises.length > 0 && (
         <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-violet-400 mb-4">Análisis de la Semana</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="week-analysis-select" className="block text-sm font-medium text-gray-400 mb-2">Semana</label>
                    <select id="week-analysis-select" value={selectedAnalysisWeek} onChange={e => setSelectedAnalysisWeek(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500" disabled={loggedWeeks.length === 0}>
                        {loggedWeeks.length > 0 ? loggedWeeks.map(w => <option key={w} value={w}>Semana {w}</option>) : <option>No hay semanas con registros</option>}
                    </select>
                </div>
                <div>
                    <label htmlFor="exercise-weekly-analysis-select" className="block text-sm font-medium text-gray-400 mb-2">Ejercicio</label>
                    <select id="exercise-weekly-analysis-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500">
                        {loggedExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BarChart
                    data={weeklyChartData.weightData}
                    title="Evolución de Peso por Día"
                    yAxisLabel="Peso (kg)"
                    barColor="#eab308"
                />
                <BarChart
                    data={weeklyChartData.repsData}
                    title="Evolución de Reps por Día"
                    yAxisLabel="Repeticiones"
                    barColor="#8b5cf6"
                />
            </div>
         </section>
      )}

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-violet-400 mb-6">Análisis de Rendimiento Anual</h2>
        {loggedExercises.length > 0 ? (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="exercise-analysis-select" className="block text-sm font-medium text-gray-400 mb-2">Ejercicio</label>
                        <select id="exercise-analysis-select" value={selectedExercise} onChange={e => setSelectedExercise(e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500">
                           {loggedExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="timeframe-select" className="block text-sm font-medium text-gray-400 mb-2">Período</label>
                        <select
                            id="timeframe-select"
                            value={timeframe}
                            onChange={e => setTimeframe(Number(e.target.value))}
                            className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500">
                            {timeframes.map(tf => <option key={tf.label} value={tf.weeks}>{tf.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-4 space-y-8">
                    <LineChart
                        series={yearlyWeightSeries}
                        title={`Progresión de Peso Máximo (kg)`}
                        yAxisLabel="Peso (kg)"
                        xAxisMax={timeframe}
                        xAxisLabel="Semanas"
                    />
                    <LineChart
                        series={yearlyRepsSeries}
                        title={`Progresión de Reps con Peso Máximo`}
                        yAxisLabel="Repeticiones"
                        xAxisMax={timeframe}
                        xAxisLabel="Semanas"
                    />
                </div>
            </div>
        ) : (
            <p className="text-gray-500 text-center py-10">No hay datos de registro para analizar. Completa tus entrenamientos en la pestaña "Registro".</p>
        )}
      </section>
    </div>
  );
};

export default SeguimientoView;
