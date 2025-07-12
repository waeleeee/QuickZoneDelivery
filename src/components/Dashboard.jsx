import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { hasAccess } from "../config/permissions.jsx";
import DashboardHome from "./dashboard/DashboardHome";
import Administration from "./dashboard/Administration";
import Commercial from "./dashboard/Commercial";
import Finance from "./dashboard/Finance";
import ChefAgence from "./dashboard/ChefAgence";
import MembreAgence from "./dashboard/MembreAgence";
import MembreAgenceManagement from "./dashboard/MembreAgenceManagement";
import Livreurs from "./dashboard/Livreurs";
import LivreurDashboard from "./dashboard/LivreurDashboard";
import Expediteur from "./dashboard/Expediteur";
import Colis from "./dashboard/Colis";
import ColisClient from "./dashboard/ColisClient";
import Pickup from "./dashboard/Pickup";
import Secteurs from "./dashboard/Secteurs";
import Entrepots from "./dashboard/Entrepots";
import PaimentExpediteur from "./dashboard/PaimentExpediteur";
import CommercialPayments from "./dashboard/CommercialPayments";
import ClientPayments from "./dashboard/ClientPayments";
import Reclamation from "./dashboard/Reclamation";

const Dashboard = ({ selectedKey = "dashboard" }) => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return user;
  });

  // Check if user has access to the selected module
  const checkAccess = (module, subModule = null) => {
    if (!currentUser || !currentUser.role) {
      return false;
    }
    return hasAccess(currentUser.role, module, subModule);
  };

  const renderContent = () => {
    // Dashboard home - accessible to all roles
    if (selectedKey === "dashboard") {
      // Show specialized dashboards for specific roles
      if (currentUser?.role === "Livreurs") {
        return <LivreurDashboard />;
      }
      if (currentUser?.role === "Membre de l'agence") {
        return <MembreAgence />;
      }
      return <DashboardHome />;
    }

    // Personnel management - check specific sub-module access
    if (selectedKey === "administration" && checkAccess("personnel", "administration")) {
      return <Administration />;
    }
    if (selectedKey === "commercial" && checkAccess("personnel", "commercial")) {
      return <Commercial />;
    }
    if (selectedKey === "finance" && checkAccess("personnel", "finance")) {
      return <Finance />;
    }
    if (selectedKey === "chef_agence" && checkAccess("personnel", "chef_agence")) {
      return <ChefAgence />;
    }
    if (selectedKey === "membre_agence" && checkAccess("personnel", "membre_agence")) {
      // Admin and Chef d'agence get the management component, Membre de l'agence gets their dashboard
      if (currentUser?.role === "Administration" || currentUser?.role === "Admin" || currentUser?.role === "Chef d'agence") {
        return <MembreAgenceManagement />;
      } else {
        return <MembreAgence />;
      }
    }
    if (selectedKey === "livreurs" && checkAccess("personnel", "livreurs")) {
      return <Livreurs />;
    }

    // Main modules - check module access
    if (selectedKey === "expediteur" && checkAccess("expediteur")) {
      return <Expediteur />;
    }
    if (selectedKey === "colis" && checkAccess("colis")) {
      // Use specialized component for Expéditeur role
      if (currentUser?.role === "Expéditeur") {
        return <ColisClient />;
      }
      return <Colis />;
    }
    if (selectedKey === "pickup" && checkAccess("pickup")) {
      return <Pickup />;
    }
    if (selectedKey === "secteurs" && checkAccess("secteurs")) {
      return <Secteurs />;
    }
    if (selectedKey === "entrepots" && checkAccess("entrepots")) {
      return <Entrepots />;
    }
    if (selectedKey === "paiment_expediteur" && checkAccess("paiment_expediteur")) {
      if (currentUser?.role === "Commercial") {
        return <CommercialPayments />;
      }
      if (currentUser?.role === "Expéditeur") {
        return <ClientPayments />;
      }
      return <PaimentExpediteur />;
    }
    if (selectedKey === "reclamation" && checkAccess("reclamation")) {
      return <Reclamation />;
    }

    // If no access or invalid selection, show access denied or redirect
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Refusé</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retour au Tableau de Bord
          </button>
        </div>
      </div>
    );
  };

  return renderContent();
};

export default Dashboard; 