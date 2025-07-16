import React, { useState, useEffect } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import FactureColis from "./FactureColis";
import { apiService } from "../../services/api";

const PaimentExpediteur = () => {
  // Get current user
  const [currentUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log('Current user from localStorage:', user);
    return user;
  });

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real payment data for the logged-in expéditeur
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        
                  if (currentUser && currentUser.email) {
            console.log('Fetching payments for user:', currentUser.email);
            
            const userPayments = await apiService.getExpediteurPayments(currentUser.email);
          console.log('User payments received:', userPayments);
          console.log('User payments type:', typeof userPayments);
          console.log('User payments length:', userPayments ? userPayments.length : 'null/undefined');
          
          // If no payments from API, try to get all payments for admin users or use empty array
          let paymentsToUse = userPayments;
          if (!userPayments || userPayments.length === 0) {
            if (currentUser.role === 'Administration' || currentUser.role === 'Finance' || currentUser.role === 'Commercial') {
              // For admin users, try to get all payments
              try {
                console.log('Admin user - fetching all payments');
                const allPaymentsResponse = await apiService.getAllPayments();
                paymentsToUse = allPaymentsResponse || [];
              } catch (error) {
                console.log('Could not fetch all payments, using empty array');
                paymentsToUse = [];
              }
            } else {
              console.log('No payments found for this expéditeur');
              paymentsToUse = [];
            }
          }
          
          // Transform the data to match the expected format
          const transformedPayments = paymentsToUse.map(payment => ({
            id: payment.id || `PAY${payment.id}`,
            shipper: payment.shipper_name || currentUser.name || "Expéditeur",
            amount: `${parseFloat(payment.amount || 0).toFixed(2)} €`,
            date: payment.created_at ? new Date(payment.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            method: payment.payment_method || "Non spécifié",
            reference: payment.reference || payment.id || "N/A",
            status: payment.status === "paid" ? "Payé" : "En attente",
            // Keep original payment data for invoice
            originalPayment: payment
          }));
          
          console.log('Transformed payments:', transformedPayments);
          setPayments(transformedPayments);
        } else {
          console.log('No current user found');
          setPayments([]);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setError('Erreur lors du chargement des paiements');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentUser]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    shipper: "",
    amount: "",
    date: "",
    method: "",
    reference: "",
    status: "En attente",
  });

  const [isFactureOpen, setIsFactureOpen] = useState(false);
  const [facturePayment, setFacturePayment] = useState(null);

  const columns = [
    { key: "id", header: "ID" },
    { key: "shipper", header: "Expéditeur" },
    { key: "amount", header: "Montant" },
    { key: "date", header: "Date" },
    { key: "method", header: "Méthode de paiement" },
    { key: "reference", header: "Référence" },
    {
      key: "status",
      header: "Statut",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            value === "Payé"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "facture",
      header: "Facture",
      render: (_, row) => (
        <button
          onClick={() => { setFacturePayment(row); setIsFactureOpen(true); }}
          className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
        >
          Facture
        </button>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingPayment(null);
    setFormData({
      shipper: "",
      amount: "",
      date: "",
      method: "",
      reference: "",
      status: "En attente",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData(payment);
    setIsModalOpen(true);
  };

  const handleDelete = (payment) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      setPayments(payments.filter((p) => p.id !== payment.id));
    }
  };

  const handleSubmit = () => {
    if (editingPayment) {
      setPayments(
        payments.map((payment) =>
          payment.id === editingPayment.id ? { ...formData, id: payment.id } : payment
        )
      );
    } else {
      const newPayment = {
        ...formData,
        id: `PAY${String(payments.length + 1).padStart(3, '0')}`,
      };
      setPayments([...payments, newPayment]);
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

  // Generate facture data from real payment data
  const getFactureData = (payment) => {
    const originalPayment = payment.originalPayment;
    const amount = parseFloat(payment.amount.replace(' €', ''));
    
    return {
    colis: {
      code: payment.reference,
        nom: "Colis QuickZone",
        adresse: originalPayment?.destination || "Adresse non spécifiée",
        poids: originalPayment?.weight || "1.00",
    },
    client: {
      nom: payment.shipper,
        tel: originalPayment?.shipper_phone || currentUser?.phone || "N/A",
    },
    expediteur: {
        nif: originalPayment?.shipper_company || "N/A",
        tel: originalPayment?.shipper_phone || currentUser?.phone || "N/A",
        societe: originalPayment?.shipper_company || currentUser?.company || "QuickZone",
        nom: payment.shipper,
        adresse: currentUser?.address || "Adresse non spécifiée",
    },
    prix: {
      livraisonBase: "8.00 DT",
      suppPoids: "0.00 DT",
        suppRapide: "0.00 DT",
      totalLivraison: "8.00 DT",
        ht: (amount * 0.8).toFixed(2) + " DT",
        tva: (amount * 0.2).toFixed(2) + " DT",
      prixColis: payment.amount,
        ttc: payment.amount,
      },
      note: "Paiement QuickZone"
    };
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Chargement des paiements...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentUser?.role === 'Expéditeur' ? 'Mes Paiements' : 'Gestion des Paiements'}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentUser?.role === 'Expéditeur' 
              ? 'Historique de vos paiements et transactions' 
              : 'Gérez les paiements et les transactions des expéditeurs'
            }
          </p>
        </div>
        {(currentUser?.role === 'Administration' || currentUser?.role === 'Finance' || currentUser?.role === 'Commercial') && (
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un paiement
        </button>
        )}
      </div>

      <DataTable
        data={payments}
        columns={columns}
        onEdit={(currentUser?.role === 'Administration' || currentUser?.role === 'Finance' || currentUser?.role === 'Commercial') ? handleEdit : undefined}
        onDelete={(currentUser?.role === 'Administration' || currentUser?.role === 'Finance' || currentUser?.role === 'Commercial') ? handleDelete : undefined}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayment ? "Modifier le paiement" : "Ajouter un paiement"}
        size="md"
      >
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-left">Expéditeur</label>
              <input type="text" name="shipper" value={formData.shipper} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Montant (€)</label>
              <input type="text" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="Ex : 250,00 €" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Méthode de paiement</label>
              <select name="method" value={formData.method} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="">Sélectionner une méthode</option>
                <option value="Espèces">Espèces</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Référence</label>
              <input type="text" name="reference" value={formData.reference} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Statut</label>
              <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                <option value="En attente">En attente</option>
                <option value="Payé">Payé</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Annuler</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md">{editingPayment ? "Mettre à jour" : "Ajouter"}</button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isFactureOpen}
        onClose={() => setIsFactureOpen(false)}
        title="Facture du paiement"
        size="xl"
      >
        {facturePayment && (
          <FactureColis {...getFactureData(facturePayment)} />
        )}
      </Modal>
    </div>
  );
};

export default PaimentExpediteur; 