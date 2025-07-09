import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import html2pdf from "html2pdf.js";
import ActionButtons from "./common/ActionButtons";

// Subcomponent for a single commercial's dashboard
const CommercialDashboard = ({ commercial, expediteurs, commissionRate, onViewExpediteur }) => {
  const navigate = useNavigate();
  const [commercialData, setCommercialData] = useState({
    id: "COM001",
    name: "Jean Dupont",
    email: "jean.dupont@quickzone.tn",
    phone: "+216 71 234 567",
    commissionRate: 5.5, // 5.5% commission per successful parcel
    totalEarnings: 2840.50,
    pendingCommission: 450.75,
    totalClients: 12,
    totalParcels: 156,
    successfulParcels: 142,
    successRate: 91.0
  });

  const [expediteursData, setExpediteursData] = useState([
    {
      id: 1,
      name: "Pierre Dubois",
      email: "pierre.dubois@email.com",
      phone: "+33 1 23 45 67 89",
      address: "12 rue de Paris, 75001 Paris",
      totalShipments: 45,
      successfulShipments: 42,
      registrationDate: "2023-01-15",
      lastActivity: "2024-01-20",
      company: "Dubois Logistics",
      siret: "12345678901234",
      commissionEarned: 115.50, // 5.5% of successful parcels
      status: "active",
      colis: [
        { id: "COL001", status: "Livés", date: "2024-01-18", amount: 25.50, destination: "Paris", weight: "2.5kg", type: "Standard" },
        { id: "COL002", status: "En cours", date: "2024-01-19", amount: 18.75, destination: "Lyon", weight: "1.8kg", type: "Express" },
        { id: "COL003", status: "Livés", date: "2024-01-17", amount: 32.00, destination: "Marseille", weight: "3.2kg", type: "Standard" },
        { id: "COL004", status: "En attente", date: "2024-01-20", amount: 15.25, destination: "Toulouse", weight: "1.5kg", type: "Standard" },
        { id: "COL005", status: "Livés", date: "2024-01-16", amount: 28.90, destination: "Nice", weight: "2.8kg", type: "Express" },
      ]
    },
    {
      id: 2,
      name: "Sarah Ahmed",
      email: "sarah.ahmed@email.com",
      phone: "+33 1 98 76 54 32",
      address: "8 avenue de Lyon, 69001 Lyon",
      totalShipments: 32,
      successfulShipments: 29,
      registrationDate: "2023-03-20",
      lastActivity: "2024-01-19",
      company: "Ahmed Trading",
      siret: "98765432109876",
      commissionEarned: 87.25,
      status: "active",
      colis: [
        { id: "COL006", status: "Livés", date: "2024-01-19", amount: 22.00, destination: "Paris", weight: "2.1kg", type: "Standard" },
        { id: "COL007", status: "En cours", date: "2024-01-20", amount: 19.50, destination: "Lyon", weight: "1.9kg", type: "Express" },
        { id: "COL008", status: "Livés", date: "2024-01-18", amount: 35.75, destination: "Marseille", weight: "3.5kg", type: "Standard" },
      ]
    },
    {
      id: 3,
      name: "Mohamed Ali",
      email: "mohamed.ali@email.com",
      phone: "+33 1 11 22 33 44",
      address: "5 rue Principale, 13001 Marseille",
      totalShipments: 28,
      successfulShipments: 24,
      registrationDate: "2022-11-10",
      lastActivity: "2023-12-15",
      company: "Ali Import Export",
      siret: "11223344556677",
      commissionEarned: 66.00,
      status: "inactive",
      colis: [
        { id: "COL009", status: "Livés", date: "2023-12-10", amount: 45.00, destination: "Paris", weight: "4.5kg", type: "Standard" },
        { id: "COL010", status: "Retour", date: "2023-12-12", amount: 0.00, destination: "Lyon", weight: "2.0kg", type: "Standard" },
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpediteur, setSelectedExpediteur] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    minCommission: "",
    maxCommission: "",
    successRate: ""
  });
  const detailRef = useRef();

  // Calculate commission for a given amount
  const calculateCommission = (amount) => {
    return (amount * commercialData.commissionRate) / 100;
  };

  // Filter expediteurs based on search and advanced filters
  const filteredExpediteurs = expediteursData.filter(expediteur => {
    const matchesSearch = searchTerm === "" || 
      Object.values(expediteur).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus = advancedFilters.status === "" || expediteur.status === advancedFilters.status;
    const matchesMinCommission = advancedFilters.minCommission === "" || expediteur.commissionEarned >= parseFloat(advancedFilters.minCommission);
    const matchesMaxCommission = advancedFilters.maxCommission === "" || expediteur.commissionEarned <= parseFloat(advancedFilters.maxCommission);
    
    const successRate = (expediteur.successfulShipments / expediteur.totalShipments) * 100;
    const matchesSuccessRate = advancedFilters.successRate === "" || successRate >= parseFloat(advancedFilters.successRate);

    return matchesSearch && matchesStatus && matchesMinCommission && matchesMaxCommission && matchesSuccessRate;
  });

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "company", header: "Entreprise" },
    { key: "totalShipments", header: "Total colis" },
    { key: "successfulShipments", header: "Colis réussis" },
    {
      key: "successRate",
      header: "Taux de réussite",
      render: (_, row) => {
        const rate = ((row.successfulShipments / row.totalShipments) * 100).toFixed(1);
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            rate >= 90 ? "bg-green-100 text-green-800" :
            rate >= 80 ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {rate}%
          </span>
        );
      }
    },
    {
      key: "commissionEarned",
      header: "Commission gagnée",
      render: (value) => (
        <span className="font-semibold text-green-600">€{value.toFixed(2)}</span>
      )
    },
    {
      key: "status",
      header: "Statut",
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {value === "active" ? "Actif" : "Inactif"}
        </span>
      )
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onViewExpediteur(row)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
            title="Voir les détails"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => {
              const successfulParcels = row.colis.filter(colis => colis.status === "Livés");
              const totalAmount = successfulParcels.reduce((sum, colis) => sum + colis.amount, 0);
              const commission = calculateCommission(totalAmount);
              alert(`Commission pour ${row.name}:\nTotal colis réussis: ${successfulParcels.length}\nMontant total: €${totalAmount.toFixed(2)}\nCommission (${commercialData.commissionRate}%): €${commission.toFixed(2)}`);
            }}
            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
            title="Calculer commission"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const handleViewDetails = (expediteur) => {
    setSelectedExpediteur(expediteur);
  };

  const handleCalculateCommission = (expediteur) => {
    const successfulParcels = expediteur.colis.filter(colis => colis.status === "Livés");
    const totalAmount = successfulParcels.reduce((sum, colis) => sum + colis.amount, 0);
    const commission = calculateCommission(totalAmount);
    
    alert(`Commission pour ${expediteur.name}:\nTotal colis réussis: ${successfulParcels.length}\nMontant total: €${totalAmount.toFixed(2)}\nCommission (${commercialData.commissionRate}%): €${commission.toFixed(2)}`);
  };

  const handleAdvancedFilterChange = (e) => {
    const { name, value } = e.target;
    setAdvancedFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExportPDF = async () => {
    if (detailRef.current && selectedExpediteur) {
      setIsExporting(true);
      try {
        await html2pdf().set({
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `Commercial_${commercialData.name}_Expediteur_${selectedExpediteur.name}.pdf`,
          html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true
          },
          jsPDF: { 
            unit: "in", 
            format: "a4", 
            orientation: "portrait"
          },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        }).from(detailRef.current).save();
      } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
      } finally {
        setIsExporting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Commercial Profile Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Commercial</h1>
            <p className="text-gray-600 mt-1">Gestion des expéditeurs et calcul des commissions</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Commercial ID</div>
            <div className="text-lg font-bold text-blue-600">{commercialData.id}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Nom</div>
            <div className="text-lg font-semibold">{commercialData.name}</div>
            <div className="text-sm text-gray-400">{commercialData.email}</div>
            <div className="text-sm text-gray-400">{commercialData.phone}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Commission</div>
            <div className="text-lg font-semibold text-green-600">{commercialData.commissionRate}%</div>
            <div className="text-sm text-gray-400">par colis réussi</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Gains totaux</div>
            <div className="text-lg font-semibold text-green-600">€{commercialData.totalEarnings.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Commission en attente: €{commercialData.pendingCommission.toFixed(2)}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Performance</div>
            <div className="text-lg font-semibold">{commercialData.totalClients} clients</div>
            <div className="text-sm text-gray-400">{commercialData.successRate}% de réussite</div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtres avancés</h3>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showAdvancedFilters ? "Masquer" : "Afficher"}
          </button>
        </div>
        
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select
              name="status"
              value={advancedFilters.status}
              onChange={handleAdvancedFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
            
            <input
              type="number"
              name="minCommission"
              value={advancedFilters.minCommission}
              onChange={handleAdvancedFilterChange}
              placeholder="Commission min (€)"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="number"
              name="maxCommission"
              value={advancedFilters.maxCommission}
              onChange={handleAdvancedFilterChange}
              placeholder="Commission max (€)"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="number"
              name="successRate"
              value={advancedFilters.successRate}
              onChange={handleAdvancedFilterChange}
              placeholder="Taux de réussite min (%)"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="date"
              name="dateFrom"
              value={advancedFilters.dateFrom}
              onChange={handleAdvancedFilterChange}
              placeholder="Date de début"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="date"
              name="dateTo"
              value={advancedFilters.dateTo}
              onChange={handleAdvancedFilterChange}
              placeholder="Date de fin"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Expéditeurs Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Mes Expéditeurs ({filteredExpediteurs.length})</h2>
          <p className="text-gray-600">Gérez vos expéditeurs et suivez leurs performances</p>
        </div>
        
        <DataTable
          data={filteredExpediteurs}
          columns={columns}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showActions={false}
        />
      </div>

      {/* Expéditeur Details Modal */}
      {selectedExpediteur && (
        <Modal
          isOpen={!!selectedExpediteur}
          onClose={() => setSelectedExpediteur(null)}
          size="xl"
        >
          <div ref={detailRef} className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Détails de l'expéditeur</h2>
                <p className="text-gray-600">{selectedExpediteur.name} - {selectedExpediteur.company}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedExpediteur(null)}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isExporting ? "Export en cours..." : "Exporter en PDF"}
                </button>
              </div>
            </div>

            {/* Commission Summary */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Résumé des Commissions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">€{selectedExpediteur.commissionEarned.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Commission totale</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedExpediteur.successfulShipments}</div>
                  <div className="text-sm text-gray-600">Colis réussis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{commercialData.commissionRate}%</div>
                  <div className="text-sm text-gray-600">Taux de commission</div>
                </div>
              </div>
            </div>

            {/* Expéditeur Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-xl border">
                <h3 className="text-lg font-semibold mb-4">Informations de contact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Nom:</span>
                    <span>{selectedExpediteur.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Email:</span>
                    <span>{selectedExpediteur.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Téléphone:</span>
                    <span>{selectedExpediteur.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Entreprise:</span>
                    <span>{selectedExpediteur.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">SIRET:</span>
                    <span>{selectedExpediteur.siret}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border">
                <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Total colis:</span>
                    <span>{selectedExpediteur.totalShipments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Colis réussis:</span>
                    <span className="text-green-600">{selectedExpediteur.successfulShipments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Taux de réussite:</span>
                    <span className="text-blue-600">{((selectedExpediteur.successfulShipments / selectedExpediteur.totalShipments) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Commission gagnée:</span>
                    <span className="text-green-600 font-semibold">€{selectedExpediteur.commissionEarned.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date d'inscription:</span>
                    <span>{selectedExpediteur.registrationDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Parcels */}
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="text-lg font-semibold mb-4">Colis récents</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedExpediteur.colis.map((colis) => (
                      <tr key={colis.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{colis.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            colis.status === "Livés" ? "bg-green-100 text-green-800" :
                            colis.status === "En cours" ? "bg-blue-100 text-blue-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {colis.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{colis.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">€{colis.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {colis.status === "Livés" ? `€${calculateCommission(colis.amount).toFixed(2)}` : "€0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Commercial = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [commercials, setCommercials] = useState([
    {
      id: "COM001",
      name: "Jean Dupont",
      email: "jean.dupont@quickzone.tn",
      phone: "+216 71 234 567",
      commissionRate: 5.5,
      totalEarnings: 2840.50,
      pendingCommission: 450.75,
      totalClients: 12,
      totalParcels: 156,
      successfulParcels: 142,
      successRate: 91.0,
      expediteurs: [/* ... */],
    },
    // ... other commercials
  ]);
  const [selectedCommercial, setSelectedCommercial] = useState(null);
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(user);
  }, []);

  // Admin CRUD handlers (add, edit, delete)
  const handleAddCommercial = () => { /* ... */ };
  const handleEditCommercial = (commercial) => { /* ... */ };
  const handleDeleteCommercial = (commercial) => { /* ... */ };

  // Admin: open commercial dashboard modal
  const handleViewCommercial = (commercial) => {
    setSelectedCommercial(commercial);
    setShowCommercialModal(true);
  };

  // Commercial: find own data
  const myCommercial = commercials.find(c => c.email === currentUser?.email) || (currentUser?.role === "Commercial" ? commercials[0] : undefined);

  // Admin view: table of all commercials
  if (currentUser?.role === "Administration") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Commerciaux</h1>
          <button onClick={handleAddCommercial} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">Ajouter un commercial</button>
        </div>
        <DataTable
          data={commercials}
          columns={[
            { key: "id", header: "ID" },
            { key: "name", header: "Nom" },
            { key: "email", header: "Email" },
            { key: "phone", header: "Téléphone" },
            { key: "commissionRate", header: "% Commission" },
            { key: "totalClients", header: "Clients" },
            { key: "successRate", header: "Taux de réussite" },
            {
              key: "actions",
              header: "Actions",
              render: (_, row) => (
                <ActionButtons
                  onView={() => handleViewCommercial(row)}
                  onEdit={() => handleEditCommercial(row)}
                  onDelete={() => handleDeleteCommercial(row)}
                />
              ),
            },
          ]}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        {/* Modal for viewing/editing a commercial's dashboard */}
        {showCommercialModal && selectedCommercial && (
          <Modal isOpen={showCommercialModal} onClose={() => setShowCommercialModal(false)} size="xl">
            <CommercialDashboard
              commercial={selectedCommercial}
              expediteurs={selectedCommercial.expediteurs}
              commissionRate={selectedCommercial.commissionRate}
              onViewExpediteur={() => {}}
            />
          </Modal>
        )}
      </div>
    );
  }

  // Commercial view: show only own dashboard
  if (currentUser?.role === "Commercial" && myCommercial) {
    return (
      <CommercialDashboard
        commercial={myCommercial}
        expediteurs={myCommercial.expediteurs}
        commissionRate={myCommercial.commissionRate}
        onViewExpediteur={() => {}}
      />
    );
  }

  // Fallback: loading or unauthorized
  return <div className="flex items-center justify-center h-64 text-gray-500">Chargement...</div>;
};

export default Commercial; 