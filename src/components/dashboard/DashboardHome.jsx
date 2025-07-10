import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DeliveryChart from "../charts/DeliveryChart";
import GeoChart from "../charts/GeoChart";
import StatusChart from "../charts/StatusChart";

const DashboardHome = () => {
  const { t } = useTranslation();
  const [currentUser, setCurrentUser] = useState(null);
  const [roleSpecificStats, setRoleSpecificStats] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
    
    // Generate role-specific statistics
    if (user && user.role) {
      generateRoleSpecificStats(user.role);
    }
  }, []);

  const generateRoleSpecificStats = (role) => {
    const stats = {
      'Administration': {
        title: "Tableau de Bord",
        subtitle: "Statistiques globales de QuickZone",
        cards: [
          { title: "Total Utilisateurs", value: "1,247", change: "+12%", color: "blue", icon: "👥" },
          { title: "Colis Reçus", value: "1,200", change: "+8%", color: "green", icon: "📦" }, // Monthly received parcels (placeholder)
          { title: "Colis Livrés", value: "950", change: "+5%", color: "purple", icon: "✅" }, // Monthly delivered parcels (placeholder)
          { title: "Expéditeurs", value: "456", change: "+15%", color: "purple", icon: "🧑‍💼" },
          { title: "Revenus Mensuels", value: "€125,430", change: "+23%", color: "orange", icon: "💰" }
        ]
      },
      'Commercial': {
        title: "Tableau de Bord Commercial",
        subtitle: "Gestion des clients et ventes",
        cards: [
          { title: "Clients Actifs", value: "234", change: "+18%", color: "blue", icon: "👥" },
          { title: "Colis de Mes Clients", value: "1,247", change: "+12%", color: "green", icon: "📦" },
          { title: "Nouveaux Clients", value: "23", change: "+25%", color: "purple", icon: "🆕" },
          { title: "Chiffre d'Affaires", value: "€45,230", change: "+19%", color: "orange", icon: "💰" }
        ]
      },
      'Finance': {
        title: "Tableau de Bord Financier",
        subtitle: "Gestion financière et comptabilité",
        cards: [
          { title: "Paiements Reçus", value: "€89,450", change: "+14%", color: "green", icon: "💳" },
          { title: "Paiements En Attente", value: "€12,340", change: "-5%", color: "orange", icon: "⏳" },
          { title: "Factures Émises", value: "156", change: "+8%", color: "blue", icon: "📄" },
          { title: "Marge Brute", value: "€23,450", change: "+22%", color: "purple", icon: "📊" }
        ]
      },
      'Chef d\'agence': {
        title: "Tableau de Bord Opérationnel",
        subtitle: "Gestion de l'agence et des équipes",
        cards: [
          { title: "Membres d'Équipe", value: "12", change: "+2", color: "blue", icon: "👥" },
          { title: "Missions Actives", value: "45", change: "+8", color: "green", icon: "🚚" },
          { title: "Colis en Traitement", value: "234", change: "+15%", color: "purple", icon: "📦" },
          { title: "Performance", value: "94%", change: "+3%", color: "orange", icon: "📈" }
        ]
      },
      'Membre de l\'agence': {
        title: "Tableau de Bord Quotidien",
        subtitle: "Activités et tâches du jour",
        cards: [
          { title: "Colis Traités", value: "45", change: "+5", color: "green", icon: "📦" },
          { title: "Tâches en Cours", value: "8", change: "-2", color: "blue", icon: "📋" },
          { title: "Réclamations", value: "3", change: "+1", color: "orange", icon: "⚠️" },
          { title: "Efficacité", value: "87%", change: "+2%", color: "purple", icon: "📊" }
        ]
      },
      'Livreurs': {
        title: "Tableau de Bord Livraison",
        subtitle: "Missions et livraisons du jour",
        cards: [
          { title: "Missions du Jour", value: "12", change: "+2", color: "blue", icon: "🚚" },
          { title: "Colis Livrés", value: "34", change: "+8", color: "green", icon: "✅" },
          { title: "En Cours", value: "6", change: "-1", color: "orange", icon: "⏳" },
          { title: "Performance", value: "96%", change: "+1%", color: "purple", icon: "📈" }
        ]
      },
      'Expéditeur': {
        title: "Tableau de Bord Client",
        subtitle: "Suivi de vos colis et paiements",
        cards: [
          { title: "Mes Colis", value: "23", change: "+3", color: "blue", icon: "📦" },
          { title: "En Transit", value: "8", change: "+2", color: "green", icon: "🚚" },
          { title: "Livrés", value: "15", change: "+1", color: "purple", icon: "✅" },
          { title: "Solde", value: "€1,250", change: "-€50", color: "orange", icon: "💰" }
        ]
      }
    };

    setRoleSpecificStats(stats[role] || stats['Administration']);
  };

  const getCardColorClasses = (color) => {
    const colors = {
      blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
      green: "bg-gradient-to-br from-green-500 to-green-600 text-white",
      purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
      orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white"
    };
    return colors[color] || colors.blue;
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-red-800">
              {roleSpecificStats.title || "Tableau de Bord"}
            </h1>
            <p className="text-red-600 mt-2 text-lg">
              {roleSpecificStats.subtitle || "Bienvenue sur QuickZone"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-red-600 font-medium">Connecté en tant que</p>
              <p className="font-bold text-red-800 text-lg">{currentUser.name}</p>
              <p className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">{currentUser.role}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {currentUser.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {roleSpecificStats.cards?.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                <div className="flex items-center">
                  <span className={`text-sm font-semibold ${
                    card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">ce mois</span>
                </div>
              </div>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCardColorClasses(card.color)} shadow-lg`}>
                <span className="text-3xl">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Performance des Livraisons
          </h3>
          <div className="h-80">
            <DeliveryChart />
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            Répartition Géographique
          </h3>
          <div className="h-80">
            <GeoChart />
          </div>
        </div>
      </div>

      {/* Status Overview - Improved Design */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Statut des Colis
        </h3>
        <div className="h-96">
          <StatusChart />
        </div>
      </div>

      {/* Quick Actions - Updated */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
              <p className="font-semibold text-gray-700 text-lg">Nouveau Colis</p>
              <p className="text-sm text-gray-500 mt-1">Créer un nouveau colis</p>
            </div>
          </button>
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👤</div>
              <p className="font-semibold text-gray-700 text-lg">Nouveau Expéditeur</p>
              <p className="text-sm text-gray-500 mt-1">Ajouter un expéditeur</p>
            </div>
          </button>
          <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</div>
              <p className="font-semibold text-gray-700 text-lg">Rapport</p>
              <p className="text-sm text-gray-500 mt-1">Générer un rapport</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 