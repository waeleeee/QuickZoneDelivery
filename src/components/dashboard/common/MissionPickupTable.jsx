import React from "react";
import DataTable from "./DataTable";

const statusColors = {
  "En attente": "bg-yellow-100 text-yellow-800",
  "Au dépôt": "bg-blue-100 text-blue-800",
  "En cours": "bg-purple-100 text-purple-800",
  "RTN dépot": "bg-orange-100 text-orange-800",
  "Livés": "bg-green-100 text-green-800",
  "Livrés payés": "bg-emerald-100 text-emerald-800",
  "Retour définitif": "bg-red-100 text-red-800",
  "RTN client agence": "bg-pink-100 text-pink-800",
  "Retour Expéditeur": "bg-gray-100 text-gray-800",
  "Retour En Cours d’expédition": "bg-indigo-100 text-indigo-800",
  "Retour reçu": "bg-cyan-100 text-cyan-800",
};

const MissionPickupTable = ({ missions, onView, onEdit, onDelete, searchTerm, onSearchChange }) => {
  const columns = [
    { key: "mission_number", header: "N° Mission" },
    { 
      key: "driver", 
      header: "Livreur",
      render: (driver) => driver?.name || "Non assigné"
    },
    { 
      key: "shipper", 
      header: "Expéditeur",
      render: (shipper) => shipper?.name || "Non assigné"
    },
    {
      key: "parcels",
      header: "Colis",
      render: (parcels) => (
        <span className="text-xs text-gray-700">{parcels?.map(c => c.id).join(", ") || "Aucun colis"}</span>
      ),
    },
    { 
      key: "scheduled_time", 
      header: "Date prévue",
      render: (date) => new Date(date).toLocaleString('fr-FR')
    },
    {
      key: "status",
      header: "Statut",
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[value] || "bg-gray-100 text-gray-800"}`}>
          {value}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={missions}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      showActions={true}
      onEdit={onEdit}
      onDelete={onDelete}
      onRowClick={onView}
    />
  );
};

export default MissionPickupTable; 