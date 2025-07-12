import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import html2pdf from "html2pdf.js";

const mockDrivers = [
  { id: 1, name: "Pierre Dubois", phone: "+33 1 23 45 67 89" },
  { id: 2, name: "Sarah Ahmed", phone: "+33 1 98 76 54 32" },
  { id: 3, name: "Mohamed Ali", phone: "+33 1 11 22 33 44" },
];

const Expediteur = () => {
  const navigate = useNavigate();
  
  // Get current user to check role
  const [currentUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return user;
  });
  
  // Check if user is Commercial (read-only access)
  const isCommercialUser = currentUser?.role === 'Commercial';

  const [shippers, setShippers] = useState([
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
      website: "www.dubois-logistics.fr",
      contactPerson: "Marie Dubois",
      contactPhone: "+33 1 23 45 67 90",
      bankInfo: {
        bank: "Crédit Agricole",
        iban: "FR76 1234 5678 9012 3456 7890 123",
        bic: "AGRIFRPP123"
      },
      colis: [
        { id: "COL001", status: "Livés", date: "2024-01-18", amount: 25.50, destination: "Paris", weight: "2.5kg", type: "Standard" },
        { id: "COL002", status: "En cours", date: "2024-01-19", amount: 18.75, destination: "Lyon", weight: "1.8kg", type: "Express" },
                  { id: "COL003", status: "Livés", date: "2024-01-17", amount: 32.00, destination: "Marseille", weight: "3.2kg", type: "Standard" },
        { id: "COL004", status: "En attente", date: "2024-01-20", amount: 15.25, destination: "Toulouse", weight: "1.5kg", type: "Standard" },
                  { id: "COL005", status: "Livés", date: "2024-01-16", amount: 28.90, destination: "Nice", weight: "2.8kg", type: "Express" },
      ],
      payments: [
        { id: "PAY001", amount: 150.25, date: "2024-01-15", status: "Payé", method: "Carte bancaire", reference: "REF001" },
        { id: "PAY002", amount: 89.50, date: "2024-01-10", status: "En attente", method: "Virement", reference: "REF002" },
        { id: "PAY003", amount: 210.75, date: "2024-01-05", status: "Payé", method: "Chèque", reference: "REF003" },
      ],
      statistics: {
        totalRevenue: 2840.50,
        averagePerShipment: 63.12,
        onTimeDelivery: 92,
        customerRating: 4.8,
      },
      defaultLivreurId: 1,
      code: "EXP001",
      gouvernorat: "Tunis",
      identityNumber: "123456789012345",
      passportNumber: "A12345678",
      fiscalNumber: "12345678901234",
      agence: "Tunis Sud",
      commercial: "Ahmed Ben Ali",
      deliveryFee: 15.00,
      returnFee: 10.00,
      documents: ["Facture", "Bon de livraison"],
      returnedShipments: 5,
      status: "Actif",
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
      website: "www.ahmed-trading.fr",
      contactPerson: "Ahmed Ben Ali",
      contactPhone: "+33 1 98 76 54 33",
      bankInfo: {
        bank: "BNP Paribas",
        iban: "FR76 9876 5432 1098 7654 3210 987",
        bic: "BNPAFRPP987"
      },
      colis: [
        { id: "COL006", status: "Livés", date: "2024-01-19", amount: 22.00, destination: "Paris", weight: "2.1kg", type: "Standard" },
        { id: "COL007", status: "En cours", date: "2024-01-20", amount: 19.50, destination: "Lyon", weight: "1.9kg", type: "Express" },
                  { id: "COL008", status: "Livés", date: "2024-01-18", amount: 35.75, destination: "Marseille", weight: "3.5kg", type: "Standard" },
      ],
      payments: [
        { id: "PAY004", amount: 95.25, date: "2024-01-12", status: "Payé", method: "Carte bancaire", reference: "REF004" },
        { id: "PAY005", amount: 67.00, date: "2024-01-08", status: "Payé", method: "Espèces", reference: "REF005" },
      ],
      statistics: {
        totalRevenue: 1850.25,
        averagePerShipment: 57.82,
        onTimeDelivery: 88,
        customerRating: 4.6,
      },
      defaultLivreurId: 2,
      code: "EXP002",
      gouvernorat: "Tunis",
      identityNumber: "987654321098765",
      passportNumber: "B87654321",
      fiscalNumber: "98765432109876",
      agence: "Tunis Nord",
      commercial: "Fatima Ali",
      deliveryFee: 12.00,
      returnFee: 8.00,
      documents: ["Facture", "Bon de livraison"],
      returnedShipments: 3,
      status: "Actif",
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
      website: "www.ali-import-export.fr",
      contactPerson: "Fatima Ali",
      contactPhone: "+33 1 11 22 33 45",
      bankInfo: {
        bank: "Société Générale",
        iban: "FR76 1122 3344 5566 7788 9900 112",
        bic: "SOGEFRPP112"
      },
      colis: [
        { id: "COL009", status: "Livés", date: "2023-12-10", amount: 45.00, destination: "Paris", weight: "4.5kg", type: "Standard" },
        { id: "COL010", status: "Retour", date: "2023-12-12", amount: 0.00, destination: "Lyon", weight: "2.0kg", type: "Standard" },
      ],
      payments: [
        { id: "PAY006", amount: 120.00, date: "2023-12-05", status: "Payé", method: "Virement", reference: "REF006" },
        { id: "PAY007", amount: 45.00, date: "2023-12-08", status: "Remboursé", method: "Virement", reference: "REF007" },
      ],
      statistics: {
        totalRevenue: 1250.00,
        averagePerShipment: 44.64,
        onTimeDelivery: 85,
        customerRating: 4.2,
      },
      defaultLivreurId: 3,
      code: "EXP003",
      gouvernorat: "Tunis",
      identityNumber: "112233445566778",
      passportNumber: "C76543210",
      fiscalNumber: "11223344556677",
      agence: "Tunis Est",
      commercial: "Marie Dubois",
      deliveryFee: 18.00,
      returnFee: 12.00,
      documents: ["Facture", "Bon de livraison"],
      returnedShipments: 2,
      status: "Inactif",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingShipper, setEditingShipper] = useState(null);
  const [selectedShipper, setSelectedShipper] = useState(null);
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
  
  // Search states for parcel and payment history
  const [colisSearchTerm, setColisSearchTerm] = useState("");
  const [paymentSearchTerm, setPaymentSearchTerm] = useState("");
  
  // États pour les modals CRUD des colis et paiements
  const [isColisModalOpen, setIsColisModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingColis, setEditingColis] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [colisFormData, setColisFormData] = useState({
    destination: "",
    type: "Standard",
    weight: "",
    status: "En attente",
    amount: "",
  });
  const [paymentFormData, setPaymentFormData] = useState({
    reference: "",
    method: "Carte bancaire",
    status: "En attente",
    amount: "",
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    siret: "",
    defaultLivreurId: "",
    code: "",
    gouvernorat: "Tunis",
    identityNumber: "",
    passportNumber: "",
    fiscalNumber: "",
    agence: "",
    commercial: "",
    deliveryFee: 0,
    returnFee: 0,
    documents: [],
  });

  const columns = [
    { key: "code", header: "Code" },
    { key: "name", header: "Nom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "company", header: "Entreprise" },
    { key: "totalShipments", header: "Total colis" },
    { key: "successfulShipments", header: "Colis livrés" },
    { key: "returnedShipments", header: "Colis retournés" },
    { key: "deliveryFee", header: "Frais de livraison" },
    { key: "returnFee", header: "Frais de retour" },
    { key: "status", header: "Statut" },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
            title="Voir les détails"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {!isCommercialUser && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                title="Modifier"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(row)}
                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                title="Supprimer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleViewDetails = (shipper) => {
    if (selectedShipper?.id === shipper.id) {
      setSelectedShipper(null);
      // Clear search terms when closing details
      setColisSearchTerm("");
      setPaymentSearchTerm("");
    } else {
      setSelectedShipper(shipper);
      // Clear search terms when opening new details
      setColisSearchTerm("");
      setPaymentSearchTerm("");
    }
  };

  const handleAdd = () => {
    setEditingShipper(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      siret: "",
      defaultLivreurId: "",
      code: "",
      gouvernorat: "Tunis",
      identityNumber: "",
      passportNumber: "",
      fiscalNumber: "",
      agence: "",
      commercial: "",
      deliveryFee: 0,
      returnFee: 0,
      documents: [],
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (shipper) => {
    setEditingShipper(shipper);
    setFormData({
      name: shipper.name,
      email: shipper.email,
      phone: shipper.phone,
      address: shipper.address,
      company: shipper.company,
      siret: shipper.siret,
      status: shipper.status,
      defaultLivreurId: shipper.defaultLivreurId || "",
      code: shipper.code || "",
      gouvernorat: shipper.gouvernorat || "Tunis",
      identityNumber: shipper.identityNumber || "",
      passportNumber: shipper.passportNumber || "",
      fiscalNumber: shipper.fiscalNumber || "",
      agence: shipper.agence || "",
      commercial: shipper.commercial || "",
      deliveryFee: shipper.deliveryFee || 0,
      returnFee: shipper.returnFee || 0,
      documents: shipper.documents || [],
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (shipper) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'expéditeur "${shipper.name}" ?`)) {
      setShippers(shippers.filter(s => s.id !== shipper.id));
      if (selectedShipper?.id === shipper.id) {
        setSelectedShipper(null);
      }
    }
  };

  const handleSubmit = () => {
    if (editingShipper) {
      // Modification
      setShippers(shippers.map(s => s.id === editingShipper.id ? {
        ...s,
        ...formData,
        defaultLivreurId: formData.defaultLivreurId,
        lastActivity: new Date().toISOString().slice(0, 10)
      } : s));
    } else {
      // Ajout
      const newShipper = {
        id: `EXP${String(shippers.length + 1).padStart(3, '0')}`,
        ...formData,
        defaultLivreurId: formData.defaultLivreurId,
        totalShipments: 0,
        successfulShipments: 0,
        registrationDate: new Date().toISOString().slice(0, 10),
        lastActivity: new Date().toISOString().slice(0, 10),
        colis: [],
        payments: [],
        statistics: {
          totalRevenue: 0,
          averagePerShipment: 0,
          onTimeDelivery: 0,
          customerRating: 0,
        },
        code: `EXP${String(shippers.length + 1).padStart(3, '0')}`,
        gouvernorat: "",
        identityNumber: "",
        passportNumber: "",
        fiscalNumber: "",
        agence: "",
        commercial: "",
        deliveryFee: 0,
        returnFee: 0,
        documents: [],
        returnedShipments: 0,
        status: "Actif",
      };
      setShippers([...shippers, newShipper]);
    }
    // Ne pas fermer le modal, juste réinitialiser le formulaire
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      company: "",
      siret: "",
      defaultLivreurId: "",
      code: "",
      gouvernorat: "Tunis",
      identityNumber: "",
      passportNumber: "",
      fiscalNumber: "",
      agence: "",
      commercial: "",
      deliveryFee: 0,
      returnFee: 0,
      documents: [],
    });
    setEditingShipper(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fonctions CRUD pour les colis
  const handleAddColis = () => {
    setEditingColis(null);
    setColisFormData({
      destination: "",
      type: "Standard",
      weight: "",
      status: "En attente",
      amount: "",
    });
    setIsColisModalOpen(true);
  };

  const handleEditColis = (colis) => {
    setEditingColis(colis);
    setColisFormData(colis);
    setIsColisModalOpen(true);
  };

  const handleDeleteColis = (colis) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce colis ?")) {
      const updatedShipper = {
        ...selectedShipper,
        colis: selectedShipper.colis.filter(c => c.id !== colis.id),
        totalShipments: selectedShipper.totalShipments - 1,
        successfulShipments: colis.status === "Livés" ? selectedShipper.successfulShipments - 1 : selectedShipper.successfulShipments
      };
      setShippers(shippers.map(s => s.id === selectedShipper.id ? updatedShipper : s));
      setSelectedShipper(updatedShipper);
    }
  };

  const handleSubmitColis = () => {
    const updatedColis = editingColis 
      ? { ...colisFormData, id: editingColis.id, date: editingColis.date }
      : { 
          ...colisFormData, 
          id: `COL${String(selectedShipper.colis.length + 1).padStart(3, '0')}`, 
          date: new Date().toISOString().slice(0, 10),
          amount: parseFloat(colisFormData.amount) || 0
        };

    const updatedShipper = {
      ...selectedShipper,
      colis: editingColis
        ? selectedShipper.colis.map(c => c.id === editingColis.id ? updatedColis : c)
        : [...selectedShipper.colis, updatedColis],
      totalShipments: editingColis ? selectedShipper.totalShipments : selectedShipper.totalShipments + 1,
      successfulShipments: editingColis 
        ? (editingColis.status === "Livés" && colisFormData.status !== "Livés") 
          ? selectedShipper.successfulShipments - 1 
          : (editingColis.status !== "Livés" && colisFormData.status === "Livés")
            ? selectedShipper.successfulShipments + 1
            : selectedShipper.successfulShipments
        : colisFormData.status === "Livés" ? selectedShipper.successfulShipments + 1 : selectedShipper.successfulShipments
    };

    setShippers(shippers.map(s => s.id === selectedShipper.id ? updatedShipper : s));
    setSelectedShipper(updatedShipper);
    setIsColisModalOpen(false);
  };

  const handleColisInputChange = (e) => {
    const { name, value } = e.target;
    setColisFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fonctions CRUD pour les paiements
  const handleAddPayment = () => {
    setEditingPayment(null);
    setPaymentFormData({
      reference: "",
      method: "Carte bancaire",
      status: "En attente",
      amount: "",
    });
    setIsPaymentModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentFormData(payment);
    setIsPaymentModalOpen(true);
  };

  const handleDeletePayment = (payment) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      const updatedShipper = {
        ...selectedShipper,
        payments: selectedShipper.payments.filter(p => p.id !== payment.id)
      };
      setShippers(shippers.map(s => s.id === selectedShipper.id ? updatedShipper : s));
      setSelectedShipper(updatedShipper);
    }
  };

  const handleSubmitPayment = () => {
    const updatedPayment = editingPayment 
      ? { ...paymentFormData, id: editingPayment.id, date: editingPayment.date }
      : { 
          ...paymentFormData, 
          id: `PAY${String(selectedShipper.payments.length + 1).padStart(3, '0')}`, 
          date: new Date().toISOString().slice(0, 10),
          amount: parseFloat(paymentFormData.amount) || 0
        };

    const updatedShipper = {
      ...selectedShipper,
      payments: editingPayment
        ? selectedShipper.payments.map(p => p.id === editingPayment.id ? updatedPayment : p)
        : [...selectedShipper.payments, updatedPayment]
    };

    setShippers(shippers.map(s => s.id === selectedShipper.id ? updatedShipper : s));
    setSelectedShipper(updatedShipper);
    setIsPaymentModalOpen(false);
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdvancedFilterChange = (e) => {
    const { name, value } = e.target;
    setAdvancedFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter shippers based on search and advanced filters
  const filteredShippers = shippers.filter(shipper => {
    const matchesSearch = searchTerm === "" || 
      Object.values(shipper).some(value =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    const successRate = (shipper.successfulShipments / shipper.totalShipments) * 100;
    const matchesSuccessRate = advancedFilters.successRate === "" || successRate >= parseFloat(advancedFilters.successRate);

    return matchesSearch && matchesSuccessRate;
  });

  const handleExportPDF = async () => {
    if (detailRef.current && selectedShipper) {
      setIsExporting(true);
      try {
        await html2pdf().set({
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `Expediteur_${selectedShipper.name.replace(/\s+/g, '_')}.pdf`,
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

  const getStatusBadge = (status) => {
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
      "Retour En Cours d'expédition": "bg-indigo-100 text-indigo-800 border-indigo-300",
      "Retour reçu": "bg-cyan-100 text-cyan-800 border-cyan-300",
    };
    return (
      <span className={`inline-block px-2 py-1 rounded-full border text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
        {status}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const colorMap = {
      "Payé": "bg-green-100 text-green-800 border-green-300",
      "En attente": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "Remboursé": "bg-red-100 text-red-800 border-red-300",
    };
    return (
      <span className={`inline-block px-2 py-1 rounded-full border text-xs font-semibold ${colorMap[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
        {status}
      </span>
    );
  };

  // Vérifications de sécurité pour les propriétés manquantes
  const getSafeShipper = (shipper) => {
    return {
      ...shipper,
      colis: shipper.colis || [],
      payments: shipper.payments || [],
      statistics: shipper.statistics || {
        totalRevenue: 0,
        averagePerShipment: 0,
        onTimeDelivery: 0,
        customerRating: 0,
      },
      bankInfo: shipper.bankInfo || {
        bank: "Non renseigné",
        iban: "Non renseigné",
        bic: "Non renseigné"
      },
      documents: shipper.documents || [],
      successfulShipments: shipper.successfulShipments || 0,
    };
  };

  // Filter functions for parcel and payment history
  const getFilteredColis = (colis) => {
    if (!colisSearchTerm) return colis;
    return colis.filter(colis => 
      colis.id.toLowerCase().includes(colisSearchTerm.toLowerCase()) ||
      (colis.destination && colis.destination.toLowerCase().includes(colisSearchTerm.toLowerCase())) ||
      (colis.type && colis.type.toLowerCase().includes(colisSearchTerm.toLowerCase())) ||
      (colis.status && colis.status.toLowerCase().includes(colisSearchTerm.toLowerCase())) ||
      (colis.date && colis.date.includes(colisSearchTerm)) ||
      (colis.amount && colis.amount.toString().includes(colisSearchTerm))
    );
  };

  const getFilteredPayments = (payments) => {
    if (!paymentSearchTerm) return payments;
    return payments.filter(payment => 
      payment.id.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(paymentSearchTerm.toLowerCase())) ||
      (payment.method && payment.method.toLowerCase().includes(paymentSearchTerm.toLowerCase())) ||
      (payment.status && payment.status.toLowerCase().includes(paymentSearchTerm.toLowerCase())) ||
      (payment.date && payment.date.includes(paymentSearchTerm)) ||
      (payment.amount && payment.amount.toString().includes(paymentSearchTerm))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header harmonisé */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des expéditeurs</h1>
          <p className="text-gray-600 mt-1">Liste des expéditeurs et leurs informations</p>
        </div>
        {!isCommercialUser && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Nouvel expéditeur
          </button>
        )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

      {/* Tableau des expéditeurs */}
      <DataTable
        data={filteredShippers}
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showActions={false}
      />

      {/* Détails de l'expéditeur sélectionné */}
      {selectedShipper && (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          {/* Header des détails */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Détails de l'expéditeur</h2>
              <p className="text-gray-600 mt-1">{selectedShipper.name} - {selectedShipper.company}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedShipper(null)}
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

          {/* Contenu des détails */}
          <div ref={detailRef}>
            {isExporting && (
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de l'expéditeur</h1>
                <p className="text-xl text-gray-600">{selectedShipper.name} - {selectedShipper.company}</p>
                <p className="text-sm text-gray-500 mt-2">Généré le {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-bold">Informations personnelles</span>
                  </h3>
                  <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-6">
                    <div className="flex-1">
                      <div className="text-2xl font-extrabold text-blue-900 flex items-center gap-2">
                        <span>{selectedShipper.name}</span>
                        <span className="inline-block bg-blue-200 text-blue-800 rounded-full px-3 py-1 text-xs font-bold ml-2">{selectedShipper.company}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{selectedShipper.code}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 border-t border-blue-100 pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Email :</span>
                        <span className="text-gray-900 flex items-center gap-1"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v4m0-4V8" /></svg>{selectedShipper.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Téléphone :</span>
                        <span className="text-gray-900 flex items-center gap-1"><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 12a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2zm12-12a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5a2 2 0 012-2h2zm0 12a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2z" /></svg>{selectedShipper.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Adresse :</span>
                        <span className="text-gray-900 flex items-center gap-1"><svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243A8 8 0 1116 8a8 8 0 01-1.657 8.657z" /></svg>{selectedShipper.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Gouvernorat :</span>
                        <span className="text-gray-900">{selectedShipper.gouvernorat}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Numéro d'identité :</span>
                        <span className="text-gray-900">{selectedShipper.identityNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Numéro de passeport :</span>
                        <span className="text-gray-900">{selectedShipper.passportNumber}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Matricule fiscal :</span>
                        <span className="text-gray-900">{selectedShipper.fiscalNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Agence :</span>
                        <span className="text-gray-900">{selectedShipper.agence}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Commercial :</span>
                        <span className="text-gray-900">{selectedShipper.commercial}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Frais de livraison (€) :</span>
                        <span className="text-gray-900">{selectedShipper.deliveryFee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Frais de retour (€) :</span>
                        <span className="text-gray-900">{selectedShipper.returnFee}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Documents :</span>
                        <span className="text-gray-900">
                          {getSafeShipper(selectedShipper).documents.map((doc, index) => (
                            <span key={index} className="inline-block px-2 py-1 rounded-full border text-xs font-semibold mr-1 mb-1">
                              {doc}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Réduction documents :</span>
                        <span className="text-gray-900">
                          {getSafeShipper(selectedShipper).documents.reduce((sum, doc) => {
                            if (doc === "Carte d'identité") return sum + 3;
                            if (doc === "Passeport") return sum + 3;
                            return sum;
                          }, 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="inline-block bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-xs font-bold">Informations bancaires</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-semibold text-gray-700">Banque :</span>
                      <div className="text-gray-900">{getSafeShipper(selectedShipper).bankInfo.bank}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">IBAN :</span>
                      <div className="text-gray-900 font-mono text-sm">{getSafeShipper(selectedShipper).bankInfo.iban}</div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">BIC :</span>
                      <div className="text-gray-900 font-mono text-sm">{getSafeShipper(selectedShipper).bankInfo.bic}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="inline-block bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-bold">Statistiques</span>
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-white rounded-lg shadow">
                      <div className="text-2xl font-bold text-blue-600">{getSafeShipper(selectedShipper).statistics.totalRevenue}€</div>
                      <div className="text-xs text-gray-600">Chiffre d'affaires</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow">
                      <div className="text-2xl font-bold text-green-600">{getSafeShipper(selectedShipper).statistics.averagePerShipment}€</div>
                      <div className="text-xs text-gray-600">Moyenne/colis</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow">
                      <div className="text-2xl font-bold text-purple-600">{getSafeShipper(selectedShipper).statistics.onTimeDelivery}%</div>
                      <div className="text-xs text-gray-600">Livraison à temps</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow">
                      <div className="text-2xl font-bold text-orange-600">{getSafeShipper(selectedShipper).statistics.customerRating}/5</div>
                      <div className="text-xs text-gray-600">Note client</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="inline-block bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs font-bold">Informations système</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Date d'inscription :</span>
                      <span className="text-gray-900">{selectedShipper.registrationDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Dernière activité :</span>
                      <span className="text-gray-900">{selectedShipper.lastActivity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Total colis :</span>
                      <span className="text-gray-900 font-bold">{selectedShipper.totalShipments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Colis réussis :</span>
                      <span className="text-gray-900 font-bold text-green-600">{getSafeShipper(selectedShipper).successfulShipments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Taux de réussite :</span>
                      <span className="text-gray-900 font-bold">{selectedShipper.totalShipments > 0 ? Math.round((getSafeShipper(selectedShipper).successfulShipments / selectedShipper.totalShipments) * 100) : 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">Livreur par défaut :</span>
                      <span className="text-gray-900">{mockDrivers.find(d => d.id === Number(selectedShipper.defaultLivreurId))?.name || "Aucun"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colis récents */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="inline-block bg-orange-100 text-orange-700 rounded-full px-3 py-1 text-xs font-bold">Historique des colis</span>
                  <span className="text-xs text-gray-400">({getSafeShipper(selectedShipper).colis.length})</span>
                </h3>
                {!isCommercialUser && (
                  <button
                    onClick={handleAddColis}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Ajouter un colis
                  </button>
                )}
              </div>
              
              {/* Search bar for parcels */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher dans les colis (ID, destination, type, statut, date, montant)..."
                    value={colisSearchTerm}
                    onChange={(e) => setColisSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-10 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {colisSearchTerm && (
                    <button
                      onClick={() => setColisSearchTerm("")}
                      className="absolute right-3 top-2.5 h-5 w-5 text-orange-400 hover:text-orange-600"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {colisSearchTerm && (
                  <div className="mt-2 text-sm text-orange-600">
                    {getFilteredColis(getSafeShipper(selectedShipper).colis).length} résultat(s) trouvé(s)
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-orange-200">
                      <th className="text-left py-2 font-semibold text-gray-700">ID Colis</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Destination</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Poids</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Statut</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Date</th>
                      <th className="text-right py-2 font-semibold text-gray-700">Montant</th>
                      {!isCommercialUser && (
                        <th className="text-center py-2 font-semibold text-gray-700">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredColis(getSafeShipper(selectedShipper).colis).map((colis) => (
                      <tr key={colis.id} className="border-b border-orange-100">
                        <td className="py-2 font-medium text-blue-700">{colis.id}</td>
                        <td className="py-2 text-gray-600">{colis.destination || "Non renseigné"}</td>
                        <td className="py-2 text-gray-600">{colis.type || "Standard"}</td>
                        <td className="py-2 text-gray-600">{colis.weight || "Non renseigné"}</td>
                        <td className="py-2">{getStatusBadge(colis.status)}</td>
                        <td className="py-2 text-gray-600">{colis.date}</td>
                        <td className="py-2 text-right font-semibold">{colis.amount}€</td>
                        {!isCommercialUser && (
                          <td className="py-2 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleEditColis(colis)}
                                className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteColis(colis)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Supprimer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historique des paiements */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-bold">Historique des paiements</span>
                  <span className="text-xs text-gray-400">({getSafeShipper(selectedShipper).payments.length})</span>
                </h3>
                {!isCommercialUser && (
                  <button
                    onClick={handleAddPayment}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Ajouter un paiement
                  </button>
                )}
              </div>
              
              {/* Search bar for payments */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher dans les paiements (ID, référence, méthode, statut, date, montant)..."
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-10 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {paymentSearchTerm && (
                    <button
                      onClick={() => setPaymentSearchTerm("")}
                      className="absolute right-3 top-2.5 h-5 w-5 text-indigo-400 hover:text-indigo-600"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {paymentSearchTerm && (
                  <div className="mt-2 text-sm text-indigo-600">
                    {getFilteredPayments(getSafeShipper(selectedShipper).payments).length} résultat(s) trouvé(s)
                  </div>
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-indigo-200">
                      <th className="text-left py-2 font-semibold text-gray-700">ID Paiement</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Référence</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Méthode</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Statut</th>
                      <th className="text-left py-2 font-semibold text-gray-700">Date</th>
                      <th className="text-right py-2 font-semibold text-gray-700">Montant</th>
                      {!isCommercialUser && (
                        <th className="text-center py-2 font-semibold text-gray-700">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredPayments(getSafeShipper(selectedShipper).payments).map((payment) => (
                      <tr key={payment.id} className="border-b border-indigo-100">
                        <td className="py-2 font-medium text-indigo-700">{payment.id}</td>
                        <td className="py-2 text-gray-600">{payment.reference || "Non renseigné"}</td>
                        <td className="py-2 text-gray-600">{payment.method}</td>
                        <td className="py-2">{getPaymentStatusBadge(payment.status)}</td>
                        <td className="py-2 text-gray-600">{payment.date}</td>
                        <td className="py-2 text-right font-semibold">{payment.amount}€</td>
                        {!isCommercialUser && (
                          <td className="py-2 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => handleEditPayment(payment)}
                                className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                                title="Modifier"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePayment(payment)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Supprimer"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Add/Edit */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingShipper(null);
          setFormData({
            name: "",
            email: "",
            phone: "",
            address: "",
            company: "",
            siret: "",
            defaultLivreurId: "",
            code: "",
            gouvernorat: "Tunis",
            identityNumber: "",
            passportNumber: "",
            fiscalNumber: "",
            agence: "",
            commercial: "",
            deliveryFee: 0,
            returnFee: 0,
            documents: [],
          });
        }}
        title={editingShipper ? "Modifier l'expéditeur" : "Nouvel expéditeur"}
        size="md"
      >
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-left">Code</label>
              <input type="text" name="code" value={formData.code || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Nom et prénom *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Entreprise</label>
              <input type="text" name="company" value={formData.company} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Téléphone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-left">Adresse *</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Gouvernorat</label>
              <select name="gouvernorat" value={formData.gouvernorat || 'Tunis'} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                {["Ariana","Béja","Ben Arous","Bizerte","Gabès","Gafsa","Jendouba","Kairouan","Kasserine","Kébili","Kef","Mahdia","Manouba","Médenine","Monastir","Nabeul","Sfax","Sidi Bouzid","Siliana","Sousse","Tataouine","Tozeur","Tunis","Zaghouan"].map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Numéro d'identité</label>
              <input type="text" name="identityNumber" value={formData.identityNumber || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Numéro de passeport</label>
              <input type="text" name="passportNumber" value={formData.passportNumber || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Matricule fiscal</label>
              <input type="text" name="fiscalNumber" value={formData.fiscalNumber || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Agence</label>
              <select name="agence" value={formData.agence || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner</option>
                <option value="Tunis Sud">Tunis Sud</option>
                <option value="Tunis Nord">Tunis Nord</option>
                <option value="Tunis Est">Tunis Est</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Commercial</label>
              <input type="text" name="commercial" value={formData.commercial || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Frais de livraison (€)</label>
              <input type="number" name="deliveryFee" value={formData.deliveryFee || 0} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Frais de retour (€)</label>
              <input type="number" name="returnFee" value={formData.returnFee || 0} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-left">Documents</label>
              <div className="flex flex-wrap gap-4">
                {['Carte d\'identité', 'Passeport', 'Patente'].map(doc => (
                  <label key={doc} className="flex items-center gap-2 text-sm font-normal text-gray-700 text-left">
                    <input
                      type="checkbox"
                      value={doc}
                      checked={formData.documents && formData.documents.includes(doc)}
                      onChange={e => {
                        const checked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          documents: checked
                            ? [...(prev.documents || []), doc]
                            : (prev.documents || []).filter(d => d !== doc)
                        }));
                      }}
                    />
                    {doc}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Fermer</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">{editingShipper ? "Mettre à jour" : "Ajouter"}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Ajout/Modification Colis */}
      <Modal
        isOpen={isColisModalOpen}
        onClose={() => setIsColisModalOpen(false)}
        title={editingColis ? "Modifier le colis" : "Nouveau colis"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Destination *</label>
            <input
              type="text"
              name="destination"
              value={colisFormData.destination}
              onChange={handleColisInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Type</label>
            <select
              name="type"
              value={colisFormData.type}
              onChange={handleColisInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="Standard">Standard</option>
              <option value="Express">Express</option>
              <option value="Premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Poids (kg)</label>
            <input
              type="text"
              name="weight"
              value={colisFormData.weight}
              onChange={handleColisInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="ex: 2.5kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Statut</label>
            <select
              name="status"
              value={colisFormData.status}
              onChange={handleColisInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="En attente">En attente</option>
              <option value="Au dépôt">Au dépôt</option>
              <option value="En cours">En cours</option>
              <option value="RTN dépot">RTN dépot</option>
              <option value="Livés">Livés</option>
              <option value="Livrés payés">Livrés payés</option>
              <option value="Retour définitif">Retour définitif</option>
              <option value="RTN client agence">RTN client agence</option>
              <option value="Retour Expéditeur">Retour Expéditeur</option>
              <option value="Retour En Cours d'expédition">Retour En Cours d'expédition</option>
              <option value="Retour reçu">Retour reçu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Montant (€)</label>
            <input
              type="number"
              name="amount"
              value={colisFormData.amount}
              onChange={handleColisInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              step="0.01"
              min="0"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setIsColisModalOpen(false)}
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmitColis}
            className="px-4 py-2 rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            {editingColis ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </Modal>

      {/* Modal Ajout/Modification Paiement */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={editingPayment ? "Modifier le paiement" : "Nouveau paiement"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Référence</label>
            <input
              type="text"
              name="reference"
              value={paymentFormData.reference}
              onChange={handlePaymentInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="ex: REF001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Méthode de paiement</label>
            <select
              name="method"
              value={paymentFormData.method}
              onChange={handlePaymentInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Carte bancaire">Carte bancaire</option>
              <option value="Virement">Virement</option>
              <option value="Chèque">Chèque</option>
              <option value="Espèces">Espèces</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Statut</label>
            <select
              name="status"
              value={paymentFormData.status}
              onChange={handlePaymentInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="En attente">En attente</option>
              <option value="Payé">Payé</option>
              <option value="Remboursé">Remboursé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Montant (€)</label>
            <input
              type="number"
              name="amount"
              value={paymentFormData.amount}
              onChange={handlePaymentInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmitPayment}
            className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {editingPayment ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Expediteur; 