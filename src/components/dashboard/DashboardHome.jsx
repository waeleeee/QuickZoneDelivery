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

  // Function to render professional SVG icons
  const renderIcon = (iconType) => {
    const iconSize = "w-8 h-8";
    
    switch (iconType) {
      case "users":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case "package":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case "check":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "business":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "money":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "new":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case "card":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "clock":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "document":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "chart":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "truck":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case "clipboard":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case "warning":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case "trending":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const generateRoleSpecificStats = (role) => {
    const stats = {
      'Administration': {
        title: "Tableau de Bord",
        subtitle: "Statistiques globales de QuickZone",
        cards: [
          { title: "Total Utilisateurs", value: "1,247", change: "+12%", color: "blue", icon: "users" },
          { title: "Colis Reçus", value: "1,200", change: "+8%", color: "green", icon: "package" },
          { title: "Colis Livrés", value: "950", change: "+5%", color: "purple", icon: "check" },
          { title: "Expéditeurs", value: "456", change: "+15%", color: "purple", icon: "business" },
          { title: "Revenus Mensuels", value: "€125,430", change: "+23%", color: "orange", icon: "money" }
        ]
      },
      'Commercial': {
        title: "Tableau de Bord Commercial",
        subtitle: "Gestion des clients, paiements et réclamations",
        cards: [
          { title: "Clients Actifs", value: "234", change: "+18%", color: "blue", icon: "users" },
          { title: "Paiements Reçus", value: "€45,230", change: "+19%", color: "green", icon: "card" },
          { title: "Réclamations", value: "12", change: "-5%", color: "orange", icon: "warning" },
          { title: "Nouveaux Clients", value: "23", change: "+25%", color: "purple", icon: "new" }
        ]
      },
      'Finance': {
        title: "Tableau de Bord Financier",
        subtitle: "Gestion financière et comptabilité",
        cards: [
          { title: "Paiements Reçus", value: "€89,450", change: "+14%", color: "green", icon: "card" },
          { title: "Paiements En Attente", value: "€12,340", change: "-5%", color: "orange", icon: "clock" },
          { title: "Factures Émises", value: "156", change: "+8%", color: "blue", icon: "document" },
          { title: "Marge Brute", value: "€23,450", change: "+22%", color: "purple", icon: "chart" }
        ]
      },
      'Chef d\'agence': {
        title: "Tableau de Bord Opérationnel",
        subtitle: "Gestion de l'agence et des équipes",
        cards: [
          { title: "Membres d'Équipe", value: "12", change: "+2", color: "blue", icon: "users" },
          { title: "Missions Actives", value: "45", change: "+8", color: "green", icon: "truck" },
          { title: "Colis en Traitement", value: "234", change: "+15%", color: "purple", icon: "package" },
          { title: "Performance", value: "94%", change: "+3%", color: "orange", icon: "trending" }
        ]
      },
      'Membre de l\'agence': {
        title: "Tableau de Bord Quotidien",
        subtitle: "Activités et tâches du jour",
        cards: [
          { title: "Colis Traités", value: "45", change: "+5", color: "green", icon: "package" },
          { title: "Tâches en Cours", value: "8", change: "-2", color: "blue", icon: "clipboard" },
          { title: "Réclamations", value: "3", change: "+1", color: "orange", icon: "warning" },
          { title: "Efficacité", value: "87%", change: "+2%", color: "purple", icon: "chart" }
        ]
      },
      'Livreurs': {
        title: "Tableau de Bord Livraison",
        subtitle: "Missions et livraisons du jour",
        cards: [
          { title: "Missions du Jour", value: "12", change: "+2", color: "blue", icon: "truck" },
          { title: "Colis Livrés", value: "34", change: "+8", color: "green", icon: "check" },
          { title: "En Cours", value: "6", change: "-1", color: "orange", icon: "clock" },
          { title: "Performance", value: "96%", change: "+1%", color: "purple", icon: "trending" }
        ]
      },
      'Expéditeur': {
        title: "Tableau de Bord Client",
        subtitle: "Suivi de vos colis et paiements",
        cards: [
          { title: "Mes Colis", value: "23", change: "+3", color: "blue", icon: "package" },
          { title: "En Transit", value: "8", change: "+2", color: "green", icon: "truck" },
          { title: "Livrés", value: "15", change: "+1", color: "purple", icon: "check" },
          { title: "Solde", value: "€1,250", change: "-€50", color: "orange", icon: "money" },
          { title: "Réclamations", value: "2", change: "-1", color: "red", icon: "warning" }
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
      orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
      red: "bg-gradient-to-br from-red-500 to-red-600 text-white"
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
                {renderIcon(card.icon)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Role-specific */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Chart - Role-specific */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {currentUser?.role === 'Commercial' ? 'Évolution des Clients' : 'Performance des Livraisons'}
          </h3>
          <div className="h-80">
            <DeliveryChart />
          </div>
        </div>

        {/* Second Chart - Role-specific */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {currentUser?.role === 'Commercial' ? 'Répartition des Clients' : 'Répartition Géographique'}
          </h3>
          <div className="h-80">
            <GeoChart />
          </div>
        </div>
      </div>

      {/* Status Overview - Role-specific */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {currentUser?.role === 'Commercial' ? 'Statut des Paiements' : 'Statut des Colis'}
        </h3>
        <div className="h-96">
          <StatusChart />
        </div>
      </div>

      {/* Quick Actions - Role-specific */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentUser?.role === 'Commercial' ? (
            <>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Nouveau Client</p>
                  <p className="text-sm text-gray-500 mt-1">Ajouter un expéditeur</p>
                </div>
              </button>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Paiements</p>
                  <p className="text-sm text-gray-500 mt-1">Gérer les paiements</p>
                </div>
              </button>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-orange-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Réclamations</p>
                  <p className="text-sm text-gray-500 mt-1">Gérer les réclamations</p>
                </div>
              </button>
            </>
          ) : currentUser?.role === 'Expéditeur' ? (
            <>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Nouveau Colis</p>
                  <p className="text-sm text-gray-500 mt-1">Créer un nouveau colis</p>
                </div>
              </button>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Suivre Colis</p>
                  <p className="text-sm text-gray-500 mt-1">Suivre mes colis</p>
                </div>
              </button>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Mes Paiements</p>
                  <p className="text-sm text-gray-500 mt-1">Voir mes paiements</p>
                </div>
              </button>
            </>
          ) : (
            <>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Nouveau Colis</p>
                  <p className="text-sm text-gray-500 mt-1">Créer un nouveau colis</p>
                </div>
              </button>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Nouveau Expéditeur</p>
                  <p className="text-sm text-gray-500 mt-1">Ajouter un expéditeur</p>
                </div>
              </button>
              <button className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Rapport</p>
                  <p className="text-sm text-gray-500 mt-1">Générer un rapport</p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 