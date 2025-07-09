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

  // Add mock payments data here so it's defined in this scope
  const payments = [
    {
      id: 1,
      shipper: "Ahmed Mohamed",
      amount: "250,00 €",
      date: "2024-01-15",
      method: "Virement bancaire",
      reference: "REF-001",
      status: "Payé",
    },
    {
      id: 2,
      shipper: "Sarah Ahmed",
      amount: "180,00 €",
      date: "2024-01-14",
      method: "Espèces",
      reference: "REF-002",
      status: "Payé",
    },
    {
      id: 3,
      shipper: "Mohamed Ali",
      amount: "320,00 €",
      date: "2024-01-13",
      method: "Chèque",
      reference: "REF-003",
      status: "En attente",
    },
    // Added payment for Pierre Dubois
    {
      id: 4,
      shipper: "Pierre Dubois",
      amount: "400,00 €",
      date: "2024-01-20",
      method: "Virement bancaire",
      reference: "REF-004",
      status: "Payé",
    },
  ];

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
      header: "Total gagné (€)",
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
            onClick={() => setSelectedExpediteur(row)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
            title="Voir les détails"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
        
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {/* 1. Jean Dupont Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg border border-blue-200 flex flex-col items-center justify-center h-full min-h-[240px]">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="text-center w-full">
              <div className="text-lg font-bold text-gray-800 mb-1">{commercialData.name}</div>
              <div className="inline-block text-xs font-semibold text-blue-700 bg-blue-100 rounded px-2 py-1 mb-2">Commercial ID: {commercialData.id}</div>
              <div className="flex items-center justify-center text-sm text-gray-600 mb-1">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {commercialData.email}
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {commercialData.phone}
              </div>
            </div>
          </div>

          {/* 2. Performance Card */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl shadow-lg border border-purple-200 flex flex-col items-center justify-center h-full min-h-[240px]">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-center w-full">
              <div className="text-lg font-bold text-gray-800 mb-1">Performance</div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Clients actifs</span>
                <span className="font-bold text-purple-600">{commercialData.totalClients}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Taux de réussite</span>
                <span className="font-bold text-green-600">{commercialData.successRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{width: `${commercialData.successRate}%`}}></div>
              </div>
            </div>
          </div>

          {/* 3. Total de colis Card */}
          <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-xl shadow-lg border border-orange-200 flex flex-col items-center justify-center h-full min-h-[240px]">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="text-center w-full">
              <div className="text-lg font-bold text-gray-800 mb-1">Total de colis</div>
              <div className="text-3xl font-bold text-orange-600 mb-2">{commercialData.totalParcels}</div>
              <div className="text-sm text-gray-600 bg-orange-50 px-3 py-1 rounded-full inline-block">Colis au total</div>
            </div>
          </div>

          {/* 4. Total de colis livrés Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-lg border border-green-200 flex flex-col items-center justify-center h-full min-h-[240px]">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center w-full">
              <div className="text-lg font-bold text-gray-800 mb-1">Colis livrés</div>
              <div className="text-3xl font-bold text-green-600 mb-2">{commercialData.successfulParcels}</div>
              <div className="text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full inline-block">Livrés avec succès</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A2 2 0 0013 14.586V19a1 1 0 01-1.447.894l-2-1A1 1 0 019 18v-3.414a2 2 0 00-.586-1.414L2 6.707A1 1 0 012 6V4z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Filtres avancés</h3>
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${showAdvancedFilters ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {showAdvancedFilters ? "Masquer" : "Afficher"}
          </button>
        </div>
        {showAdvancedFilters && (
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">Statut</label>
              <select
                name="status"
                value={advancedFilters.status}
                onChange={handleAdvancedFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">Taux de réussite min (%)</label>
              <input
                type="number"
                name="successRate"
                value={advancedFilters.successRate}
                onChange={handleAdvancedFilterChange}
                placeholder="Taux de réussite min (%)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">Date de début</label>
              <input
                type="date"
                name="dateFrom"
                value={advancedFilters.dateFrom}
                onChange={handleAdvancedFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-800 mb-2 text-left">Date de fin</label>
              <input
                type="date"
                name="dateTo"
                value={advancedFilters.dateTo}
                onChange={handleAdvancedFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
            </div>
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
            <div className="bg-white p-6 rounded-xl border mb-6">
              <h3 className="text-lg font-semibold mb-4">Paiements à cet expéditeur</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Méthode</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.filter(p => p.shipper === selectedExpediteur.name).length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-gray-400">Aucun paiement trouvé pour cet expéditeur.</td></tr>
                    ) : (
                      payments.filter(p => p.shipper === selectedExpediteur.name).map(payment => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold">{payment.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.method}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{payment.reference}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${payment.status === "Payé" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{payment.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion Commerciaux</h1>
          <button
            onClick={handleAddCommercial}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Ajouter commercial
          </button>
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