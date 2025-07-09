import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const data = {
  labels: ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Nabeul'],
  datasets: [
    {
      label: 'Livraisons',
      data: [450, 320, 280, 180, 150],
      backgroundColor: [
        '#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'
      ],
      borderRadius: 8,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
    x: { grid: { display: false } },
  },
};

export default function GeoChart() {
  return (
    <div style={{ width: '100%', height: 250 }}>
      <Bar data={data} options={options} />
    </div>
  );
} 