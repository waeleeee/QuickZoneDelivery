import React, { useState, useEffect } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import html2pdf from "html2pdf.js";
import ActionButtons from "./common/ActionButtons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FactureColis from "./FactureColis";
import BonLivraisonColis from "./BonLivraisonColis";
import { warehousesService } from "../../services/api";

// List of Tunisian governorates
const gouvernorats = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", 
  "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine", 
  "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", 
  "Tozeur", "Tunis", "Zaghouan"
];

// Statuses and their colors (matching the legend)
const COLIS_STATUSES = [
  { key: "En attente", label: "En attente", color: "#F59E42" },
  { key: "À enlever", label: "À enlever", color: "#F59E42" },
  { key: "Enlevé", label: "Enlevé", color: "#8B5CF6" },
  { key: "Au dépôt", label: "Au dépôt", color: "#3B82F6" },
  { key: "En cours", label: "En cours", color: "#A78BFA" },
  { key: "Rtn dépôt", label: "RTN dépôt", color: "#FB923C" },
  { key: "Livrés", label: "Livrés", color: "#22C55E" },
  { key: "Livrés payés", label: "Livrés payés", color: "#16A34A" },
  { key: "Retour définitif", label: "Retour définitif", color: "#EF4444" },
  { key: "Rtn Client Agence", label: "RTN client agence", color: "#EC4899" },
  { key: "Retour Expéditeur", label: "Retour Expéditeur", color: "#6B7280" },
  { key: "Retour en cours d'expédition", label: "Retour En Cours d'expédition", color: "#6366F1" },
  { key: "Retour reçu", label: "Retour reçu", color: "#06B6D4" },
];

const Entrepots = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    gouvernorat: "Tunis",
    manager: "",
    status: "Actif",
  });
  const [chefAgences, setChefAgences] = useState([]);
  const [colisModal, setColisModal] = useState({ open: false, status: null, colis: [] });
  const [factureColis, setFactureColis] = useState(null);
  const [bonLivraisonColis, setBonLivraisonColis] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [parcelDetailsModal, setParcelDetailsModal] = useState(false);


  // Fetch warehouses data on component mount
  useEffect(() => {
    fetchWarehouses();
    fetchChefAgences();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching warehouses data...');
      
      const response = await warehousesService.getWarehouses();
      console.log('📦 Warehouses data received:', response);
      
      // Handle both expected format (response.success && response.data) and direct array format
      let warehousesData = [];
      if (response && response.success && response.data) {
        warehousesData = response.data;
      } else if (Array.isArray(response)) {
        warehousesData = response;
      } else {
        console.warn('⚠️ Unexpected warehouses response format:', response);
        setWarehouses([]);
        return;
      }
      
      // Transform the data to match the expected format
      const transformedWarehouses = warehousesData.map(warehouse => ({
          id: warehouse.id,
          name: warehouse.name,
          location: warehouse.governorate,
          gouvernorat: warehouse.governorate,
          manager: warehouse.manager_name || 'Non assigné',
          currentStock: warehouse.current_stock && warehouse.capacity ? `${Math.round((warehouse.current_stock / warehouse.capacity) * 100)}%` : '0%',
          status: warehouse.status || 'Actif',
          address: warehouse.address || 'Non renseignée',
          phone: warehouse.manager_phone || 'Non renseigné',
          email: warehouse.manager_email || 'Non renseigné',
          createdAt: new Date(warehouse.created_at).toLocaleDateString('fr-FR'),
          capacity: warehouse.capacity || 100,
          current_stock: warehouse.current_stock || 0,
          manager_id: warehouse.manager_id,
          // Default statistics (will be updated when warehouse details are fetched)
          statistics: {
            totalPackages: 0,
            deliveredToday: 0,
            pendingPackages: 0,
            averageDeliveryTime: '0h',
            monthlyGrowth: '0%',
            customerSatisfaction: '0/5'
          },
          users: [],
          parcelsByStatus: []
        }));
        
        setWarehouses(transformedWarehouses);
        console.log('✅ Warehouses data transformed and set:', transformedWarehouses);
    } catch (error) {
      console.error('❌ Error fetching warehouses:', error);
      setError('Failed to fetch warehouses data');
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChefAgences = async () => {
    try {
      console.log('🔍 Fetching Chef d\'agence users...');
      const response = await fetch('http://localhost:5000/api/personnel/users?role=Chef d\'agence');
      const data = await response.json();
      
      if (data.success && data.data) {
        const chefAgencesList = data.data.map(user => ({
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email
        }));
        setChefAgences(chefAgencesList);
        console.log('✅ Chef d\'agence users loaded:', chefAgencesList);
      }
    } catch (error) {
      console.error('❌ Error fetching Chef d\'agence users:', error);
    }
  };

  const fetchWarehouseDetails = async (warehouseId) => {
    try {
      console.log('🔍 Fetching warehouse details for ID:', warehouseId);
      const response = await warehousesService.getWarehouseDetails(warehouseId);
      console.log('📦 Warehouse details received:', response);
      
      // Handle both response formats: {success: true, data: {...}} and direct data object
      let details;
      if (response && response.success && response.data) {
        details = response.data;
      } else if (response && response.id) {
        // Direct data object format
        details = response;
      } else {
        console.warn('⚠️ Unexpected warehouse details response format:', response);
        return;
      }
      
        console.log('📊 Details data:', details);
        console.log('📊 Statistics:', details.statistics);
        console.log('📊 Parcels by status:', details.parcelsByStatus);
        
        // Update the warehouse with detailed information
        setWarehouses(prevWarehouses => 
          prevWarehouses.map(warehouse => 
            warehouse.id === warehouseId 
              ? {
                  ...warehouse,
                currentStock: details.current_stock && details.capacity ? `${Math.round((details.current_stock / details.capacity) * 100)}%` : '0%',
                current_stock: details.current_stock || 0,
                capacity: details.capacity || 100,
                  statistics: details.statistics || warehouse.statistics,
                  users: details.users || warehouse.users,
                  parcelsByStatus: details.parcelsByStatus || warehouse.parcelsByStatus
                }
              : warehouse
          )
        );
        
      // Update selected warehouse with the detailed information
      setSelectedWarehouse(prev => {
        if (prev && prev.id === warehouseId) {
          return {
            ...prev,
            currentStock: details.current_stock && details.capacity ? `${Math.round((details.current_stock / details.capacity) * 100)}%` : '0%',
            current_stock: details.current_stock || 0,
            capacity: details.capacity || 100,
            statistics: details.statistics || prev.statistics,
            users: details.users || prev.users,
            parcelsByStatus: details.parcelsByStatus || prev.parcelsByStatus
          };
        }
        return prev;
      });
    } catch (error) {
      console.error('❌ Error fetching warehouse details:', error);
    }
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nom de l'entrepôt" },
    { key: "gouvernorat", header: "Gouvernorat" },
    { key: "address", header: "Adresse" },
    { key: "manager", header: "Responsable" },
    {
      key: "currentStock",
      header: "Stock actuel",
      render: (value) => (
        <div className="flex items-center">
          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: value }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{value}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, warehouse) => (
        <ActionButtons
          onView={() => handleViewDetails(warehouse)}
          onEdit={() => handleEdit(warehouse)}
          onDelete={() => handleDelete(warehouse)}
        />
      ),
    },
  ];

  const handleAdd = () => {
    setEditingWarehouse(null);
    setFormData({
      name: "",
      gouvernorat: "Tunis",
      address: "",
      manager: "",
      status: "Actif",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      gouvernorat: warehouse.gouvernorat,
      address: warehouse.address || "",
      manager: warehouse.manager_id || warehouse.manager,
      status: warehouse.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (warehouse) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt ?")) {
      try {
        await warehousesService.deleteWarehouse(warehouse.id);
      setWarehouses(warehouses.filter((w) => w.id !== warehouse.id));
      if (selectedWarehouse?.id === warehouse.id) {
        setSelectedWarehouse(null);
      }
      } catch (error) {
        console.error('❌ Error deleting warehouse:', error);
        alert('Erreur lors de la suppression de l\'entrepôt');
      }
    }
  };

  const handleViewDetails = async (warehouse) => {
    setSelectedWarehouse(warehouse);
    // Always fetch detailed information when viewing a warehouse
    console.log('🔍 Fetching details for warehouse:', warehouse.id);
    await fetchWarehouseDetails(warehouse.id);
  };

  const handleSubmit = async () => {
    try {
      const warehouseData = {
        name: formData.name,
        governorate: formData.gouvernorat,
        address: formData.address || '',
        manager_id: formData.manager || null,
        capacity: 100,
        status: formData.status
      };

      if (editingWarehouse) {
        await warehousesService.updateWarehouse(editingWarehouse.id, warehouseData);
        // Refresh the warehouses list
        await fetchWarehouses();
      } else {
        await warehousesService.createWarehouse(warehouseData);
        // Refresh the warehouses list
        await fetchWarehouses();
    }
    setIsModalOpen(false);
    } catch (error) {
      console.error('❌ Error saving warehouse:', error);
      alert('Erreur lors de la sauvegarde de l\'entrepôt');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusCardClick = async (status, count) => {
    if (count === 0) return; // Don't open modal if no parcels
    
    try {
      console.log('🔍 Fetching parcels for status:', status, 'in warehouse:', selectedWarehouse.id);
      
      // Fetch parcels for this specific status and warehouse
      const response = await fetch(`http://localhost:5000/api/parcels?warehouse_id=${selectedWarehouse.id}&status=${encodeURIComponent(status)}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const parcels = data.data.map(parcel => ({
          id: parcel.id,
          code: parcel.tracking_number || parcel.id,
          expediteur: parcel.shipper_name || 'N/A',
          destination: parcel.destination || 'N/A',
          status: parcel.status,
          poids: parcel.weight ? `${parseFloat(parcel.weight).toFixed(2)} kg` : 'N/A',
          date_creation: parcel.created_at ? new Date(parcel.created_at).toLocaleDateString('fr-FR') : 'N/A',
          prix: parcel.price ? `${parseFloat(parcel.price).toFixed(2)} €` : 'N/A',
          phone: parcel.sender_phone || parcel.shipper_phone || 'N/A',
          adresse: parcel.destination || 'N/A',
          designation: parcel.type || 'Livraison',
          nombre_articles: 1,
          // Additional fields for Bon de Livraison and Facture
          shipper_name: parcel.shipper_name || 'N/A',
          shipper_address: parcel.shipper_address || 'N/A',
          shipper_phone: parcel.shipper_phone || 'N/A',
          shipper_email: parcel.shipper_email || 'N/A',
          shipper_tax_number: parcel.shipper_tax_number || 'N/A',
          recipient_name: parcel.recipient_name || parcel.destination || 'N/A',
          recipient_address: parcel.recipient_address || parcel.destination || 'N/A',
          recipient_phone: parcel.recipient_phone || 'N/A',
          created_at: parcel.created_at,
          tracking_number: parcel.tracking_number || parcel.id,
          type: parcel.type || 'Livraison'
        }));
        
        console.log('📦 Found parcels:', parcels.length, 'for status:', status);
        
        setColisModal({
          open: true,
          status: status,
          colis: parcels
        });
      } else {
        console.warn('No parcels found for status:', status);
        setColisModal({
          open: true,
          status: status,
          colis: []
        });
      }
    } catch (error) {
      console.error('❌ Error fetching parcels for status:', error);
      setColisModal({
        open: true,
        status: status,
        colis: []
      });
    }
  };

  const exportToExcel = () => {
    if (!selectedWarehouse) return;
    
    // Use real parcel data if available, otherwise show empty data
    const data = selectedWarehouse.parcelsByStatus?.map(item => ({
      Statut: item.status,
      Nombre: item.count
    })) || [];
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colis");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `entrepot_${selectedWarehouse.name.replace(/\s+/g, '_')}_colis_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportParcelsToExcel = () => {
    if (!colisModal.colis || colisModal.colis.length === 0) return;
    
    const data = colisModal.colis.map(parcel => ({
      'N° Colis': parcel.code,
      'Expéditeur': parcel.expediteur,
      'Destination': parcel.destination,
      'Statut': parcel.status,
      'Poids': parcel.poids,
      'Date de création': parcel.date_creation,
      'Date de livraison estimée': parcel.date_livraison,
      'Prix': parcel.prix
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colis");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `colis_${colisModal.status}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleParcelClick = (parcel) => {
    // Show parcel details modal
    setSelectedParcel(parcel);
    setParcelDetailsModal(true);
  };

  const renderUserTable = (users) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'entrée</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colis traités</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users && users.length > 0 ? users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.status === "Actif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {user.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.entry_date ? new Date(user.entry_date).toLocaleDateString('fr-FR') : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.packages_processed || 0}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.performance_percentage || 0}%</td>
            </tr>
          )) : (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                Aucun utilisateur assigné à cet entrepôt
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderStatistics = (stats) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-2xl font-bold text-blue-600">{stats.totalPackages}</div>
        <div className="text-sm text-gray-600">Total colis</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-2xl font-bold text-green-600">{stats.deliveredToday}</div>
        <div className="text-sm text-gray-600">Livrés aujourd'hui</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-2xl font-bold text-yellow-600">{stats.pendingPackages}</div>
        <div className="text-sm text-gray-600">En attente</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-2xl font-bold text-purple-600">{stats.averageDeliveryTime}</div>
        <div className="text-sm text-gray-600">Temps moyen</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-2xl font-bold text-indigo-600">{stats.monthlyGrowth}</div>
        <div className="text-sm text-gray-600">Croissance mensuelle</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="text-2xl font-bold text-pink-600">{stats.customerSatisfaction}</div>
        <div className="text-sm text-gray-600">Satisfaction client</div>
      </div>
    </div>
  );

  const renderCharts = (warehouse) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Graphique de performance des utilisateurs */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance des utilisateurs</h3>
        <div className="space-y-4">
          {warehouse.users && warehouse.users.length > 0 ? warehouse.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{user.name?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${user.performance_percentage || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{user.performance_percentage || 0}%</span>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-500 py-4">
              Aucun utilisateur assigné
            </div>
          )}
        </div>
      </div>

      {/* Graphique de répartition des colis */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des colis</h3>
        <div className="space-y-4">
          {warehouse.parcelsByStatus && warehouse.parcelsByStatus.length > 0 ? (
            warehouse.parcelsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.status}</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / warehouse.statistics.totalPackages) * 100}%` }}
                ></div>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              Aucun colis dans cet entrepôt
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Chargement des entrepôts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Erreur: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header harmonisé */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des entrepôts</h1>
          <p className="text-gray-600 mt-1">Gérez les informations de vos entrepôts et leurs utilisateurs</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un entrepôt
        </button>
      </div>

      {/* Tableau des entrepôts */}
      <DataTable
        data={warehouses}
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showActions={false}
      />

      {/* Détails de l'entrepôt sélectionné */}
      {selectedWarehouse && (
        <div id="warehouse-details" className="bg-white rounded-lg shadow border p-6">
          {/* Entrepôt info */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedWarehouse.name}</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Localisation:</strong> {selectedWarehouse.location}</p>
                <p><strong>Adresse:</strong> {selectedWarehouse.address || "Non renseignée"}</p>
                <p><strong>Responsable:</strong> {selectedWarehouse.manager}</p>
                <p><strong>Téléphone:</strong> {selectedWarehouse.phone || "Non renseigné"}</p>
                <p><strong>Email:</strong> {selectedWarehouse.email || "Non renseigné"}</p>
                <p><strong>Stock actuel:</strong> {selectedWarehouse.currentStock}</p>
                <p><strong>Date de création:</strong> {selectedWarehouse.createdAt}</p>
                <p><strong>Statut:</strong> 
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    selectedWarehouse.status === "Actif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {selectedWarehouse.status}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Exporter en Excel
              </button>
              <button
                onClick={() => setSelectedWarehouse(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Fermer
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de l'entrepôt</h3>
            {renderStatistics(selectedWarehouse.statistics)}
          </div>

          {/* Status cards grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des colis par statut</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {/* Total Card */}
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total</p>
                    <p className="text-xl font-bold text-blue-600">{selectedWarehouse.statistics?.totalPackages || 0}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Cards */}
            {COLIS_STATUSES.map((status) => {
              const statusData = selectedWarehouse.parcelsByStatus?.find(s => s.status === status.key);
              const count = statusData ? statusData.count : 0;
              return (
                <div
                  key={status.key}
                    className={`bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow ${count === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => count > 0 && handleStatusCardClick(status.key, count)}
                >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-600">{status.label}</p>
                        <p className="text-xl font-bold" style={{ color: status.color }}>{count}</p>
                      </div>
                      <div className="p-2 rounded-full" style={{ backgroundColor: `${status.color}20` }}>
                        <svg className="w-5 h-5" style={{ color: status.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* Charts */}
          {renderCharts(selectedWarehouse)}

          {/* Utilisateurs de l'entrepôt */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Utilisateurs de l'entrepôt ({selectedWarehouse.users?.length || 0})
            </h3>
            {renderUserTable(selectedWarehouse.users)}
          </div>
        </div>
      )}

      {/* Modal pour ajouter/modifier un entrepôt */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? "Modifier l'entrepôt" : "Ajouter un entrepôt"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entrepôt
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez le nom de l'entrepôt"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gouvernorat
            </label>
            <select
              name="gouvernorat"
              value={formData.gouvernorat}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {gouvernorats.map((gouvernorat) => (
                <option key={gouvernorat} value={gouvernorat}>
                  {gouvernorat}
                </option>
                ))}
              </select>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Entrez l'adresse de l'entrepôt"
            />
            </div>
                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsable
            </label>
            <select
              name="manager"
              value={formData.manager}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionnez un responsable</option>
              {chefAgences.map((chef) => (
                <option key={chef.id} value={chef.id}>
                  {chef.name} ({chef.email})
                </option>
              ))}
            </select>
          </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingWarehouse ? "Modifier" : "Ajouter"}
            </button>
          </div>
          </div>
      </Modal>

      {/* Modal pour les colis par statut */}
      <Modal
        isOpen={colisModal.open}
        onClose={() => setColisModal({ open: false, status: null, colis: [] })}
        title={`Colis - ${colisModal.status}`}
        size="xl"
      >
        <div className="space-y-4">
          {colisModal.colis.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  {colisModal.colis.length} colis trouvés
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={exportParcelsToExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Exporter en Excel
                  </button>
                  <button
                    onClick={() => setColisModal({ open: false, status: null, colis: [] })}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Fermer
                  </button>
                </div>
              </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Colis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expéditeur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poids</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                  {colisModal.colis.map((colis) => (
                      <tr key={colis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{colis.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{colis.expediteur}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{colis.destination}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{colis.poids}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{colis.date_creation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{colis.prix}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleParcelClick(colis);
                              }}
                              title="Voir détails"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBonLivraisonColis([colis]);
                              }}
                              title="Bon de livraison"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button 
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFactureColis([colis]);
                              }}
                              title="Facture"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Aucun colis trouvé pour ce statut
            </div>
          )}
        </div>
      </Modal>

      {/* Modals pour facture et bon de livraison */}
        {factureColis && (
          <Modal
            isOpen={!!factureColis}
          onClose={() => setFactureColis(null)}
            title="Facture"
            size="xl"
          >
            <FactureColis
              colis={{
                code: factureColis[0]?.code || factureColis[0]?.tracking_number,
                nom: factureColis[0]?.expediteur,
                adresse: factureColis[0]?.destination,
                poids: factureColis[0]?.poids?.replace(' kg', '') || '0'
              }}
              client={{
                nom: factureColis[0]?.expediteur,
                tel: factureColis[0]?.phone
              }}
              expediteur={{
                nom: factureColis[0]?.shipper_name || factureColis[0]?.expediteur,
                tel: factureColis[0]?.shipper_phone,
                adresse: factureColis[0]?.shipper_address,
                nif: factureColis[0]?.shipper_tax_number
              }}
              prix={{
                ttc: factureColis[0]?.prix || '0.00 €',
                ht: factureColis[0]?.prix || '0.00 €',
                tva: '0.00 €',
                totalLivraison: factureColis[0]?.prix || '0.00 €'
              }}
        />
          </Modal>
      )}

        {bonLivraisonColis && (
          <Modal
            isOpen={!!bonLivraisonColis}
          onClose={() => setBonLivraisonColis(null)}
            title="Bon de Livraison"
            size="xl"
          >
            <BonLivraisonColis
              colis={{
                code: bonLivraisonColis[0]?.code || bonLivraisonColis[0]?.tracking_number
              }}
              expediteur={{
                nom: bonLivraisonColis[0]?.shipper_name || bonLivraisonColis[0]?.expediteur,
                adresse: bonLivraisonColis[0]?.shipper_address || 'Tunis',
                tel: bonLivraisonColis[0]?.shipper_phone || '+216 20 123 456',
                nif: bonLivraisonColis[0]?.shipper_tax_number || 'N/A'
              }}
              destinataire={{
                nom: bonLivraisonColis[0]?.recipient_name || bonLivraisonColis[0]?.destination,
                adresse: bonLivraisonColis[0]?.recipient_address || bonLivraisonColis[0]?.destination,
                tel: bonLivraisonColis[0]?.recipient_phone || '+216 20 123 456'
              }}
              route="Tunis >> ---- Dispatch ---- >> Monastir"
              date={bonLivraisonColis[0]?.date_creation || new Date().toLocaleDateString('fr-FR')}
              docNumber={bonLivraisonColis[0]?.code || bonLivraisonColis[0]?.tracking_number}
              montant={bonLivraisonColis[0]?.prix || '0.00 €'}
              designation={bonLivraisonColis[0]?.designation || 'Livraison'}
            />
          </Modal>
        )}

        {/* Modal pour les détails du colis */}
        {parcelDetailsModal && selectedParcel && (
          <Modal
            isOpen={parcelDetailsModal}
            onClose={() => {
              setParcelDetailsModal(false);
              setSelectedParcel(null);
            }}
            title={`Détails du colis ${selectedParcel.code}`}
            size="xl"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client:</label>
                  <p className="text-sm text-gray-900">{selectedParcel.expediteur}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Montant:</label>
                  <p className="text-sm text-gray-900">{selectedParcel.prix}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone:</label>
                  <p className="text-sm text-gray-900">{selectedParcel.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse:</label>
                  <p className="text-sm text-gray-900">{selectedParcel.adresse}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Désignation:</label>
                  <p className="text-sm text-gray-900">{selectedParcel.designation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre des articles:</label>
                  <p className="text-sm text-gray-900">{selectedParcel.nombre_articles}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{selectedParcel.date_creation}</span>
                  <span className="text-2xl">⏳</span>
                  <span className="text-sm font-medium">{selectedParcel.status}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Colis enregistré dans le système.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Note: Ce colis est actuellement au statut "{selectedParcel.status}". L'historique détaillé des statuts sera disponible une fois que le système de suivi sera complètement opérationnel.
                </p>
              </div>
            </div>
          </Modal>
        )}
    </div>
  );
};

export default Entrepots; 