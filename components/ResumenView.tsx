
import React, { useState, useMemo } from 'react';
import type { WorkoutPlan } from '../types';
import { MONTHS, WEEKS, DAYS } from '../constants';

interface ResumenViewProps {
  plan: WorkoutPlan;
}

const ResumenView: React.FC<ResumenViewProps> = ({ plan }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(MONTHS[0]);

  const weeksForMonth = useMemo(() => {
    return WEEKS.filter(w => Math.ceil(w / (52 / 12)) === selectedMonth);
  }, [selectedMonth]);

  const hasContentForMonth = useMemo(() => {
    return weeksForMonth.some(week => {
      const weeklyPlan = plan[week];
      return weeklyPlan && DAYS.some(day => weeklyPlan[day]?.exercises?.length > 0);
    });
  }, [plan, weeksForMonth]);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">Resumen Mensual</h2>
          <div>
            <label htmlFor="month-select" className="sr-only">Seleccionar Mes</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="w-full sm:w-auto bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500 mt-2 sm:mt-0"
            >
              {MONTHS.map(m => <option key={m} value={m}>Mes {m}</option>)}
            </select>
          </div>
        </div>
      </section>

      {hasContentForMonth ? weeksForMonth.map(week => {
        const weeklyPlan = plan[week];
        if (!weeklyPlan) return null;

        const hasExercisesThisWeek = DAYS.some(day => weeklyPlan[day]?.exercises?.length > 0);
        if (!hasExercisesThisWeek) return null;

        return (
          <section key={week} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">Semana {week}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DAYS.map(day => {
                const dayPlan = weeklyPlan[day];
                if (!dayPlan || dayPlan.exercises.length === 0) {
                  if (!dayPlan || dayPlan.didNotTrain) {
                    return (
                       <div key={day} className="bg-gray-700/50 p-4 rounded-md opacity-60">
                          <h4 className="font-bold text-gray-400">Día {day}</h4>
                          <p className="text-gray-500 text-sm italic mt-2">Día no entrenado.</p>
                      </div>
                    )
                  }
                  return (
                    <div key={day} className="bg-gray-700/50 p-4 rounded-md">
                        <h4 className="font-bold text-gray-400">Día {day}</h4>
                        <p className="text-gray-500 text-sm italic mt-2">Día de descanso.</p>
                    </div>
                  );
                }

                return (
                  <div key={day} className="bg-gray-700/50 p-4 rounded-md">
                    <h4 className="font-bold text-gray-200 mb-2">Día {day}</h4>
                    <ul className="space-y-2">
                      {dayPlan.exercises.map(ex => (
                        <li key={ex.id} className="text-sm">
                          <span className="font-semibold text-white">{ex.exercise}</span>
                          <br />
                          <span className="text-xs text-yellow-400">{ex.muscleGroup} &gt; {ex.pattern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      }) : (
        <div className="text-center py-10 bg-gray-800 rounded-lg">
            <p className="text-gray-400">No hay ejercicios planificados para este mes.</p>
            <p className="text-gray-500 text-sm mt-2">Ve a la pestaña "Planificador" para armar tu rutina.</p>
        </div>
       )}
    </div>
  );
};

export default ResumenView;
