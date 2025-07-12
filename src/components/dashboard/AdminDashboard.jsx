import React from 'react';
import DeliveryChart from '../charts/DeliveryChart';
import StatusChart from '../charts/StatusChart';
import GeoChart from '../charts/GeoChart';

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-2 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Tableau de Bord Principal
      </h1>
      <p className="text-gray-600 mb-6">Bienvenue dans le système de gestion QuickZone - Vue d'ensemble complète</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-400 text-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-80">Total Colis</div>
            <div className="text-3xl font-bold">1,847</div>
            <div className="text-xs opacity-70 mt-1">↗️ +12% ce mois</div>
          </div>
          <div className="mt-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div className="bg-gradient-to-tr from-pink-400 to-pink-600 text-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-80">Livreurs Actifs</div>
            <div className="text-3xl font-bold">67</div>
            <div className="text-xs opacity-70 mt-1">↗️ +8% cette semaine</div>
          </div>
          <div className="mt-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
        </div>
        <div className="bg-gradient-to-tr from-blue-400 to-cyan-400 text-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-80">Livraisons Complétées</div>
            <div className="text-3xl font-bold">1,234</div>
            <div className="text-xs opacity-70 mt-1">↗️ +15% aujourd'hui</div>
          </div>
          <div className="mt-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="bg-gradient-to-tr from-green-400 to-teal-300 text-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-80">Taux de Satisfaction</div>
            <div className="text-3xl font-bold">98.5%</div>
            <div className="text-xs opacity-70 mt-1">↗️ +2.3% ce mois</div>
          </div>
          <div className="mt-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Évolution des Livraisons (30 derniers jours)
          </h3>
          <DeliveryChart />
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Répartition des Statuts
          </h3>
          <StatusChart />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Top Livreurs
          </h3>
          <ul className="space-y-2">
            <li className="flex justify-between items-center bg-gray-50 rounded p-2">
              <span className="font-semibold flex items-center gap-2"><span className="bg-yellow-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">1</span> Marc Simon</span>
              <span className="text-green-600 font-bold">156 livraisons</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 rounded p-2">
              <span className="font-semibold flex items-center gap-2"><span className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">2</span> Laurent Girard</span>
              <span className="text-green-600 font-bold">142 livraisons</span>
            </li>
            <li className="flex justify-between items-center bg-gray-50 rounded p-2">
              <span className="font-semibold flex items-center gap-2"><span className="bg-yellow-700 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold">3</span> Ahmed Ben Salem</span>
              <span className="text-green-600 font-bold">128 livraisons</span>
            </li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activité Récente
          </h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 border-l-4 border-green-500 pl-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Colis #1234567890 livré <span className="text-gray-400 text-xs">Il y a 5 minutes</span></span>
            </li>
            <li className="flex items-center gap-2 border-l-4 border-yellow-400 pl-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span>Nouveau livreur ajouté <span className="text-gray-400 text-xs">Il y a 15 minutes</span></span>
            </li>
            <li className="flex items-center gap-2 border-l-4 border-blue-500 pl-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Réclamation résolue <span className="text-gray-400 text-xs">Il y a 1 heure</span></span>
            </li>
            <li className="flex items-center gap-2 border-l-4 border-red-500 pl-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Colis retourné <span className="text-gray-400 text-xs">Il y a 2 heures</span></span>
            </li>
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Répartition Géographique
          </h3>
          <GeoChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="py-3 px-4 bg-gradient-to-tr from-indigo-500 to-purple-400 text-white rounded-lg font-semibold hover:scale-105 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Nouveau Colis
          </button>
          <button className="py-3 px-4 bg-gradient-to-tr from-pink-400 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Gérer Livreurs
          </button>
          <button className="py-3 px-4 bg-gradient-to-tr from-blue-400 to-cyan-400 text-white rounded-lg font-semibold hover:scale-105 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Réclamations
          </button>
          <button className="py-3 px-4 bg-gradient-to-tr from-green-400 to-teal-300 text-white rounded-lg font-semibold hover:scale-105 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rapports Financiers
          </button>
        </div>
      </div>
    </div>
  );
} 