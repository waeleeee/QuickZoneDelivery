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
        title: "Vue d'ensemble du système",
        subtitle: "Statistiques globales de QuickZone",
        cards: [
          { title: "Total Utilisateurs", value: "1,247", change: "+12%", color: "blue" },
          { title: "Colis Actifs", value: "8,934", change: "+8%", color: "green" },
          { title: "Expéditeurs", value: "456", change: "+15%", color: "purple" },
          { title: "Revenus Mensuels", value: "€125,430", change: "+23%", color: "orange" }
        ]
      },
      'Commercial': {
        title: "Tableau de Bord Commercial",
        subtitle: "Gestion des clients et ventes",
        cards: [
          { title: "Clients Actifs", value: "234", change: "+18%", color: "blue" },
          { title: "Colis de Mes Clients", value: "1,247", change: "+12%", color: "green" },
          { title: "Nouveaux Clients", value: "23", change: "+25%", color: "purple" },
          { title: "Chiffre d'Affaires", value: "€45,230", change: "+19%", color: "orange" }
        ]
      },
      'Finance': {
        title: "Tableau de Bord Financier",
        subtitle: "Gestion financière et comptabilité",
        cards: [
          { title: "Paiements Reçus", value: "€89,450", change: "+14%", color: "green" },
          { title: "Paiements En Attente", value: "€12,340", change: "-5%", color: "orange" },
          { title: "Factures Émises", value: "156", change: "+8%", color: "blue" },
          { title: "Marge Brute", value: "€23,450", change: "+22%", color: "purple" }
        ]
      },
      'Chef d\'agence': {
        title: "Tableau de Bord Opérationnel",
        subtitle: "Gestion de l'agence et des équipes",
        cards: [
          { title: "Membres d'Équipe", value: "12", change: "+2", color: "blue" },
          { title: "Missions Actives", value: "45", change: "+8", color: "green" },
          { title: "Colis en Traitement", value: "234", change: "+15%", color: "purple" },
          { title: "Performance", value: "94%", change: "+3%", color: "orange" }
        ]
      },
      'Membre de l\'agence': {
        title: "Tableau de Bord Quotidien",
        subtitle: "Activités et tâches du jour",
        cards: [
          { title: "Colis Traités", value: "45", change: "+5", color: "green" },
          { title: "Tâches en Cours", value: "8", change: "-2", color: "blue" },
          { title: "Réclamations", value: "3", change: "+1", color: "orange" },
          { title: "Efficacité", value: "87%", change: "+2%", color: "purple" }
        ]
      },
      'Livreurs': {
        title: "Tableau de Bord Livraison",
        subtitle: "Missions et livraisons du jour",
        cards: [
          { title: "Missions du Jour", value: "12", change: "+2", color: "blue" },
          { title: "Colis Livrés", value: "34", change: "+8", color: "green" },
          { title: "En Cours", value: "6", change: "-1", color: "orange" },
          { title: "Performance", value: "96%", change: "+1%", color: "purple" }
        ]
      },
      'Expéditeur': {
        title: "Tableau de Bord Client",
        subtitle: "Suivi de vos colis et paiements",
        cards: [
          { title: "Mes Colis", value: "23", change: "+3", color: "blue" },
          { title: "En Transit", value: "8", change: "+2", color: "green" },
          { title: "Livrés", value: "15", change: "+1", color: "purple" },
          { title: "Solde", value: "€1,250", change: "-€50", color: "orange" }
        ]
      }
    };

    setRoleSpecificStats(stats[role] || stats['Administration']);
  };

  const getCardColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-500 text-white",
      green: "bg-green-500 text-white",
      purple: "bg-purple-500 text-white",
      orange: "bg-orange-500 text-white"
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
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {roleSpecificStats.title || "Tableau de Bord"}
            </h1>
            <p className="text-gray-600 mt-1">
              {roleSpecificStats.subtitle || "Bienvenue sur QuickZone"}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Connecté en tant que</p>
              <p className="font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
              {currentUser.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roleSpecificStats.cards?.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getCardColorClasses(card.color)}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change}
              </span>
              <span className="text-sm text-gray-600 ml-1">vs mois dernier</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des Livraisons</h3>
          <div className="h-64">
            <DeliveryChart />
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition Géographique</h3>
          <div className="h-64">
            <GeoChart />
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut des Colis</h3>
        <div className="h-64">
          <StatusChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <p className="font-medium text-gray-700">Nouveau Colis</p>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <p className="font-medium text-gray-700">Nouveau Client</p>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-gray-700">Rapport</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 