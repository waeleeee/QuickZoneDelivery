import React, { useState } from "react";
import Modal from "./common/Modal";

// Mock missions for the logged-in livreur
const initialMissions = [
  {
    id: 1,
    status: "En attente",
    scheduledTime: "2024-06-10 09:00",
    expeditor: "Expéditeur A",
    address: "12 rue de Paris, 75001 Paris",
    phone: "+216 71 234 567",
    instructions: "Livraison entre 9h et 12h, appeler avant",
    colis: [
      { id: "COL001", status: "En attente", weight: "2.5 kg", description: "Colis fragile - Électronique" },
      { id: "COL002", status: "Au dépôt", weight: "1.8 kg", description: "Colis standard - Vêtements" },
    ],
  },
  {
    id: 2,
    status: "En cours",
    scheduledTime: "2024-06-09 14:00",
    expeditor: "Expéditeur B",
    address: "8 avenue de Lyon, 69001 Lyon",
    phone: "+216 71 345 678",
    instructions: "Code d'accès: 1234, livrer au 3ème étage",
    colis: [
      { id: "COL003", status: "En cours", weight: "3.2 kg", description: "Colis lourd - Livres" },
    ],
  },
  {
    id: 3,
    status: "Livrés",
    scheduledTime: "2024-06-08 11:00",
    expeditor: "Expéditeur C",
    address: "25 boulevard Central, 13000 Marseille",
    phone: "+216 71 456 789",
    instructions: "Livraison au gardien si absent",
    colis: [
      { id: "COL004", status: "Livrés", weight: "1.5 kg", description: "Colis express - Documents" },
      { id: "COL005", status: "Livrés", weight: "2.0 kg", description: "Colis standard - Accessoires" },
    ],
  },
];

const statusBadge = (status) => {
  const colorMap = {
    "En attente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Au dépôt": "bg-blue-100 text-blue-800 border-blue-300",
    "En cours": "bg-purple-100 text-purple-800 border-purple-300",
    "Livrés": "bg-green-100 text-green-800 border-green-300",
    "Livrés payés": "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Retour définitif": "bg-red-100 text-red-800 border-red-300",
    "Accepté par livreur": "bg-green-50 text-green-700 border-green-300",
    "Refusé par livreur": "bg-red-50 text-red-700 border-red-300",
  };
  return <span className={`inline-block px-2 py-1 rounded-full border text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>{status}</span>;
};

const LivreurDashboard = () => {
  // Simulate logged-in livreur
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null') || {
    name: "Marc Simon",
    email: "marc.simon@quickzone.tn",
    role: "Livreurs"
  };
  const [missions, setMissions] = useState(initialMissions);
  const [selectedMission, setSelectedMission] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Calculate statistics
  const totalMissions = missions.length;
  const pendingMissions = missions.filter(m => m.status === "En attente").length;
  const inProgressMissions = missions.filter(m => m.status === "En cours").length;
  const completedMissions = missions.filter(m => m.status === "Livrés").length;
  const totalParcels = missions.reduce((sum, mission) => sum + mission.colis.length, 0);

  // Filter missions based on status
  const filteredMissions = filterStatus === "all" 
    ? missions 
    : missions.filter(mission => mission.status === filterStatus);

  // Handler to accept/refuse a colis
  const handleColisAction = (missionId, colisId, action) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === missionId
          ? {
              ...mission,
              colis: mission.colis.map((c) =>
                c.id === colisId
                  ? {
                      ...c,
                      status:
                        action === "accept"
                          ? "Accepté par livreur"
                          : "Refusé par livreur",
                    }
                  : c
              ),
            }
          : mission
      )
    );
    // Also update selectedMission if open
    if (selectedMission && selectedMission.id === missionId) {
      setSelectedMission((prev) => ({
        ...prev,
        colis: prev.colis.map((c) =>
          c.id === colisId
            ? {
                ...c,
                status:
                  action === "accept"
                    ? "Accepté par livreur"
                    : "Refusé par livreur",
              }
            : c
        ),
      }));
    }
  };

  // Handler to update mission status
  const handleMissionStatusUpdate = (missionId, newStatus) => {
    setMissions((prevMissions) =>
      prevMissions.map((mission) =>
        mission.id === missionId
          ? { ...mission, status: newStatus }
          : mission
      )
    );
    if (selectedMission && selectedMission.id === missionId) {
      setSelectedMission((prev) => ({ ...prev, status: newStatus }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Livreur</h1>
          <p className="text-gray-600 mt-1">Bienvenue, {currentUser.name}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Rôle</div>
          <div className="text-lg font-bold text-blue-600">{currentUser.role}</div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Missions</p>
              <p className="text-xl font-bold text-blue-600">{totalMissions}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">En Attente</p>
              <p className="text-xl font-bold text-yellow-600">{pendingMissions}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">En Cours</p>
              <p className="text-xl font-bold text-purple-600">{inProgressMissions}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Livrés</p>
              <p className="text-xl font-bold text-green-600">{completedMissions}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Missions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mes Missions ({filteredMissions.length})</h2>
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="En cours">En cours</option>
              <option value="Livrés">Livrés</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date prévue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expéditeur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colis</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMissions.map((mission) => (
                <tr key={mission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mission.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{statusBadge(mission.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.scheduledTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mission.expeditor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{mission.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.colis.length} colis</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => setSelectedMission(mission)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                      title="Voir les détails"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mission Details Modal */}
      <Modal
        isOpen={!!selectedMission}
        onClose={() => setSelectedMission(null)}
        title={selectedMission ? `Détail de la mission #${selectedMission.id}` : ""}
        size="lg"
      >
        {selectedMission && (
          <div className="space-y-6">
            {/* Mission Status and Actions */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-700 mb-2">Statut :</div>
                {statusBadge(selectedMission.status)}
              </div>
              <div className="flex space-x-2">
                {selectedMission.status === "En attente" && (
                  <button
                    onClick={() => handleMissionStatusUpdate(selectedMission.id, "En cours")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold"
                  >
                    Démarrer
                  </button>
                )}
                {selectedMission.status === "En cours" && (
                  <button
                    onClick={() => handleMissionStatusUpdate(selectedMission.id, "Livrés")}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold"
                  >
                    Terminer
                  </button>
                )}
              </div>
            </div>

            {/* Mission Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700">Date prévue :</div>
                <div className="text-sm">{selectedMission.scheduledTime}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Téléphone :</div>
                <div className="text-sm">{selectedMission.phone}</div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-700">Expéditeur :</div>
              <div className="text-sm">{selectedMission.expeditor}</div>
              <div className="font-semibold text-gray-700 mt-2">Adresse :</div>
              <div className="text-sm">{selectedMission.address}</div>
              {selectedMission.instructions && (
                <>
                  <div className="font-semibold text-gray-700 mt-2">Instructions :</div>
                  <div className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">{selectedMission.instructions}</div>
                </>
              )}
            </div>

            {/* Colis List */}
            <div>
              <div className="font-semibold text-gray-700 mb-3">Colis associés ({selectedMission.colis.length}) :</div>
              <div className="space-y-2">
                {selectedMission.colis.map((c) => (
                  <div key={c.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm font-semibold">{c.id}</span>
                          {statusBadge(c.status)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {c.description} - {c.weight}
                        </div>
                      </div>
                      {(c.status === "En attente" || c.status === "Au dépôt") && (
                        <div className="flex space-x-1">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold"
                            onClick={() => handleColisAction(selectedMission.id, c.id, "accept")}
                          >
                            Accepter
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold"
                            onClick={() => handleColisAction(selectedMission.id, c.id, "refuse")}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LivreurDashboard; 