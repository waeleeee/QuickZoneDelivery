import React, { useState, useRef } from "react";
import MissionPickupTable from "./common/MissionPickupTable";
import Modal from "./common/Modal";
import html2pdf from "html2pdf.js";
import MissionColisScan from "./MissionColisScan";

// Mock data
const mockDrivers = [
  { id: 1, name: "Pierre Dubois", phone: "+33 1 23 45 67 89" },
  { id: 2, name: "Sarah Ahmed", phone: "+33 1 98 76 54 32" },
  { id: 3, name: "Mohamed Ali", phone: "+33 1 11 22 33 44" },
];
const mockShippers = [
  { id: 1, name: "Expéditeur A", contact: "+33 6 12 34 56 78", defaultLivreurId: 1 },
  { id: 2, name: "Expéditeur B", contact: "+33 6 87 65 43 21", defaultLivreurId: 2 },
];
const mockColis = [
  { id: "COL001", exp: 1, dest: "Paris", status: "En attente" },
  { id: "COL002", exp: 1, dest: "Lyon", status: "Au dépôt" },
  { id: "COL003", exp: 2, dest: "Marseille", status: "En cours" },
  { id: "COL004", exp: 2, dest: "Toulouse", status: "Livés" },
];

const statusList = [
  "En attente", "Au dépôt", "En cours", "RTN dépot", "Livés", "Livrés payés", "Retour définitif", "RTN client agence", "Retour Expéditeur", "Retour En Cours d’expédition", "Retour reçu"
];

// Simuler un utilisateur connecté complet
const currentUser = {
  name: "François Petit",
  email: "francois.petit@quickzone.tn",
  role: "Chef d'agence"
};

const statusBadge = (status) => {
  const colorMap = {
    "En attente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Au dépôt": "bg-blue-100 text-blue-800 border-blue-300",
    "En cours": "bg-purple-100 text-purple-800 border-purple-300",
    "RTN dépot": "bg-orange-100 text-orange-800 border-orange-300",
    "Livés": "bg-green-100 text-green-800 border-green-300",
    "Livrés payés": "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Retour définitif": "bg-red-100 text-red-800 border-red-300",
    "RTN client agence": "bg-pink-100 text-pink-800 border-pink-300",
    "Retour Expéditeur": "bg-gray-100 text-gray-800 border-gray-300",
    "Retour En Cours d’expédition": "bg-indigo-100 text-indigo-800 border-indigo-300",
    "Retour reçu": "bg-cyan-100 text-cyan-800 border-cyan-300",
  };
  return <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>{status}</span>;
};

const Pickup = () => {
  // Missions de pick up
  const [missions, setMissions] = useState([
    {
      id: 1,
      driver: "Pierre Dubois",
      driverId: 1,
      shipper: "Expéditeur A",
      shipperId: 1,
      colis: [mockColis[0], mockColis[1]],
      status: "En attente",
      createdAt: "2024-01-15 09:00",
      scheduledTime: "2024-01-15 10:00",
      createdBy: {
        name: "François Petit",
        email: "francois.petit@quickzone.tn",
        role: "Chef d'agence"
      },
      pdfFile: null,
    },
    {
      id: 2,
      driver: "Sarah Ahmed",
      driverId: 2,
      shipper: "Expéditeur B",
      shipperId: 2,
      colis: [mockColis[2], mockColis[3]],
      status: "Livés",
      createdAt: "2024-01-16 08:00",
      scheduledTime: "2024-01-16 09:00",
      createdBy: {
        name: "François Petit",
        email: "francois.petit@quickzone.tn",
        role: "Chef d'agence"
      },
      pdfFile: null,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [viewMission, setViewMission] = useState(null);
  // Formulaire mission
  const [formData, setFormData] = useState({
    driverId: "",
    shipperId: "",
    colisIds: [],
    status: statusList[0],
    scheduledTime: "",
    pdfFile: null,
  });
  const detailRef = useRef();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scannedColis, setScannedColis] = useState([]);

  // Helpers
  const getDriverName = (id) => mockDrivers.find(d => d.id === Number(id))?.name || "";
  const getShipperName = (id) => mockShippers.find(s => s.id === Number(id))?.name || "";
  const getColisByIds = (ids) => mockColis.filter(c => ids.includes(c.id));

  // Actions
  const handleAdd = () => {
    setEditingMission(null);
    setFormData({ driverId: "", shipperId: "", colisIds: [], status: statusList[0], scheduledTime: "", pdfFile: null });
    setIsModalOpen(true);
  };
  const handleEdit = (mission) => {
    setEditingMission(mission);
    setFormData({
      driverId: mission.driverId,
      shipperId: mission.shipperId,
      colisIds: mission.colis.map(c => c.id),
      status: mission.status,
      scheduledTime: mission.scheduledTime,
      pdfFile: mission.pdfFile || null,
    });
    setIsModalOpen(true);
  };
  const handleDelete = (mission) => {
    if (window.confirm("Supprimer cette mission ?")) {
      setMissions(missions.filter(m => m.id !== mission.id));
    }
  };
  const handleSubmit = () => {
    const driver = mockDrivers.find(d => d.id === Number(formData.driverId));
    const shipper = mockShippers.find(s => s.id === Number(formData.shipperId));
    const colis = getColisByIds(formData.colisIds);
    if (editingMission) {
      setMissions(missions.map(m => m.id === editingMission.id ? {
        ...m,
        driver: driver?.name,
        driverId: driver?.id,
        shipper: shipper?.name,
        shipperId: shipper?.id,
        colis,
        status: formData.status,
        scheduledTime: formData.scheduledTime,
        pdfFile: formData.pdfFile || null,
        createdBy: m.createdBy,
      } : m));
    } else {
      setMissions([
        ...missions,
        {
          id: Math.max(...missions.map(m => m.id)) + 1,
          driver: driver?.name,
          driverId: driver?.id,
          shipper: shipper?.name,
          shipperId: shipper?.id,
          colis,
          status: formData.status,
          createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
          scheduledTime: formData.scheduledTime,
          createdBy: { ...currentUser },
          pdfFile: formData.pdfFile || null,
        },
      ]);
    }
    setIsModalOpen(false);
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "shipperId") {
      // When shipper changes, auto-select default livreur if available
      const shipper = mockShippers.find(s => s.id === Number(value));
      setFormData((prev) => ({
        ...prev,
        shipperId: value,
        driverId: shipper?.defaultLivreurId ? String(shipper.defaultLivreurId) : "",
      }));
    } else if (name === "colisIds") {
      const id = value;
      setFormData((prev) => ({
        ...prev,
        colisIds: checked ? [...prev.colisIds, id] : prev.colisIds.filter(cid => cid !== id),
      }));
    } else if (name === "pdfFile") {
      setFormData((prev) => ({ ...prev, pdfFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleScanValidate = (codes) => {
    setFormData((prev) => ({
      ...prev,
      colisIds: Array.from(new Set([...prev.colisIds, ...codes]))
    }));
    setIsScanModalOpen(false);
  };

  // Export PDF du détail de la mission
  const handleExportPDF = () => {
    if (detailRef.current) {
      html2pdf().set({
        margin: 0.5,
        filename: `Mission_${viewMission.id}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      }).from(detailRef.current).save();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header harmonisé */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des missions de collecte</h1>
          <p className="text-gray-600 mt-1">Assignez des missions de ramassage aux livreurs, reliez colis et expéditeurs</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nouvelle mission
        </button>
      </div>

      {/* Tableau des missions */}
      <MissionPickupTable
        missions={missions}
        onView={setViewMission}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Modal création/édition mission */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMission ? "Modifier la mission" : "Nouvelle mission"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Livreur</label>
            <select
              name="driverId"
              value={formData.driverId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Sélectionner un livreur</option>
              {mockDrivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expéditeur</label>
            <select
              name="shipperId"
              value={formData.shipperId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Sélectionner un expéditeur</option>
              {mockShippers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsScanModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md font-semibold mb-2"
            >
              Ajouter des colis par scan
            </button>
            {/* Affichage des colis sélectionnés */}
            {Array.isArray(formData.colisIds) && formData.colisIds.length > 0 ? (
              <div className="mt-2">
                <span className="text-sm font-semibold text-gray-700">Colis sélectionnés :</span>
                <ul className="flex flex-wrap gap-2 mt-1">
                  {formData.colisIds.map((id) => (
                    <li key={id} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-mono border border-blue-200">{id}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-2 text-xs text-gray-400">Aucun colis sélectionné pour cette mission.</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {statusList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date prévue</label>
            <input
              type="datetime-local"
              name="scheduledTime"
              value={formData.scheduledTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {editingMission ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </Modal>

      {/* Modal vue détaillée mission */}
      <Modal
        isOpen={!!viewMission}
        onClose={() => setViewMission(null)}
        title={viewMission ? `Détail de la mission #${viewMission.id}` : ""}
        size="lg"
        extraHeader={viewMission && (
          <button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform ml-2"
          >
            Exporter en PDF
          </button>
        )}
      >
        {viewMission && (
          <div ref={detailRef} className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-blue-100 animate-fade-in">
            <div className="flex flex-wrap justify-between gap-6 mb-6">
              <div className="flex-1 min-w-[180px]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-bold">Livreur</span>
                  <span className="font-semibold text-lg">{viewMission.driver}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-bold">Expéditeur</span>
                  <span className="font-semibold text-lg">{viewMission.shipper}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-bold">Créée par</span>
                  <span className="font-semibold">{viewMission.createdBy?.name}</span>
                </div>
                <div className="text-xs text-gray-500 ml-2">{viewMission.createdBy?.email} — <span className="text-blue-700">{viewMission.createdBy?.role}</span></div>
              </div>
              <div className="flex-1 min-w-[180px] text-right">
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Date prévue :</span>
                  <div className="text-base">{viewMission.scheduledTime}</div>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Statut :</span>
                  <div>{statusBadge(viewMission.status)}</div>
                </div>
                {viewMission.pdfFile && (
                  <div className="mt-2">
                    <a
                      href={URL.createObjectURL(viewMission.pdfFile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      Voir le PDF joint
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="font-semibold text-gray-700 mb-2 text-lg flex items-center gap-2">
                <span className="inline-block bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-bold">Colis associés</span>
                <span className="text-xs text-gray-400">({viewMission.colis.length})</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {viewMission.colis.map((c) => (
                  <li key={c.id} className="bg-gray-50 rounded-lg p-3 shadow flex flex-col gap-1 border border-gray-100">
                    <span className="font-medium text-blue-700">{c.id}</span>
                    <span className="text-xs text-gray-600">Destinataire : <span className="font-semibold">{c.dest}</span></span>
                    <span className="text-xs">{statusBadge(c.status)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-xs text-gray-400 mt-6">Mission créée le {viewMission.createdAt}</div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Ajouter des colis à la mission"
        size="md"
      >
        <MissionColisScan onValidate={handleScanValidate} onClose={() => setIsScanModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Pickup; 