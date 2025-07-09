import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import html2pdf from "html2pdf.js";
import ActionButtons from "./common/ActionButtons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  { key: "Retour en cours d’expédition", label: "Retour En Cours d'expédition", color: "#6366F1" },
  { key: "Retour reçu", label: "Retour reçu", color: "#06B6D4" },
];

// Mock colis data generator
function generateMockColis(warehouseId) {
  const clients = [
    { name: "Pierre Dubois", phone: "+33 6 12 34 56 78" },
    { name: "Marie Dupont", phone: "+33 6 98 76 54 32" },
    { name: "Jean Martin", phone: "+33 6 55 44 33 22" },
    { name: "Sophie Bernard", phone: "+33 6 77 66 55 44" },
    { name: "Thomas Leroy", phone: "+33 6 11 22 33 44" },
    { name: "Emma Rousseau", phone: "+33 6 99 88 77 66" },
    { name: "Fatima Benali", phone: "+33 6 77 66 55 44" },
  ];
  let colis = [];
  let id = 1;
  COLIS_STATUSES.forEach((status, idx) => {
    for (let i = 0; i < 3; i++) {
      const client = clients[(idx + i) % clients.length];
      colis.push({
        id: `${warehouseId}-${status.key}-${i+1}`,
        code: `QZ${warehouseId}${status.key.substring(0,2).toUpperCase()}${i+1}`,
        client: client.name,
        phone: client.phone,
        date: `2023-03-${10 + idx + i}`,
        status: status.key,
      });
      id++;
    }
  });
  return colis;
}

const Entrepots = () => {
  const [warehouses, setWarehouses] = useState([
    {
      id: 1,
      name: "Entrepôt Paris Central",
      location: "Paris",
      capacity: "1000 m²",
      manager: "Pierre Dubois",
      currentStock: "75%",
      status: "Actif",
      address: "123 Rue de la Paix, 75001 Paris",
      phone: "+33 1 23 45 67 89",
      email: "paris@quickzone.fr",
      createdAt: "2023-01-15",
      users: [
        {
          id: 1,
          name: "Marie Dupont",
          role: "Chef d'équipe",
          email: "marie.dupont@quickzone.fr",
          phone: "+33 6 12 34 56 78",
          status: "Actif",
          joinDate: "2023-02-01",
          packages: 45,
          performance: "95%"
        },
        {
          id: 2,
          name: "Jean Martin",
          role: "Livreur",
          email: "jean.martin@quickzone.fr",
          phone: "+33 6 98 76 54 32",
          status: "Actif",
          joinDate: "2023-03-15",
          packages: 38,
          performance: "88%"
        },
        {
          id: 3,
          name: "Sophie Bernard",
          role: "Agent de tri",
          email: "sophie.bernard@quickzone.fr",
          phone: "+33 6 55 44 33 22",
          status: "Actif",
          joinDate: "2023-01-20",
          packages: 52,
          performance: "92%"
        }
      ],
      statistics: {
        totalPackages: 135,
        deliveredToday: 28,
        pendingPackages: 12,
        averageDeliveryTime: "2.3h",
        monthlyGrowth: "+15%",
        customerSatisfaction: "4.8/5"
      }
    },
    {
      id: 2,
      name: "Entrepôt Lyon",
      location: "Lyon",
      capacity: "800 m²",
      manager: "Sarah Ahmed",
      currentStock: "60%",
      status: "Actif",
      address: "456 Avenue des Alpes, 69001 Lyon",
      phone: "+33 4 78 90 12 34",
      email: "lyon@quickzone.fr",
      createdAt: "2023-03-10",
      users: [
        {
          id: 4,
          name: "Thomas Leroy",
          role: "Chef d'équipe",
          email: "thomas.leroy@quickzone.fr",
          phone: "+33 6 11 22 33 44",
          status: "Actif",
          joinDate: "2023-04-01",
          packages: 42,
          performance: "91%"
        },
        {
          id: 5,
          name: "Emma Rousseau",
          role: "Livreur",
          email: "emma.rousseau@quickzone.fr",
          phone: "+33 6 99 88 77 66",
          status: "Actif",
          joinDate: "2023-05-10",
          packages: 35,
          performance: "85%"
        }
      ],
      statistics: {
        totalPackages: 77,
        deliveredToday: 15,
        pendingPackages: 8,
        averageDeliveryTime: "2.8h",
        monthlyGrowth: "+12%",
        customerSatisfaction: "4.6/5"
      }
    },
    {
      id: 3,
      name: "Entrepôt Marseille",
      location: "Marseille",
      capacity: "600 m²",
      manager: "Mohamed Ali",
      currentStock: "90%",
      status: "Inactif",
      address: "789 Boulevard de la Mer, 13001 Marseille",
      phone: "+33 4 91 23 45 67",
      email: "marseille@quickzone.fr",
      createdAt: "2023-02-20",
      users: [
        {
          id: 6,
          name: "Fatima Benali",
          role: "Chef d'équipe",
          email: "fatima.benali@quickzone.fr",
          phone: "+33 6 77 66 55 44",
          status: "Inactif",
          joinDate: "2023-03-01",
          packages: 0,
          performance: "0%"
        }
      ],
      statistics: {
        totalPackages: 0,
        deliveredToday: 0,
        pendingPackages: 0,
        averageDeliveryTime: "0h",
        monthlyGrowth: "0%",
        customerSatisfaction: "0/5"
      }
    },
  ].map((w, idx) => ({ ...w, mockColis: generateMockColis(w.id) })));

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    manager: "",
    status: "Actif",
  });
  const [colisModal, setColisModal] = useState({ open: false, status: null, colis: [] });

  const columns = [
    { key: "name", header: "Nom de l'entrepôt" },
    { key: "location", header: "Localisation" },
    { key: "capacity", header: "Capacité" },
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
      location: "",
      capacity: "",
      manager: "",
      status: "Actif",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData(warehouse);
    setIsModalOpen(true);
  };

  const handleDelete = (warehouse) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet entrepôt ?")) {
      setWarehouses(warehouses.filter((w) => w.id !== warehouse.id));
      if (selectedWarehouse?.id === warehouse.id) {
        setSelectedWarehouse(null);
      }
    }
  };

  const handleViewDetails = (warehouse) => {
    setSelectedWarehouse(selectedWarehouse?.id === warehouse.id ? null : warehouse);
  };

  const handleSubmit = () => {
    if (editingWarehouse) {
      setWarehouses(
        warehouses.map((warehouse) =>
          warehouse.id === editingWarehouse.id ? { ...formData, id: warehouse.id, currentStock: warehouse.currentStock } : warehouse
        )
      );
    } else {
      const newWarehouse = {
        ...formData,
        id: Math.max(...warehouses.map((w) => w.id)) + 1,
        currentStock: "0%",
        address: "",
        phone: "",
        email: "",
        createdAt: new Date().toISOString().split('T')[0],
        users: [],
        statistics: {
          totalPackages: 0,
          deliveredToday: 0,
          pendingPackages: 0,
          averageDeliveryTime: "0h",
          monthlyGrowth: "0%",
          customerSatisfaction: "0/5"
        }
      };
      setWarehouses([...warehouses, newWarehouse]);
    }
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const exportToExcel = () => {
    if (!selectedWarehouse) return;
    const allColis = selectedWarehouse.mockColis;
    const data = allColis.map(colis => ({
      Code: colis.code,
      Client: colis.client,
      Téléphone: colis.phone,
      Date: colis.date,
      Statut: colis.status,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colis");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `entrepot_${selectedWarehouse.name.replace(/\s+/g, '_')}_colis_${new Date().toISOString().split('T')[0]}.xlsx`);
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
          {users.map((user) => (
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joinDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.packages}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.performance}</td>
            </tr>
          ))}
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
          {warehouse.users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{user.name.charAt(0)}</span>
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
                    style={{ width: user.performance }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-12">{user.performance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique de répartition des colis */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des colis</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Livrés aujourd'hui</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(warehouse.statistics.deliveredToday / warehouse.statistics.totalPackages) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{warehouse.statistics.deliveredToday}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">En attente</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-yellow-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(warehouse.statistics.pendingPackages / warehouse.statistics.totalPackages) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{warehouse.statistics.pendingPackages}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total traité</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${((warehouse.statistics.totalPackages - warehouse.statistics.pendingPackages) / warehouse.statistics.totalPackages) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium">{warehouse.statistics.totalPackages - warehouse.statistics.pendingPackages}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
                <p><strong>Capacité:</strong> {selectedWarehouse.capacity}</p>
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

          {/* Status cards grid (moved here) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {COLIS_STATUSES.map((status) => {
              const count = selectedWarehouse.mockColis.filter(c => c.status === status.key).length;
              return (
                <div
                  key={status.key}
                  className="flex items-center space-x-3 bg-white border shadow rounded-lg p-3 cursor-pointer hover:shadow-lg transition"
                  style={{ borderColor: status.color }}
                  onClick={() => setColisModal({ open: true, status: status.key, colis: selectedWarehouse.mockColis.filter(c => c.status === status.key) })}
                >
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: status.color }}></span>
                  <span className="font-medium text-gray-800">{status.label}</span>
                  <span className="ml-auto text-xs font-bold" style={{ color: status.color }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Liste des utilisateurs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Utilisateurs de l'entrepôt ({selectedWarehouse.users.length})
            </h3>
            {selectedWarehouse.users.length > 0 ? (
              renderUserTable(selectedWarehouse.users)
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun utilisateur assigné à cet entrepôt
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal d'ajout/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWarehouse ? "Modifier l'entrepôt" : "Ajouter un entrepôt"}
        size="md"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localisation
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sélectionner</option>
              <option value="Tunis">Tunis</option>
              <option value="Ariana">Ariana</option>
              <option value="Ben Arous">Ben Arous</option>
              <option value="Manouba">Manouba</option>
              <option value="Nabeul">Nabeul</option>
              <option value="Zaghouan">Zaghouan</option>
              <option value="Bizerte">Bizerte</option>
              <option value="Béja">Béja</option>
              <option value="Jendouba">Jendouba</option>
              <option value="Kef">Kef</option>
              <option value="Siliana">Siliana</option>
              <option value="Sousse">Sousse</option>
              <option value="Monastir">Monastir</option>
              <option value="Mahdia">Mahdia</option>
              <option value="Sfax">Sfax</option>
              <option value="Kairouan">Kairouan</option>
              <option value="Kasserine">Kasserine</option>
              <option value="Sidi Bouzid">Sidi Bouzid</option>
              <option value="Gabès">Gabès</option>
              <option value="Medenine">Medenine</option>
              <option value="Tataouine">Tataouine</option>
              <option value="Gafsa">Gafsa</option>
              <option value="Tozeur">Tozeur</option>
              <option value="Kebili">Kebili</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacité
            </label>
            <input
              type="text"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="Ex : 1000 m²"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsable
            </label>
            <input
              type="text"
              name="manager"
              value={formData.manager}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {editingWarehouse ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal for colis by status */}
      <Modal
        isOpen={colisModal.open}
        onClose={() => setColisModal({ open: false, status: null, colis: [] })}
        title={colisModal.status ? `Colis - ${colisModal.status}` : "Colis"}
        size="xl"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Téléphone</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {colisModal.colis.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Aucun colis pour ce statut</td></tr>
              ) : colisModal.colis.map((colis) => (
                <tr key={colis.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{colis.code}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{colis.client}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{colis.phone}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{colis.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm" style={{ color: COLIS_STATUSES.find(s => s.key === colis.status)?.color }}>{colis.status}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:underline">Voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
};

export default Entrepots; 