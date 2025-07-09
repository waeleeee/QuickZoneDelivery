import React from 'react';
import DeliveryChart from '../charts/DeliveryChart';
import StatusChart from '../charts/StatusChart';
import GeoChart from '../charts/GeoChart';

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-2">📊 Tableau de Bord Principal</h1>
      <p className="text-gray-600 mb-6">Bienvenue dans le système de gestion QuickZone - Vue d'ensemble complète</p>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-tr from-indigo-500 to-purple-400 text-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-80">Total Colis</div>
            <div className="text-3xl font-bold">1,847</div>
            <div className="text-xs opacity-70 mt-1">↗️ +12% ce mois</div>
          </div>
          <div className="text-2xl mt-2">📦</div>
        </div>
        <div className="bg-gradient-to-tr from-pink-400 to-pink-600 text-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-80">Livreurs Actifs</div>
            <div className="text-3xl font-bold">67</div>
            <div className="text-xs opacity-70 mt-1">↗️ +8% cette semaine</div>
          </div>
          <div className="text-2xl mt-2">🚚</div>
        </div>
        <div className="bg-gradient-to-tr from-blue-400 to-cyan-400 text-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-80">Livraisons Complétées</div>
            <div className="text-3xl font-bold">1,234</div>
            <div className="text-xs opacity-70 mt-1">↗️ +15% aujourd'hui</div>
          </div>
          <div className="text-2xl mt-2">✅</div>
        </div>
        <div className="bg-gradient-to-tr from-green-400 to-teal-300 text-white rounded-xl p-6 shadow flex flex-col justify-between">
          <div>
            <div className="text-sm opacity-80">Taux de Satisfaction</div>
            <div className="text-3xl font-bold">98.5%</div>
            <div className="text-xs opacity-70 mt-1">↗️ +2.3% ce mois</div>
          </div>
          <div className="text-2xl mt-2">⭐</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-4">📈 Évolution des Livraisons (30 derniers jours)</h3>
          <DeliveryChart />
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-4">📊 Répartition des Statuts</h3>
          <StatusChart />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-red-600 mb-4">🏆 Top Livreurs</h3>
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
          <h3 className="text-lg font-semibold text-red-600 mb-4">🕒 Activité Récente</h3>
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
          <h3 className="text-lg font-semibold text-red-600 mb-4">🗺️ Répartition Géographique</h3>
          <GeoChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h3 className="text-lg font-semibold text-red-600 mb-4">⚡ Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="py-3 px-4 bg-gradient-to-tr from-indigo-500 to-purple-400 text-white rounded-lg font-semibold hover:scale-105 transition">📦 Nouveau Colis</button>
          <button className="py-3 px-4 bg-gradient-to-tr from-pink-400 to-pink-600 text-white rounded-lg font-semibold hover:scale-105 transition">🚚 Gérer Livreurs</button>
          <button className="py-3 px-4 bg-gradient-to-tr from-blue-400 to-cyan-400 text-white rounded-lg font-semibold hover:scale-105 transition">📝 Réclamations</button>
          <button className="py-3 px-4 bg-gradient-to-tr from-green-400 to-teal-300 text-white rounded-lg font-semibold hover:scale-105 transition">💰 Rapports Financiers</button>
        </div>
      </div>
    </div>
  );
} 