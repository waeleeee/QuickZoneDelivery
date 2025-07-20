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
  const [shippers, setShippers] = useState([]); // Add shippers state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shippers based on user role
  useEffect(() => {
    const fetchShippers = async () => {
      try {
        console.log('Fetching shippers based on user role...');
        let shippersData;
        
        if (currentUser?.role === 'Commercial') {
          // For commercial users, get only their assigned shippers
          console.log('Commercial user - fetching assigned shippers...');
          const commercials = await apiService.getCommercials();
          const commercial = commercials.find(c => c.email === currentUser.email);
          
          if (commercial) {
            console.log('Found commercial:', commercial);
            shippersData = await apiService.getShippersByCommercial(commercial.id);
            console.log('Commercial shippers:', shippersData);
          } else {
            console.error('Commercial not found for user:', currentUser.email);
            shippersData = [];
          }
        } else if (currentUser?.role === 'Administration' || currentUser?.role === 'Finance') {
          // For admin/finance users, get all shippers
          console.log('Admin/Finance user - fetching all shippers...');
          shippersData = await apiService.getShippers();
        } else {
          shippersData = [];
        }
        
        console.log('Fetched shippers:', shippersData);
        console.log('Shippers count:', shippersData ? shippersData.length : 0);
        if (shippersData && shippersData.length > 0) {
          console.log('First shipper sample:', shippersData[0]);
        }
        setShippers(shippersData || []);
      } catch (error) {
        console.error('Error fetching shippers:', error);
        setShippers([]);
      }
    };

    // Only fetch shippers if user is admin/finance/commercial
    if (currentUser?.role === 'Administration' || currentUser?.role === 'Finance' || currentUser?.role === 'Commercial') {
      fetchShippers();
    }
  }, [currentUser]);

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
          
          // If no payments from API, try to get payments based on user role
          let paymentsToUse = userPayments;
          if (!userPayments || userPayments.length === 0) {
            if (currentUser.role === 'Commercial') {
              // For commercial users, get payments from their assigned shippers
              try {
                console.log('Commercial user - fetching payments from assigned shippers...');
                const commercials = await apiService.getCommercials();
                const commercial = commercials.find(c => c.email === currentUser.email);
                
                if (commercial) {
                  console.log('Found commercial:', commercial);
                  const commercialShippers = await apiService.getShippersByCommercial(commercial.id);
                  console.log('Commercial shippers:', commercialShippers);
                  
                  if (commercialShippers && commercialShippers.length > 0) {
                    // Get all payments and filter by commercial's shippers
                    const allPaymentsResponse = await apiService.getAllPayments();
                    const shipperIds = commercialShippers.map(s => s.id);
                    paymentsToUse = allPaymentsResponse.filter(payment => 
                      payment.shipper_id && shipperIds.includes(payment.shipper_id)
                    );
                    console.log('Filtered payments for commercial:', paymentsToUse);
                  } else {
                    console.log('No shippers assigned to this commercial');
                    paymentsToUse = [];
                  }
                } else {
                  console.log('Commercial not found');
                  paymentsToUse = [];
                }
              } catch (error) {
                console.log('Could not fetch commercial payments, using empty array:', error);
                paymentsToUse = [];
              }
            } else if (currentUser.role === 'Administration' || currentUser.role === 'Finance') {
              // For admin/finance users, try to get all payments
              try {
                console.log('Admin/Finance user - fetching all payments');
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
          const transformedPayments = paymentsToUse.map(payment => {
            // Find the shipper name from the shippers list
            const shipper = shippers.find(s => s.id === payment.shipper_id);
            const shipperName = shipper ? shipper.name : (payment.shipper_name || "Expéditeur inconnu");
            
            return {
              id: payment.id || `PAY${payment.id}`,
              shipper: shipperName,
              amount: `${parseFloat(payment.amount || 0).toFixed(2)} €`,
              date: payment.created_at ? new Date(payment.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              method: payment.payment_method || "Non spécifié",
              reference: payment.reference || payment.id || "N/A",
              status: payment.status === "paid" ? "Payé" : "En attente",
              // Keep original payment data for invoice
              originalPayment: payment
            };
          });
          
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
    shipper_id: "", // Change from shipper to shipper_id
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
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setFacturePayment(row); setIsFactureOpen(true); }}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
            title="Voir la facture"
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

  const handleAdd = () => {
    setEditingPayment(null);
    setFormData({
      shipper_id: "", // Change from shipper to shipper_id
      amount: "",
      date: new Date().toISOString().split('T')[0], // Set today's date as default
      method: "",
      reference: "",
      status: "En attente",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    // Find the shipper ID from the shippers list based on the shipper name
    const selectedShipper = shippers.find(s => s.name === payment.shipper);
    setFormData({
      shipper_id: selectedShipper?.id || "",
      amount: payment.amount.replace(' €', ''),
      date: payment.date,
      method: payment.method,
      reference: payment.reference,
      status: payment.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (payment) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce paiement ?")) {
      try {
        // Get the original payment ID from the transformed payment
        const originalPaymentId = payment.originalPayment?.id || payment.id;
        
        console.log('Deleting payment with ID:', originalPaymentId);
        
        // Call the API to delete the payment
        await apiService.deletePayment(originalPaymentId);
        
        // Update local state after successful deletion
        setPayments(payments.filter((p) => p.id !== payment.id));
        
        alert('Paiement supprimé avec succès!');
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Erreur lors de la suppression du paiement: ' + error.message);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.shipper_id) {
        alert('Veuillez sélectionner un expéditeur');
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        alert('Veuillez saisir un montant valide');
        return;
      }
      if (!formData.date) {
        alert('Veuillez saisir une date');
        return;
      }
      if (!formData.method) {
        alert('Veuillez sélectionner une méthode de paiement');
        return;
      }

      // Find the selected shipper
      console.log('Available shippers:', shippers);
      console.log('Selected shipper_id:', formData.shipper_id, 'Type:', typeof formData.shipper_id);
      const selectedShipper = shippers.find(s => s.id == formData.shipper_id);
      console.log('Found shipper:', selectedShipper);
      if (!selectedShipper) {
        alert('Expéditeur non trouvé');
        return;
      }

      // Create payment data
      const paymentData = {
        shipper_id: parseInt(formData.shipper_id), // Convert to integer
        amount: parseFloat(formData.amount),
        payment_method: formData.method,
        reference: formData.reference || `REF-${Date.now()}`,
        status: formData.status === "Payé" ? "paid" : "pending",
        payment_date: formData.date
      };

      console.log('Creating payment with data:', paymentData);

      // Call API to create payment
      const result = await apiService.createPayment(paymentData);
      
      console.log('Payment creation result:', result);
      
      if (result && result.id) {
        // Add the new payment to the list
        const newPayment = {
          id: result.id,
          shipper: selectedShipper.name,
          amount: `${parseFloat(formData.amount).toFixed(2)} €`,
          date: formData.date,
          method: formData.method,
          reference: formData.reference || `REF-${Date.now()}`,
          status: formData.status === 'pending' ? 'En attente' : 'Payé',
          originalPayment: result
        };
        
        setPayments([newPayment, ...payments]);
        alert('Paiement créé avec succès!');
        setIsModalOpen(false);
      } else {
        alert('Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Erreur lors de la création du paiement: ' + error.message);
    }
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
            {currentUser?.role === 'Expéditeur' ? 'Mes Paiements' : 
             currentUser?.role === 'Commercial' ? 'Paiements de mes Expéditeurs' : 'Gestion des Paiements'}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentUser?.role === 'Expéditeur' 
              ? 'Historique de vos paiements et transactions' 
              : currentUser?.role === 'Commercial'
              ? 'Paiements des expéditeurs assignés à votre compte'
              : 'Gérez les paiements et les transactions des expéditeurs'
            }
          </p>
        </div>
        {(currentUser?.role === 'Administration' || currentUser?.role === 'Finance') && (
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Ajouter un paiement
            </button>
            <button
              onClick={() => {
                console.log('Debug: Current shippers:', shippers);
                console.log('Debug: Shippers count:', shippers.length);
                if (shippers.length > 0) {
                  console.log('Debug: First shipper:', shippers[0]);
                }
                alert(`Shippers loaded: ${shippers.length}\nFirst shipper: ${shippers.length > 0 ? JSON.stringify(shippers[0], null, 2) : 'None'}`);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Debug Shippers
            </button>
          </div>
        )}
      </div>

      <DataTable
        data={payments}
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showActions={false}
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
              <label className="block text-sm font-medium text-left">Expéditeur *</label>
              <select 
                name="shipper_id" 
                value={formData.shipper_id} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un expéditeur</option>
                {shippers.map(shipper => (
                  <option key={shipper.id} value={shipper.id}>
                    {shipper.name} - {shipper.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Montant (€) *</label>
              <input 
                type="number" 
                name="amount" 
                value={formData.amount} 
                onChange={handleInputChange} 
                step="0.01"
                min="0"
                required
                placeholder="Ex : 250.00" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Date *</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Méthode de paiement *</label>
              <select 
                name="method" 
                value={formData.method} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner une méthode</option>
                <option value="Espèces">Espèces</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Référence</label>
              <input 
                type="text" 
                name="reference" 
                value={formData.reference} 
                onChange={handleInputChange} 
                placeholder="Ex : REF-001-2024"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Statut</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
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