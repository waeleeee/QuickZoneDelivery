import React, { useState, useRef, useEffect } from "react";
import Modal from "./common/Modal";
import html2pdf from "html2pdf.js";
import { apiService, deliveryMissionsService, warehousesService } from '../../services/api';
import { Html5Qrcode } from "html5-qrcode";

// Delivery mission status flow
const deliveryStatusList = [
  "scheduled",      // Initial status when mission is created
  "in_progress",    // When driver starts the mission
  "completed",      // When all parcels are delivered
  "cancelled"       // If mission is cancelled
];

// Parcel statuses for delivery
const deliveryParcelStatuses = [
  "en_cours",       // Parcel assigned to driver
  "lives",          // Successfully delivered
  "rtn_depot"       // Returned to depot (failed delivery)
];

const statusBadge = (status) => {
  const colorMap = {
    // Mission statuses
    "scheduled": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "in_progress": "bg-blue-100 text-blue-800 border-blue-300", 
    "completed": "bg-green-100 text-green-800 border-green-300",
    "cancelled": "bg-red-100 text-red-800 border-red-300",
    
    // Parcel statuses
    "en_cours": "bg-purple-100 text-purple-800 border-purple-300",
    "lives": "bg-green-100 text-green-800 border-green-300",
    "rtn_depot": "bg-orange-100 text-orange-800 border-orange-300",
  };
  return <span className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>{status}</span>;
};

const PickupClient = () => {
  const [missions, setMissions] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [availableParcels, setAvailableParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [viewMission, setViewMission] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [formData, setFormData] = useState({
    driverId: "",
    warehouseId: "",
    parcelIds: [],
    deliveryDate: "",
    notes: "",
  });
  const [scannedCode, setScannedCode] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [deliveryFormData, setDeliveryFormData] = useState({
    parcelId: "",
    securityCode: "",
  });
  const detailRef = useRef();

  // Load data from API
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('🔍 Fetching delivery missions data...');
        const [missionsData, driversData, warehousesData, parcelsData] = await Promise.all([
          deliveryMissionsService.getDeliveryMissions(),
          apiService.getDrivers(),
          warehousesService.getWarehouses(),
          deliveryMissionsService.getAvailableParcels(),
        ]);
        console.log('📡 Missions data:', missionsData);
        console.log('📡 Drivers data:', driversData);
        console.log('📡 Warehouses data:', warehousesData);
        console.log('📡 Available parcels data:', parcelsData);
        
        console.log('📦 MissionsData structure:', missionsData);
        console.log('🚗 DriversData structure:', driversData);
        console.log('🏢 WarehousesData structure:', warehousesData);
        console.log('📦 ParcelsData structure:', parcelsData);
        
        console.log('📦 Setting missions:', missionsData);
        console.log('🚗 Setting drivers:', driversData);
        console.log('🏢 Setting warehouses:', warehousesData);
        console.log('📦 Setting available parcels:', parcelsData);
        
        // Handle both direct arrays and nested data structures
        const processedMissions = Array.isArray(missionsData) ? missionsData : missionsData?.data || [];
        const processedDrivers = Array.isArray(driversData) ? driversData : driversData?.data || [];
        const processedWarehouses = Array.isArray(warehousesData) ? warehousesData : warehousesData?.data || [];
        const processedParcels = Array.isArray(parcelsData) ? parcelsData : parcelsData?.data || [];
        
        console.log('📦 Processed missions:', processedMissions);
        console.log('🚗 Processed drivers:', processedDrivers);
        console.log('🏢 Processed warehouses:', processedWarehouses);
        console.log('📦 Processed parcels:', processedParcels);
        
        setMissions(processedMissions);
        setDrivers(processedDrivers);
        setWarehouses(processedWarehouses);
        setAvailableParcels(processedParcels);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.stop().catch(() => {});
      }
    };
  }, [scanner]);

  // Helper functions
  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    if (driver) {
      // Handle both name format and first_name + last_name format
      if (driver.name) {
        return driver.name;
      } else if (driver.first_name && driver.last_name) {
        return `${driver.first_name} ${driver.last_name}`;
      }
    }
    return "";
  };
  const getWarehouseName = (id) => warehouses.find(w => w.id === id)?.name || "";
  const getParcelsByIds = (ids) => availableParcels.filter(p => ids.includes(p.id));

  // Modal handlers
  const handleAdd = () => {
    console.log('🔍 Opening modal with current data:');
    console.log('🚗 Drivers:', drivers);
    console.log('🚗 Drivers length:', drivers?.length);
    console.log('🏢 Warehouses:', warehouses);
    console.log('🏢 Warehouses length:', warehouses?.length);
    console.log('🏢 Warehouses data:', warehouses);
    console.log('📦 Available parcels:', availableParcels);
    console.log('📦 Available parcels length:', availableParcels?.length);
    
    setEditingMission(null);
    setFormData({
      driverId: "",
      warehouseId: "",
      parcelIds: [],
      deliveryDate: "",
      notes: "",
    });
    
    // Reset scan-related state
    setScannedCode("");
    setScanMessage("");
    
    setIsModalOpen(true);
  };

  const handleEdit = (mission) => {
    setEditingMission(mission);
    setFormData({
      driverId: mission.driver_id || "",
      warehouseId: mission.warehouse_id || "",
      parcelIds: mission.parcels?.map(p => p.id) || [],
      deliveryDate: mission.delivery_date || "",
      notes: mission.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleView = (mission) => {
    setViewMission(mission);
    setIsModalOpen(true);
  };

  const handleDelivery = (mission) => {
    setSelectedMission(mission);
    setDeliveryFormData({
      parcelId: "",
      securityCode: "",
    });
    setIsDeliveryModalOpen(true);
  };

  const handleDelete = async (mission) => {
    if (window.confirm('Are you sure you want to delete this delivery mission?')) {
      try {
        await deliveryMissionsService.deleteDeliveryMission(mission.id);
        setMissions(missions.filter(m => m.id !== mission.id));
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete mission');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingMission) {
        // Update existing mission
        const response = await deliveryMissionsService.updateDeliveryMission(editingMission.id, formData);
        setMissions(missions.map(m => m.id === editingMission.id ? response.data : m));
      } else {
        // Create new mission
        const response = await deliveryMissionsService.createDeliveryMission(formData);
        setMissions([response.data, ...missions]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save mission');
    }
  };

  const handleDeliverySubmit = async () => {
    try {
      const response = await deliveryMissionsService.processDelivery(selectedMission.id, deliveryFormData);
      alert(response.message);
      
      // Refresh missions data
      const missionsData = await deliveryMissionsService.getDeliveryMissions();
      setMissions(missionsData.data || []);
      
      setIsDeliveryModalOpen(false);
    } catch (error) {
      console.error('Delivery error:', error);
      alert(error.message || 'Failed to process delivery');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeliveryInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParcelSelection = (parcelId) => {
    setFormData(prev => ({
      ...prev,
      parcelIds: prev.parcelIds.includes(parcelId)
        ? prev.parcelIds.filter(id => id !== parcelId)
        : [...prev.parcelIds, parcelId]
    }));
  };

  const handleBarcodeScan = () => {
    console.log('🔍 handleBarcodeScan called with code:', scannedCode);
    console.log('📦 Available parcels:', availableParcels);
    
    if (!scannedCode.trim()) {
      console.log('❌ No code entered');
      setScanMessage("❌ Aucun code saisi");
      setTimeout(() => setScanMessage(""), 2000);
      return;
    }

    // Clean the scanned code (remove any extra characters)
    const cleanCode = scannedCode.trim().toLowerCase();
    console.log('🧹 Cleaned code:', cleanCode);

    // Find parcel by tracking number (try multiple matching strategies)
    let parcel = availableParcels.find(p => 
      p.tracking_number && p.tracking_number.toLowerCase() === cleanCode
    );

    // If not found by exact match, try partial match
    if (!parcel) {
      parcel = availableParcels.find(p => 
        p.tracking_number && p.tracking_number.toLowerCase().includes(cleanCode)
      );
    }

    // If still not found, try matching by ID
    if (!parcel) {
      const numericId = parseInt(cleanCode);
      if (!isNaN(numericId)) {
        parcel = availableParcels.find(p => p.id === numericId);
      }
    }

    console.log('🔍 Found parcel:', parcel);

    if (parcel) {
      if (formData.parcelIds.includes(parcel.id)) {
        console.log('❌ Parcel already scanned');
        setScanMessage(`❌ Colis ${parcel.tracking_number} déjà scanné!`);
        setTimeout(() => setScanMessage(""), 3000);
      } else {
        console.log('✅ Adding parcel to selection');
        setFormData(prev => ({
          ...prev,
          parcelIds: [...prev.parcelIds, parcel.id]
        }));
        setScanMessage(`✅ Colis ${parcel.tracking_number} scanné avec succès!`);
        setTimeout(() => setScanMessage(""), 3000);
      }
    } else {
      console.log('❌ Parcel not found');
      setScanMessage(`❌ Colis avec le code "${cleanCode}" non trouvé!`);
      setTimeout(() => setScanMessage(""), 3000);
    }
    
    setScannedCode("");
  };

  // Barcode scanner functionality
  const startBarcodeScanner = () => {
    setIsScanModalOpen(true);
    setIsScanning(true);
    
    // Initialize scanner after modal is open
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);
      
      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 300, height: 200 },
          aspectRatio: 1.5,
          disableFlip: false,
        },
        (decodedText, decodedResult) => {
          console.log('📱 Barcode scanned:', decodedText);
          console.log('📱 Decoded result:', decodedResult);
          
          // Stop scanning immediately to prevent multiple scans
          html5QrCode.stop().then(() => {
            setScannedCode(decodedText);
            handleBarcodeScan();
            stopBarcodeScanner();
          }).catch((err) => {
            console.error('📱 Error stopping scanner:', err);
            setScannedCode(decodedText);
            handleBarcodeScan();
            stopBarcodeScanner();
          });
        },
        (error) => {
          // Only log errors that are not just "no QR code found"
          if (error && !error.toString().includes('No QR code found')) {
            console.log('📱 Scan error:', error);
          }
        }
      ).catch((err) => {
        console.error('📱 Scanner start error:', err);
        setIsScanning(false);
        alert('Erreur d\'accès à la caméra. Veuillez utiliser la saisie manuelle.');
      });
    }, 500); // Increased delay to ensure modal is fully rendered
  };

  const stopBarcodeScanner = () => {
    if (scanner) {
      scanner.stop().then(() => {
        setScanner(null);
        setIsScanning(false);
        setIsScanModalOpen(false);
      }).catch((err) => {
        console.error('📱 Scanner stop error:', err);
        setScanner(null);
        setIsScanning(false);
        setIsScanModalOpen(false);
      });
    } else {
      setIsScanning(false);
      setIsScanModalOpen(false);
    }
  };

  const handleExportPDF = () => {
    const element = detailRef.current;
    const opt = {
      margin: 1,
      filename: `mission-${viewMission.mission_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Filter missions based on search term
  const filteredMissions = (missions || []).filter(mission =>
    mission.mission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDriverName(mission.driver_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getWarehouseName(mission.warehouse_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pick-Up Client</h1>
            <p className="text-gray-600 mt-1">Gestion des missions de livraison du dépôt vers le client</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nouvelle Mission</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par numéro de mission, chauffeur ou entrepôt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Missions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chauffeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrepôt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMissions.map((mission) => (
                <tr key={mission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{mission.mission_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getDriverName(mission.driver_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getWarehouseName(mission.warehouse_id)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(mission.delivery_date).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{mission.assigned_parcels || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {statusBadge(mission.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(mission)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => handleEdit(mission)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelivery(mission)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Livraison
                      </button>
                      <button
                        onClick={() => handleDelete(mission)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Mission Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4">
            {editingMission ? 'Modifier la Mission' : 'Nouvelle Mission de Livraison'}
          </h2>
          
          {viewMission ? (
            // View mode
            <div ref={detailRef} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numéro de Mission</label>
                  <p className="mt-1 text-sm text-gray-900">{viewMission.mission_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <div className="mt-1">{statusBadge(viewMission.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chauffeur</label>
                  <p className="mt-1 text-sm text-gray-900">{getDriverName(viewMission.driver_id)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entrepôt</label>
                  <p className="mt-1 text-sm text-gray-900">{getWarehouseName(viewMission.warehouse_id)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de Livraison</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(viewMission.delivery_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Colis Assignés</label>
                  <p className="mt-1 text-sm text-gray-900">{viewMission.assigned_parcels || 0}</p>
                </div>
              </div>
              
              {viewMission.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{viewMission.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleExportPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Exporter PDF
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            // Edit/Create mode
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chauffeur</label>
                  <select
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Sélectionner un chauffeur</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entrepôt</label>
                  <select
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="">Sélectionner un entrepôt</option>
                    {warehouses && warehouses.length > 0 ? (
                      warehouses.map(warehouse => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Aucun entrepôt disponible</option>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de Livraison</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scanner les Colis</label>
                
                {/* Barcode Scanner Input */}
                <div className="mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={scannedCode}
                      onChange={(e) => {
                        console.log('🔍 Input onChange:', e.target.value);
                        setScannedCode(e.target.value);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBarcodeScan();
                        }
                      }}
                      placeholder="Entrez ou scannez le code-barres du colis..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔘 Scan button clicked');
                        startBarcodeScanner();
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                      </svg>
                      <span>Scanner</span>
                    </button>
                  </div>
                  
                  {/* Scan Message */}
                  {scanMessage && (
                    <div className={`mt-2 p-2 rounded-md text-sm font-medium ${
                      scanMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {scanMessage}
                    </div>
                  )}
                </div>

                {/* Selected Parcels */}
                <div className="border border-gray-300 rounded-md p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Colis Scannés ({formData.parcelIds.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {formData.parcelIds.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Aucun colis scanné</p>
                    ) : (
                      formData.parcelIds.map(parcelId => {
                        const parcel = availableParcels.find(p => p.id === parcelId);
                        return parcel ? (
                          <div key={parcelId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">
                              {parcel.tracking_number} - {parcel.recipient_name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleParcelSelection(parcelId)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>
                </div>

                {/* Available Parcels Count */}
                <div className="mt-2 text-sm text-gray-600">
                  {availableParcels.length} colis disponibles au dépôt
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  {editingMission ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Delivery Modal */}
      <Modal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Livraison de Colis</h2>
          
          <form onSubmit={(e) => { e.preventDefault(); handleDeliverySubmit(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Colis</label>
              <select
                name="parcelId"
                value={deliveryFormData.parcelId}
                onChange={handleDeliveryInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              >
                <option value="">Sélectionner un colis</option>
                {selectedMission?.parcels?.map(parcel => (
                  <option key={parcel.id} value={parcel.id}>
                    {parcel.tracking_number} - {parcel.recipient_name} ({parcel.recipient_governorate || parcel.destination})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Code de Sécurité</label>
              <input
                type="text"
                name="securityCode"
                value={deliveryFormData.securityCode}
                onChange={handleDeliveryInputChange}
                placeholder="Entrez le code de sécurité"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Code client pour livraison réussie, code échec pour retour au dépôt
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsDeliveryModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Traiter la Livraison
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Barcode Scanner Modal */}
      <Modal isOpen={isScanModalOpen} onClose={stopBarcodeScanner}>
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Scanner de Code-Barres</h2>
          
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Pointez la caméra vers le code-barres du colis
              </p>
              
              <div id="qr-reader" className="mx-auto" style={{ width: 300, height: 200 }}></div>
              
              {isScanning && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Scan en cours...</p>
                  <p className="text-xs text-gray-400 mt-1">Pointez la caméra vers un code-barres</p>
                </div>
              )}

              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                  <p><strong>Debug:</strong> Scanner actif: {isScanning ? 'Oui' : 'Non'}</p>
                  <p>Code saisi: {scannedCode || 'Aucun'}</p>
                  <p>Parcels disponibles: {availableParcels.length}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const testCode = availableParcels.length > 0 ? availableParcels[0].tracking_number : 'TEST123';
                      setScannedCode(testCode);
                      handleBarcodeScan();
                    }}
                    className="mt-2 bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Test Scan (Premier colis)
                  </button>
                </div>
              )}
            </div>

            {/* Manual Input Option */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Ou saisissez manuellement le code :</p>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleBarcodeScan();
                      stopBarcodeScanner();
                    }
                  }}
                  placeholder="Code du colis..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleBarcodeScan();
                    stopBarcodeScanner();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-semibold"
                >
                  Valider
                </button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={stopBarcodeScanner}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PickupClient; 