import React, { useState, useRef, useEffect } from "react";
import MissionPickupTable from "./common/MissionPickupTable";
import Modal from "./common/Modal";
import html2pdf from "html2pdf.js";
import MissionColisScan from "./MissionColisScan";
import { missionsPickupService } from '../../services/api';
import { apiService } from '../../services/api';

// Pickup mission status flow - only the 4 statuses needed for pickup
const pickupStatusList = [
  "En attente",      // Initial status when pickup is created
  "À enlever",       // When driver accepts the mission  
  "Enlevé",          // When driver scans parcel codes
  "Au dépôt"         // When driver completes with security code
];

// All parcel statuses for reference
const allParcelStatuses = [
  "En attente", "À enlever", "Enlevé", "Au dépôt", "En cours", "RTN dépot", 
  "Livrés", "Livrés payés", "Retour définitif", "RTN client agence", 
  "Retour Expéditeur", "Retour En Cours d'expédition", "Retour reçu"
];

const currentUser = {
  name: "François Petit",
  email: "francois.petit@quickzone.tn",
  role: "Chef d'agence"
};

const statusBadge = (status) => {
  const colorMap = {
    // Pickup flow statuses
    "En attente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "À enlever": "bg-blue-100 text-blue-800 border-blue-300", 
    "Enlevé": "bg-green-100 text-green-800 border-green-300",
    "Au dépôt": "bg-purple-100 text-purple-800 border-purple-300",
    
    // Other parcel statuses
    "En cours": "bg-purple-100 text-purple-800 border-purple-300",
    "RTN dépot": "bg-orange-100 text-orange-800 border-orange-300",
    "Livrés": "bg-green-100 text-green-800 border-green-300",
    "Livrés payés": "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Retour définitif": "bg-red-100 text-red-800 border-red-300",
    "RTN client agence": "bg-pink-100 text-pink-800 border-pink-300",
    "Retour Expéditeur": "bg-gray-100 text-gray-800 border-gray-300",
    "Retour En Cours d'expédition": "bg-indigo-100 text-indigo-800 border-indigo-300",
    "Retour reçu": "bg-cyan-100 text-cyan-800 border-cyan-300",
    
    // Mission statuses (for backward compatibility)
    "scheduled": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Accepté par livreur": "bg-blue-100 text-blue-800 border-blue-300",
    "En cours de ramassage": "bg-green-100 text-green-800 border-green-300",
    "Refusé par livreur": "bg-red-50 text-red-700 border-red-300",
    "Mission terminée": "bg-purple-100 text-purple-800 border-purple-300",
  };
  return <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>{status}</span>;
};

const Pickup = () => {
  const [missions, setMissions] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [shippers, setShippers] = useState([]);
  const [colis, setColis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [viewMission, setViewMission] = useState(null);
  const [formData, setFormData] = useState({
    driverId: "",
    shipperId: "",
    colisIds: [],
    status: "En attente", // Always start with "En attente"
    scheduledTime: "",
    pdfFile: null,
  });
  const detailRef = useRef();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scannedColis, setScannedColis] = useState([]);
  const [securityCodes, setSecurityCodes] = useState({});

  // Load data from API
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 Fetching missions pickup data...');
        const [missionsData, driversData, shippersData, colisData] = await Promise.all([
          missionsPickupService.getMissionsPickup(),
          apiService.getDrivers(), // This gets drivers from the drivers table
          apiService.getShippers(),
          apiService.getParcels(),
        ]);
        console.log('📡 Missions data:', missionsData);
        console.log('📡 Drivers data:', driversData);
        console.log('📡 Shippers data:', shippersData);
        console.log('📡 Colis data:', colisData);
        
        // Handle missions data properly - it should be in missionsData.data
        const missions = missionsData?.data || missionsData || [];
        console.log('📦 Processed missions:', missions);
        
        setMissions(missions);
        setDrivers(driversData);
        setShippers(shippersData);
        setColis(colisData);
        
        // Fetch security codes for all missions
        console.log('🔐 Fetching security codes for all missions...');
        const codes = {};
        for (const mission of missions) {
          try {
            console.log(`🔐 Fetching security code for mission ${mission.id}...`);
            const codeResponse = await missionsPickupService.getMissionSecurityCode(mission.id);
            console.log(`🔐 Response for mission ${mission.id}:`, codeResponse);
            
            // Check different response formats
            if (codeResponse.success && codeResponse.data && codeResponse.data.securityCode) {
              codes[mission.id] = codeResponse.data.securityCode;
              console.log(`✅ Security code for mission ${mission.id}: ${codeResponse.data.securityCode}`);
            } else if (codeResponse.securityCode) {
              // Direct response format
              codes[mission.id] = codeResponse.securityCode;
              console.log(`✅ Security code for mission ${mission.id}: ${codeResponse.securityCode}`);
            } else {
              console.log(`❌ No security code data for mission ${mission.id}:`, codeResponse);
            }
          } catch (error) {
            console.error(`❌ Error fetching security code for mission ${mission.id}:`, error);
            console.error(`❌ Error details:`, {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
          }
        }
        setSecurityCodes(codes);
        console.log('🔐 Final security codes loaded:', codes);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Helpers
  const getDriverName = (id) => drivers.find(d => d.id === id)?.name || "";
  const getShipperName = (id) => shippers.find(s => s.id === id)?.name || "";
  const getColisByIds = (ids) => colis.filter(c => ids.includes(c.id));

  // Actions
  const handleAdd = () => {
    setEditingMission(null);
    setFormData({ driverId: "", shipperId: "", colisIds: [], status: "En attente", scheduledTime: "", pdfFile: null });
    setIsModalOpen(true);
  };
  const handleEdit = (mission) => {
    setEditingMission(mission);
    setFormData({
      driverId: mission.driver?.id,
      shipperId: mission.shipper?.id,
      colisIds: mission.parcels?.map(c => c.id) || [],
      status: mission.status,
      scheduledTime: mission.scheduled_time,
      pdfFile: mission.pdfFile || null,
    });
    setIsModalOpen(true);
  };
  const handleDelete = async (mission) => {
    if (window.confirm("Supprimer cette mission ?")) {
      try {
        await missionsPickupService.deleteMissionPickup(mission.id);
        setMissions(missions.filter(m => m.id !== mission.id));
      } catch (err) {
        alert("Erreur lors de la suppression de la mission.");
      }
    }
  };
  const handleSubmit = async () => {
    try {
      console.log('🚀 handleSubmit called with formData:', formData);
      
      // Get all parcels that belong to the selected shipper and have status "pending" or "En attente"
      const availableParcels = colis.filter(c => 
        c.shipper_id === Number(formData.shipperId) && 
        (c.status === 'pending' || c.status === 'En attente')
      );
      
      console.log('📦 Available parcels for shipper:', availableParcels);
      
      const data = {
        driver_id: formData.driverId,
        shipper_id: formData.shipperId,
        colis_ids: availableParcels.map(p => p.id), // Automatically include all available parcels
        scheduled_time: new Date().toISOString().slice(0, 16), // Current date/time
        status: 'En attente', // Use French status for consistency
      };
      
      console.log('📤 Sending data to API:', data);
      
      if (editingMission) {
        console.log('🔄 Updating existing mission...');
        const response = await missionsPickupService.updateMissionPickup(editingMission.id, data);
        console.log('✅ Mission updated:', response);
        const updatedMission = response.data;
        setMissions(missions.map(m => m.id === editingMission.id ? updatedMission : m));
      } else {
        console.log('🆕 Creating new mission...');
        const response = await missionsPickupService.createMissionPickup(data);
        console.log('✅ Mission created:', response);
        const createdMission = response.data;
        setMissions([createdMission, ...missions]);
      }
      
      console.log('🔒 Closing modal...');
      setIsModalOpen(false);
      console.log('✅ Mission assignment completed successfully!');
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err);
      alert("Erreur lors de l'enregistrement de la mission: " + err.message);
    }
  };
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (name === "shipperId") {
      setFormData((prev) => ({
        ...prev,
        shipperId: value,
        // Optionnel : auto-sélection du livreur par défaut si tu veux
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Chargement des missions...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

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
        securityCodes={securityCodes}
      />

      {/* Modal création/édition mission */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMission ? "Modifier la mission" : "Nouvelle mission"}
        size="md"
      >
        <form onSubmit={async (e) => { 
          e.preventDefault(); 
          console.log('🚀 Form submitted, calling handleSubmit...');
          console.log('📋 Form data:', formData);
          
          // Check if required fields are filled
          if (!formData.driverId || !formData.shipperId) {
            console.log('❌ Missing required fields');
            alert('Veuillez sélectionner un livreur et un client');
            return;
          }
          
          console.log('✅ Form validation passed, calling handleSubmit...');
          await handleSubmit(); 
        }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Nom du livreur</label>
            <select
              name="driverId"
              value={formData.driverId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionner</option>
              {drivers.map(driver => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Nom du client</label>
            <select
              name="shipperId"
              value={formData.shipperId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Sélectionner</option>
              {shippers.map(shipper => (
                <option key={shipper.id} value={shipper.id}>{shipper.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Assigner
            </button>
          </div>
        </form>
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
              <span className="font-semibold text-lg">{viewMission.driver?.name || "Non assigné"}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-bold">Expéditeur</span>
              <span className="font-semibold text-lg">{viewMission.shipper?.name || "Non assigné"}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-bold">N° Mission</span>
              <span className="font-semibold text-lg">{viewMission.mission_number}</span>
            </div>
              </div>
              <div className="flex-1 min-w-[180px] text-right">
                <div className="mb-2">
                  <span className="font-semibold text-gray-700">Date prévue :</span>
                  <div className="text-base">{viewMission.scheduled_time}</div>
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
            {/* Security Code Section */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                      <span className="inline-block bg-yellow-100 text-yellow-700 rounded-full px-2 py-1 text-xs font-bold">🔐</span>
                      Code de Sécurité
                    </div>
                    <div className="text-sm text-gray-600">
                      Ce code est requis pour que le livreur puisse terminer la mission
                    </div>
                  </div>
                  <div className="text-right">
                    <code className="bg-white px-3 py-2 rounded border text-lg font-mono text-gray-800">
                      {securityCodes[viewMission.id] || 'Non généré'}
                    </code>
                    {securityCodes[viewMission.id] && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(securityCodes[viewMission.id]);
                          alert('Code copié dans le presse-papiers!');
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                        title="Copier le code"
                      >
                        📋 Copier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="font-semibold text-gray-700 mb-2 text-lg flex items-center gap-2">
                <span className="inline-block bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-bold">Colis associés</span>
                <span className="text-xs text-gray-400">({viewMission.parcels?.length || 0})</span>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {viewMission.parcels?.map((c) => (
                  <li key={c.id} className="bg-gray-50 rounded-lg p-3 shadow flex flex-col gap-1 border border-gray-100">
                    <span className="font-medium text-blue-700">{c.id}</span>
                    <span className="text-xs text-gray-600">Destinataire : <span className="font-semibold">{c.destination}</span></span>
                    <span className="text-xs">{statusBadge(c.status)}</span>
                  </li>
                )) || <li className="text-gray-500 text-center col-span-2">Aucun colis associé</li>}
              </ul>
            </div>
            <div className="text-xs text-gray-400 mt-6">Mission créée le {viewMission.created_at}</div>
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