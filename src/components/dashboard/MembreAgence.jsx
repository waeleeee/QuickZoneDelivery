import React, { useState, useEffect } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";

// List of Tunisian governorates
const gouvernorats = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", 
  "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine", 
  "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", 
  "Tozeur", "Tunis", "Zaghouan"
];

// Mock data for missions and alerts
const mockMissions = [
  {
    id: "MIS001",
    livreur: "Marc Simon",
    livreurId: "LIV001",
    expediteur: "Expéditeur A",
    address: "12 rue de Paris, 75001 Paris",
    status: "En cours",
    parcels: 3,
    scheduledTime: "2024-06-10 09:00",
    lastUpdate: "2024-06-10 08:30",
    alerts: [
      { type: "status_change", message: "Mission démarrée", time: "08:30", severity: "info" },
      { type: "parcel_accepted", message: "Colis COL001 accepté", time: "08:35", severity: "success" }
    ]
  },
  {
    id: "MIS002",
    livreur: "Ahmed Ben Ali",
    livreurId: "LIV002",
    expediteur: "Expéditeur B",
    address: "8 avenue de Lyon, 69001 Lyon",
    status: "En attente",
    parcels: 2,
    scheduledTime: "2024-06-10 10:00",
    lastUpdate: "2024-06-10 09:15",
    alerts: [
      { type: "parcel_refused", message: "Colis COL003 refusé - Adresse incorrecte", time: "09:15", severity: "warning" }
    ]
  },
  {
    id: "MIS003",
    livreur: "Sarah Mathlouthi",
    livreurId: "LIV003",
    expediteur: "Expéditeur C",
    address: "25 boulevard Central, 13000 Marseille",
    status: "Livrés",
    parcels: 4,
    scheduledTime: "2024-06-09 14:00",
    lastUpdate: "2024-06-09 15:30",
    alerts: [
      { type: "mission_completed", message: "Mission terminée avec succès", time: "15:30", severity: "success" }
    ]
  }
];

const mockLivreurs = [
  { id: "LIV001", name: "Marc Simon", phone: "+216 71 234 567", status: "Disponible" },
  { id: "LIV002", name: "Ahmed Ben Ali", phone: "+216 71 345 678", status: "En mission" },
  { id: "LIV003", name: "Sarah Mathlouthi", phone: "+216 71 456 789", status: "Disponible" },
  { id: "LIV004", name: "Pierre Dubois", phone: "+216 71 567 890", status: "Disponible" }
];

const statusBadge = (status) => {
  const colorMap = {
    "En attente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "En cours": "bg-blue-100 text-blue-800 border-blue-300",
    "Livrés": "bg-green-100 text-green-800 border-green-300",
    "Problème": "bg-red-100 text-red-800 border-red-300",
    "Disponible": "bg-green-100 text-green-800 border-green-300",
    "En mission": "bg-blue-100 text-blue-800 border-blue-300",
  };
  return <span className={`inline-block px-2 py-1 rounded-full border text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>{status}</span>;
};

const alertBadge = (severity) => {
  const colorMap = {
    "info": "bg-blue-100 text-blue-800 border-blue-300",
    "success": "bg-green-100 text-green-800 border-green-300",
    "warning": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "error": "bg-red-100 text-red-800 border-red-300",
  };
  return colorMap[severity] || colorMap.info;
};

const MembreAgence = () => {
  // Read-only member data for viewing only
  const [members] = useState([
    {
      id: "MEM001",
      name: "Pierre Dubois",
      email: "pierre.membre@email.com",
      phone: "+33 1 23 45 67 89",
      address: "12 Rue de Paris, Tunis",
      agence: "Tunis",
      role: "Responsable d'agence",
      gouvernorat: "Tunis",
    },
    {
      id: "MEM002",
      name: "Sarah Ahmed",
      email: "sarah.membre@email.com",
      phone: "+33 1 98 76 54 32",
      address: "34 Avenue Habib Bourguiba, Sousse",
      agence: "Sousse",
      role: "Agent d'accueil",
      gouvernorat: "Sousse",
    },
    {
      id: "MEM003",
      name: "Mohamed Ali",
      email: "mohamed.membre@email.com",
      phone: "+33 1 11 22 33 44",
      address: "56 Rue de la Liberté, Sfax",
      agence: "Sfax",
      role: "Gestionnaire de stock",
      gouvernorat: "Sfax",
    },
  ]);

  const [missions, setMissions] = useState(mockMissions);
  const [livreurs, setLivreurs] = useState(mockLivreurs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMission, setSelectedMission] = useState(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("missions"); // "members", "missions", "alerts" - default to missions

  // Simulate real-time alerts
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new alerts (in real app, this would come from WebSocket or API)
      const newAlert = {
        type: "status_update",
        message: "Nouvelle mise à jour de mission",
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        severity: "info"
      };
      
      // Add to first mission for demo
      if (missions.length > 0) {
        setMissions(prev => prev.map((mission, index) => 
          index === 0 ? { ...mission, alerts: [...mission.alerts, newAlert] } : mission
        ));
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [missions]);

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nom et prénom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "gouvernorat", header: "Gouvernorat" },
    { key: "address", header: "Adresse" },
    { key: "agence", header: "Agence" },
    { key: "role", header: "Rôle" },
  ];

  const missionColumns = [
    { key: "id", header: "ID Mission" },
    { key: "livreur", header: "Livreur" },
    { key: "expediteur", header: "Expéditeur" },
    { key: "status", header: "Statut" },
    { key: "parcels", header: "Colis" },
    { key: "scheduledTime", header: "Heure prévue" },
    { key: "lastUpdate", header: "Dernière mise à jour" },
  ];

  // Read-only member functions - no editing capabilities
  const handleViewMember = (member) => {
    // Just for viewing - no editing
    console.log("Viewing member:", member);
  };

  const handleMissionAction = (mission, action) => {
    if (action === "view") {
      setSelectedMission(mission);
    } else if (action === "reassign") {
      setSelectedMission(mission);
      setReassignModalOpen(true);
    }
  };

  const handleReassignMission = (newLivreurId) => {
    if (selectedMission) {
      const newLivreur = livreurs.find(l => l.id === newLivreurId);
      setMissions(prev => prev.map(mission => 
        mission.id === selectedMission.id 
          ? { 
              ...mission, 
              livreur: newLivreur.name,
              livreurId: newLivreur.id,
              status: "En attente",
              lastUpdate: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              alerts: [...mission.alerts, {
                type: "reassigned",
                message: `Mission réassignée à ${newLivreur.name}`,
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                severity: "info"
              }]
            }
          : mission
      ));
      setReassignModalOpen(false);
      setSelectedMission(null);
    }
  };

  const getAllAlerts = () => {
    return missions.flatMap(mission => 
      mission.alerts.map(alert => ({
        ...alert,
        missionId: mission.id,
        livreur: mission.livreur,
        expediteur: mission.expediteur
      }))
    ).sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Membre d'agence</h1>
          <p className="text-gray-600 mt-1">Suivi des missions et alertes en temps réel</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "members" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Membres
          </button>
          <button
            onClick={() => setActiveTab("missions")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "missions" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Missions ({missions.length})
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === "alerts" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Alertes ({getAllAlerts().length})
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Membres</p>
              <p className="text-xl font-bold text-blue-600">{members.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Missions Actives</p>
              <p className="text-xl font-bold text-green-600">{missions.filter(m => m.status === "En cours").length}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Livreurs Disponibles</p>
              <p className="text-xl font-bold text-purple-600">{livreurs.filter(l => l.status === "Disponible").length}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Alertes Récentes</p>
              <p className="text-xl font-bold text-orange-600">{getAllAlerts().filter(a => a.severity === "warning" || a.severity === "error").length}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "members" && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Liste des Membres d'Agence (Lecture seule)</h2>
            <p className="text-sm text-gray-600 mt-1">Informations des membres de votre agence</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.gouvernorat}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.agence}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "missions" && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Suivi des Missions Livreur</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {missionColumns.map((column) => (
                    <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.header}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {missions.map((mission) => (
                  <tr key={mission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mission.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mission.livreur}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mission.expediteur}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(mission.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.parcels}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.scheduledTime}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.lastUpdate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => handleMissionAction(mission, "view")}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                          title="Voir les détails"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {mission.status === "En attente" && (
                          <button
                            onClick={() => handleMissionAction(mission, "reassign")}
                            className="text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-50 transition-colors"
                            title="Réassigner"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Alertes et Notifications</h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {getAllAlerts().map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${alertBadge(alert.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{alert.message}</span>
                        <span className="text-xs opacity-75">Mission {alert.missionId}</span>
                      </div>
                      <div className="text-xs mt-1">
                        Livreur: {alert.livreur} | Expéditeur: {alert.expediteur}
                      </div>
                    </div>
                    <div className="text-xs opacity-75">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Mission Details Modal */}
      <Modal
        isOpen={!!selectedMission}
        onClose={() => setSelectedMission(null)}
        title={selectedMission ? `Détails Mission ${selectedMission.id}` : ""}
        size="lg"
      >
        {selectedMission && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700">Livreur :</div>
                <div className="text-sm">{selectedMission.livreur}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Statut :</div>
                <div>{statusBadge(selectedMission.status)}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Expéditeur :</div>
                <div className="text-sm">{selectedMission.expediteur}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Nombre de colis :</div>
                <div className="text-sm">{selectedMission.parcels}</div>
              </div>
            </div>
            
            <div>
              <div className="font-semibold text-gray-700">Adresse :</div>
              <div className="text-sm">{selectedMission.address}</div>
            </div>

            <div>
              <div className="font-semibold text-gray-700 mb-3">Historique des alertes :</div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedMission.alerts.map((alert, index) => (
                  <div key={index} className={`p-2 rounded border ${alertBadge(alert.severity)}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{alert.message}</span>
                      <span className="text-xs opacity-75">{alert.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reassign Mission Modal */}
      <Modal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title="Réassigner la mission"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              Sélectionnez un nouveau livreur pour la mission {selectedMission?.id} :
            </p>
            <div className="space-y-2">
              {livreurs.filter(l => l.status === "Disponible").map((livreur) => (
                <button
                  key={livreur.id}
                  onClick={() => handleReassignMission(livreur.id)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-semibold">{livreur.name}</div>
                  <div className="text-sm text-gray-600">{livreur.phone}</div>
                  <div className="text-xs text-gray-500">{statusBadge(livreur.status)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MembreAgence; 