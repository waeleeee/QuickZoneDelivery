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
    colis: [
      { id: "COL001", status: "En attente" },
      { id: "COL002", status: "Au dépôt" },
    ],
  },
  {
    id: 2,
    status: "Livés",
    scheduledTime: "2024-06-09 14:00",
    expeditor: "Expéditeur B",
    address: "8 avenue de Lyon, 69001 Lyon",
    colis: [
      { id: "COL003", status: "Livés" },
    ],
  },
];

const statusBadge = (status) => {
  const colorMap = {
    "En attente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Au dépôt": "bg-blue-100 text-blue-800 border-blue-300",
    "En cours": "bg-purple-100 text-purple-800 border-purple-300",
    "Livés": "bg-green-100 text-green-800 border-green-300",
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

      {/* Missions Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mes Missions ({missions.length})</h2>
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {missions.map((mission) => (
                <tr key={mission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mission.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{statusBadge(mission.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.scheduledTime}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mission.expeditor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mission.address}</td>
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
        size="md"
      >
        {selectedMission && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-700">Statut :</div>
                {statusBadge(selectedMission.status)}
              </div>
              <div>
                <div className="font-semibold text-gray-700">Date prévue :</div>
                <div>{selectedMission.scheduledTime}</div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Expéditeur :</div>
              <div>{selectedMission.expeditor}</div>
              <div className="font-semibold text-gray-700 mt-2">Adresse :</div>
              <div>{selectedMission.address}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 mb-2">Colis associés :</div>
              <ul className="flex flex-col gap-2">
                {selectedMission.colis.map((c) => (
                  <li key={c.id} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono border border-blue-200 flex items-center justify-between gap-2">
                    <span>{c.id} - {statusBadge(c.status)}</span>
                    {(c.status === "En attente" || c.status === "Au dépôt") && (
                      <span className="flex gap-1">
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
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LivreurDashboard; 