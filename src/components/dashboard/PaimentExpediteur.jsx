import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import FactureColis from "./FactureColis";

const PaimentExpediteur = () => {
  const [payments, setPayments] = useState([
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
  ]);

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
        id: Math.max(...payments.map((p) => p.id)) + 1,
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

  // Données mock pour la facture (à remplacer par les vraies données si dispo)
  const getFactureData = (payment) => ({
    colis: {
      code: payment.reference,
      nom: "Colis démo",
      adresse: "Béja centre, Béja",
      poids: "1.00",
    },
    client: {
      nom: payment.shipper,
      tel: "29596971",
    },
    expediteur: {
      nif: "1904056B/NM/000",
      tel: "23613518",
      societe: "Roura ever shop",
      nom: "Sarah Mathlouthi",
      adresse: "33 rue Rabta beb jdidi Tunis",
    },
    prix: {
      livraisonBase: "8.00 DT",
      suppPoids: "0.00 DT",
      suppRapide: "8.00 DT",
      totalLivraison: "8.00 DT",
      ht: "29.17 DT",
      tva: "5.83 DT",
      prixColis: payment.amount,
      ttc: "43.00 DT",
    },
    note: "Le jeudi svp"
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements des expéditeurs</h1>
          <p className="text-gray-600 mt-1">Gérez les paiements et les transactions des expéditeurs</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un paiement
        </button>
      </div>

      <DataTable
        data={payments}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPayment ? "Modifier le paiement" : "Ajouter un paiement"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expéditeur</label>
            <input
              type="text"
              name="shipper"
              value={formData.shipper}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Ex : 250,00 €"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
            <select
              name="method"
              value={formData.method}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Sélectionner une méthode</option>
              <option value="Espèces">Espèces</option>
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Chèque">Chèque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="En attente">En attente</option>
              <option value="Payé">Payé</option>
            </select>
          </div>
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
            {editingPayment ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
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