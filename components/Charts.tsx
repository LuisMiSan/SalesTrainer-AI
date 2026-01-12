import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface BarChartProps {
    data: number[];
    labels: string[];
}

export const WeeklyBarChart: React.FC<BarChartProps> = ({ data, labels }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, '#13a4ec');
        gradient.addColorStop(1, 'rgba(19, 164, 236, 0.2)');

        const config: ChartConfiguration = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Puntaje',
                    data: data,
                    backgroundColor: '#13a4ec',
                    borderRadius: 4,
                    barThickness: 12,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    y: { display: false, min: 0, max: 100 },
                    x: { grid: { display: false }, border: { display: false } }
                }
            }
        };

        chartRef.current = new Chart(ctx, config);

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, labels]);

    return <canvas ref={canvasRef} />;
};

interface RadarChartProps {
    scores: number[]; // [Confianza, Claridad, Empatía, Persuasión, Tono]
}

export const SkillsRadarChart: React.FC<RadarChartProps> = ({ scores }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const config: ChartConfiguration = {
            type: 'radar',
            data: {
                // Labels matching the provided image explicitly
                labels: ['Confianza', 'Claridad', 'Empatía', 'Persuasión', 'Tono'],
                datasets: [{
                    label: 'Habilidades',
                    data: scores,
                    backgroundColor: 'rgba(56, 189, 248, 0.2)', // Light Blue fill
                    borderColor: '#38bdf8', // Light Blue border
                    pointBackgroundColor: '#38bdf8',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#38bdf8',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    r: {
                        angleLines: { display: true, color: '#f1f5f9' },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { display: false, stepSize: 20 },
                        grid: { color: '#e2e8f0' },
                        pointLabels: {
                            font: {
                                size: 12,
                                family: 'Manrope',
                                weight: '500'
                            },
                            color: '#1e293b' // Darker text for readability
                        }
                    }
                }
            }
        };

        chartRef.current = new Chart(ctx, config);

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [scores]);

    return <canvas ref={canvasRef} />;
};

interface EvolutionChartProps {
    labels: string[];
    confidenceData: number[];
    clarityData: number[];
    empathyData: number[];
}

export const EvolutionLineChart: React.FC<EvolutionChartProps> = ({ labels, confidenceData, clarityData, empathyData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const config: ChartConfiguration = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Confianza',
                        data: confidenceData,
                        borderColor: '#22d3ee', // Cyan-400 (Matches image Blue-ish Cyan)
                        backgroundColor: 'rgba(34, 211, 238, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Claridad',
                        data: clarityData,
                        borderColor: '#34d399', // Emerald-400 (Matches image Green)
                        backgroundColor: 'rgba(52, 211, 153, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Empatía',
                        data: empathyData,
                        borderColor: '#fbbf24', // Amber-400 (Matches image Orange/Yellow)
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }, // Legend is custom rendered in parent to match UI
                    tooltip: { 
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#101C22',
                        bodyColor: '#617C89',
                        borderColor: '#E2E8F0',
                        borderWidth: 1,
                        padding: 10,
                        bodyFont: { size: 12, family: 'Manrope' },
                        titleFont: { size: 13, family: 'Manrope', weight: 'bold' }
                    }
                },
                scales: {
                    y: { 
                        display: true, 
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0,0,0,0.05)', tickLength: 0 },
                        border: { display: false },
                        ticks: { font: { size: 10 }, color: '#94A3B8', stepSize: 10 }
                    },
                    x: { 
                        grid: { display: true, color: 'rgba(0,0,0,0.05)', tickLength: 0 }, 
                        border: { display: false },
                        ticks: { font: { size: 10 }, color: '#94A3B8' }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                elements: {
                    line: {
                        capBezierPoints: true
                    }
                }
            }
        };

        chartRef.current = new Chart(ctx, config);

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [labels, confidenceData, clarityData, empathyData]);

    return <canvas ref={canvasRef} />;
};