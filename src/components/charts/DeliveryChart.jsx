import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

const data = {
  labels: ['1 Jan', '5 Jan', '10 Jan', '15 Jan', '20 Jan', '25 Jan', '30 Jan'],
  datasets: [
    {
      label: 'Livraisons',
      data: [45, 52, 48, 67, 73, 89, 95],
      borderColor: '#dc2626',
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      tension: 0.4,
      fill: true,
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

export default function DeliveryChart() {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <Line data={data} options={options} />
    </div>
  );
} 