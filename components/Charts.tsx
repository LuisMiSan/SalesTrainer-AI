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
                labels: ['Confianza', 'Claridad', 'Empatía', 'Persuasión', 'Tono'],
                datasets: [{
                    label: 'Actual',
                    data: scores,
                    backgroundColor: 'rgba(19, 164, 236, 0.2)',
                    borderColor: '#13a4ec',
                    pointBackgroundColor: '#13a4ec',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#13a4ec',
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
                        angleLines: { display: false },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        pointLabels: {
                            font: {
                                size: 11,
                                family: 'Manrope'
                            },
                            color: '#617C89'
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
                        borderColor: '#2C3E50', // Dark Blue (Screenshot match)
                        backgroundColor: '#2C3E50',
                        borderWidth: 4,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Claridad',
                        data: clarityData,
                        borderColor: '#2ECC71', // Green (Screenshot match)
                        backgroundColor: '#2ECC71',
                        borderWidth: 4,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Empatía',
                        data: empathyData,
                        borderColor: '#3498DB', // Light Blue (Screenshot match)
                        backgroundColor: '#3498DB',
                        borderWidth: 4,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
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
                        display: false, 
                        min: 40,
                        max: 100 
                    },
                    x: { 
                        grid: { display: false }, 
                        border: { display: false },
                        ticks: { display: false }
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