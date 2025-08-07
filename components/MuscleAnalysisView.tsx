
import React, { useState, useMemo, useEffect } from 'react';
import type { WorkoutPlan } from '../types';
import { MONTHS, WEEKS, DAYS, EXERCISE_DATA } from '../constants';
import BarChart from './BarChart';
import { ChartPieIcon } from './icons';

interface MuscleAnalysisViewProps {
  plan: WorkoutPlan;
}

const MuscleAnalysisView: React.FC<MuscleAnalysisViewProps> = ({ plan }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(MONTHS[0]);
  const [selectedMuscleGroupFilter, setSelectedMuscleGroupFilter] = useState<string>('all');

  const weeksForMonth = useMemo(() => {
    return WEEKS.filter(w => Math.ceil(w / (52 / 12)) === selectedMonth);
  }, [selectedMonth]);
  
  // Reset filter when month changes
  useEffect(() => {
    setSelectedMuscleGroupFilter('all');
  }, [selectedMonth]);

  const analysisData = useMemo(() => {
    const muscleCounts: { [key: string]: number } = {};
    const patternCounts: { [key: string]: number } = {};
    const filteredPatternCounts: { [key: string]: number } = {};
    const filteredExerciseCounts: { [key: string]: number } = {};

    let dataFoundInMonth = false;

    weeksForMonth.forEach(week => {
      const weeklyPlan = plan[week];
      if (weeklyPlan) {
        DAYS.forEach(day => {
          const dayPlan = weeklyPlan[day];
          if (dayPlan && dayPlan.exercises && dayPlan.exercises.length > 0 && !dayPlan.didNotTrain) {
            dataFoundInMonth = true;
            dayPlan.exercises.forEach(ex => {
              // Always calculate overall stats for the 'all' view
              muscleCounts[ex.muscleGroup] = (muscleCounts[ex.muscleGroup] || 0) + 1;
              patternCounts[ex.pattern] = (patternCounts[ex.pattern] || 0) + 1;

              // If we are filtering, calculate filtered stats
              if (selectedMuscleGroupFilter !== 'all' && ex.muscleGroup === selectedMuscleGroupFilter) {
                filteredPatternCounts[ex.pattern] = (filteredPatternCounts[ex.pattern] || 0) + 1;
                filteredExerciseCounts[ex.exercise] = (filteredExerciseCounts[ex.exercise] || 0) + 1;
              }
            });
          }
        });
      }
    });
    
    const formatAndSort = (counts: { [key: string]: number }) => Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    if (selectedMuscleGroupFilter === 'all') {
      return {
        displayMode: 'all',
        chart1Data: formatAndSort(muscleCounts),
        chart2Data: formatAndSort(patternCounts),
        hasData: dataFoundInMonth
      };
    } else {
      const filteredPatterns = formatAndSort(filteredPatternCounts);
      const filteredExercises = formatAndSort(filteredExerciseCounts);
      return {
          displayMode: 'single',
          chart1Data: filteredPatterns,
          chart2Data: filteredExercises,
          hasData: filteredPatterns.length > 0 || filteredExercises.length > 0
      };
    }
  }, [plan, weeksForMonth, selectedMuscleGroupFilter]);

  const muscleGroups = Object.keys(EXERCISE_DATA);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-violet-400 flex items-center gap-3">
            <ChartPieIcon className="w-7 h-7" />
            Análisis Muscular Mensual
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            <select
              id="month-select-analysis"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="w-full sm:w-auto bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
            >
              {MONTHS.map(m => <option key={m} value={m}>Mes {m}</option>)}
            </select>
            <select
              id="group-select-analysis"
              value={selectedMuscleGroupFilter}
              onChange={e => setSelectedMuscleGroupFilter(e.target.value)}
              className="w-full sm:w-auto bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="all">Todos los Grupos</option>
              {muscleGroups.map(group => <option key={group} value={group}>{group}</option>)}
            </select>
          </div>
        </div>
        
        {analysisData.hasData ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {analysisData.displayMode === 'all' ? (
                <>
                    <BarChart 
                      data={analysisData.chart1Data}
                      title="Frecuencia por Grupo Muscular"
                      yAxisLabel="Nº de Ejercicios"
                      barColor="#8b5cf6" 
                    />
                    <BarChart 
                      data={analysisData.chart2Data}
                      title="Frecuencia por Patrón de Movimiento"
                      yAxisLabel="Nº de Ejercicios"
                      barColor="#eab308"
                    />
                </>
            ) : (
                <>
                    <BarChart 
                      data={analysisData.chart2Data}
                      title={`Frecuencia de Ejercicios en ${selectedMuscleGroupFilter}`}
                      yAxisLabel="Nº de Sesiones"
                      barColor="#eab308"
                    />
                    <BarChart 
                      data={analysisData.chart1Data}
                      title={`Frecuencia de Patrones en ${selectedMuscleGroupFilter}`}
                      yAxisLabel="Nº de Ejercicios"
                      barColor="#8b5cf6" 
                    />
                </>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-900/50 rounded-lg">
              <p className="text-gray-400 text-lg">
                {selectedMuscleGroupFilter === 'all' 
                  ? `No hay datos de entrenamiento para el Mes ${selectedMonth}.`
                  : `No hay datos para "${selectedMuscleGroupFilter}" en el Mes ${selectedMonth}.`
                }
              </p>
              <p className="text-gray-500 text-sm mt-2">Planifica tus entrenamientos para ver el análisis aquí.</p>
          </div>
        )}

      </section>
    </div>
  );
};

export default MuscleAnalysisView;
