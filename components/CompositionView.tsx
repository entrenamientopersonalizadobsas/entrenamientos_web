import React, { useState, useEffect, useMemo } from 'react';
import type { CompositionLog, CompositionRecord } from '../types';
import { MONTHS } from '../constants';
import BarChart from './BarChart';
import LineChart from './LineChart';
import { BodyIcon } from './icons';

interface CompositionViewProps {
    log: CompositionLog;
    updateLog: (record: CompositionRecord) => void;
}

const PERIMETER_METRICS: { [key: string]: string } = {
    'antebrazoIzq': 'Antebrazo Izq.',
    'antebrazoDer': 'Antebrazo Der.',
    'bicepsIzq': 'Bíceps Izq.',
    'bicepsDer': 'Bíceps Der.',
    'hombros': 'Hombros',
    'pecho': 'Pecho',
    'espalda': 'Espalda',
    'cintura': 'Cintura',
    'gluteo': 'Glúteo',
    'musloIzq': 'Muslo Izq.',
    'musloDer': 'Muslo Der.',
    'gemeloIzq': 'Gemelo Izq.',
    'gemeloDer': 'Gemelo Der.',
};

const COMPOSITION_METRICS: { [key: string]: string } = {
    'grasa': '% Grasa',
    'muscular': '% Muscular',
    'oseo': '% Óseo',
};

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];


const CompositionView: React.FC<CompositionViewProps> = ({ log, updateLog }) => {
    const currentYear = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(currentYear);

    const [localRecord, setLocalRecord] = useState<CompositionRecord>(() => {
        return log[selectedYear]?.[selectedMonth] || {
            month: selectedMonth,
            year: selectedYear,
            perimeters: Object.fromEntries(Object.keys(PERIMETER_METRICS).map(k => [k, ''])),
            composition: Object.fromEntries(Object.keys(COMPOSITION_METRICS).map(k => [k, '']))
        };
    });
    
    const [selectedPerimeterMetric, setSelectedPerimeterMetric] = useState<string>('bicepsDer');

    useEffect(() => {
        const record = log[selectedYear]?.[selectedMonth] || {
            month: selectedMonth,
            year: selectedYear,
            perimeters: Object.fromEntries(Object.keys(PERIMETER_METRICS).map(k => [k, ''])),
            composition: Object.fromEntries(Object.keys(COMPOSITION_METRICS).map(k => [k, '']))
        };
        setLocalRecord(JSON.parse(JSON.stringify(record)));
    }, [selectedMonth, selectedYear, log]);

    const handleInputChange = (type: 'perimeters' | 'composition', key: string, value: string) => {
        const numericValue = value === '' ? '' : parseFloat(value);
        if (value !== '' && isNaN(numericValue as number)) return;

        setLocalRecord(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [key]: numericValue,
            },
        }));
    };

    const handleSave = () => {
        updateLog(localRecord);
        alert('Datos guardados exitosamente!');
    };
    
    const createYearlyBarChartData = (metricKey: string, year: number) => {
        const yearData = log[year];
        if (!yearData) return [];
        
        const recordsForYear: CompositionRecord[] = Object.values(yearData);
        recordsForYear.sort((a, b) => a.month - b.month);

        const dataForChart: { label: string; value: number }[] = [];

        recordsForYear.forEach(record => {
            const value = record.perimeters[metricKey];
            if (value !== '' && typeof value === 'number' && value > 0) {
                dataForChart.push({
                    label: MONTH_NAMES[record.month - 1],
                    value: value,
                });
            }
        });
        return dataForChart;
    }

    const perimeterBarChartData = useMemo(() => {
        if (!selectedPerimeterMetric) return [];
        return createYearlyBarChartData(selectedPerimeterMetric, selectedYear);
    }, [log, selectedPerimeterMetric, selectedYear]);
    
    const compositionLineChartData = useMemo(() => {
        const yearData = log[selectedYear];
        if (!yearData) return [];

        const recordsForYear: CompositionRecord[] = Object.values(yearData);
        recordsForYear.sort((a, b) => a.month - b.month);

        const dataPoints: { [key: string]: { x: number, y: number }[] } = {
            grasa: [],
            muscular: [],
            oseo: [],
        };

        recordsForYear.forEach(record => {
            Object.keys(COMPOSITION_METRICS).forEach(key => {
                const value = record.composition[key];
                 if (value !== '' && typeof value === 'number' && value > 0) {
                    dataPoints[key].push({ x: record.month, y: value });
                }
            })
        });
        
        return [
            { name: '% Grasa', data: dataPoints.grasa, color: '#ef4444' },
            { name: '% Muscular', data: dataPoints.muscular, color: '#22c55e' },
            { name: '% Óseo', data: dataPoints.oseo, color: '#3b82f6' }
        ];
    }, [log, selectedYear]);


    return (
        <div className="p-4 md:p-8 space-y-8">
            <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center gap-3"><BodyIcon /> Registro de Composición</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Mes de Registro</label>
                        <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500">
                            {MONTHS.map(m => <option key={m} value={m}>Mes {m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Año de Registro/Análisis</label>
                        <input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500" />
                    </div>
                    <div className="md:col-start-3 flex items-end">
                        <button onClick={handleSave} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                            Guardar Mes Actual
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-gray-800 p-6 rounded-lg shadow-lg grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-300">Perímetros Musculares (cm)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(PERIMETER_METRICS).map(([key, label]) => (
                            <div key={key}>
                                <label htmlFor={`p-${key}`} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
                                <input id={`p-${key}`} type="number" value={localRecord.perimeters[key] || ''} onChange={e => handleInputChange('perimeters', key, e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm focus:ring-yellow-500 focus:border-yellow-500" />
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-300">Composición Corporal (%)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                         {Object.entries(COMPOSITION_METRICS).map(([key, label]) => (
                            <div key={key}>
                                <label htmlFor={`c-${key}`} className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
                                <input id={`c-${key}`} type="number" value={localRecord.composition[key] || ''} onChange={e => handleInputChange('composition', key, e.target.value)} className="w-full bg-gray-700 border-gray-600 rounded-md p-2 text-sm focus:ring-yellow-500 focus:border-yellow-500" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">Evolución Anual ({selectedYear})</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                         <BarChart
                            data={perimeterBarChartData}
                            title={`Evolución de ${PERIMETER_METRICS[selectedPerimeterMetric] || ''}`}
                            yAxisLabel="cm"
                            barColor="#eab308"
                        />
                         <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                            <label htmlFor="perimeter-metric-select" className="block font-semibold mb-2 text-gray-300">Seleccionar Perímetro:</label>
                            <select
                                id="perimeter-metric-select"
                                value={selectedPerimeterMetric}
                                onChange={e => setSelectedPerimeterMetric(e.target.value)}
                                className="w-full bg-gray-700 border-gray-600 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
                            >
                                {Object.entries(PERIMETER_METRICS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <LineChart
                            series={compositionLineChartData}
                            title="Evolución de Composición Corporal"
                            yAxisLabel="%"
                            xAxisMax={12}
                            xAxisLabel="Meses"
                        />
                    </div>
                </div>
            </section>

        </div>
    )
};

export default CompositionView;