import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['Livés', 'Livrés payés', 'En cours', 'En attente', 'Au dépôt', 'RTN dépot', 'Retour définitif', 'RTN client agence', 'Retour Expéditeur', 'Retour En Cours d\'expédition', 'Retour reçu'],
  datasets: [
    {
      data: [30, 25, 15, 10, 8, 5, 3, 2, 1, 1, 0],
      backgroundColor: [
        '#10b981', // Livés - green
        '#059669', // Livrés payés - emerald
        '#8b5cf6', // En cours - purple
        '#f59e0b', // En attente - yellow
        '#3b82f6', // Au dépôt - blue
        '#f97316', // RTN dépot - orange
        '#ef4444', // Retour définitif - red
        '#ec4899', // RTN client agence - pink
        '#6b7280', // Retour Expéditeur - gray
        '#6366f1', // Retour En Cours d'expédition - indigo
        '#06b6d4', // Retour reçu - cyan
      ],
      borderWidth: 0,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          size: 16, // Increased font size
          weight: 'bold' // Make it bold
        }
      },
    },
  },
};

export default function StatusChart() {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
} 