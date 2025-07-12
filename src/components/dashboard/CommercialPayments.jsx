import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";

const CommercialPayments = () => {
  const [payments, setPayments] = useState([
    {
      id: "COM_PAY001",
      type: "Commission",
      description: "Commission sur les ventes - Janvier 2024",
      amount: "1,250.00 €",
      date: "2024-01-31",
      method: "Virement bancaire",
      reference: "COM-REF-001",
      status: "Payé",
      details: "Commission de 5% sur 25,000€ de ventes"
    },
    {
      id: "COM_PAY002",
      type: "Salaire",
      description: "Salaire de base - Janvier 2024",
      amount: "2,500.00 €",
      date: "2024-01-25",
      method: "Virement bancaire",
      reference: "SAL-REF-001",
      status: "Payé",
      details: "Salaire mensuel de base"
    },
    {
      id: "COM_PAY003",
      type: "Bonus",
      description: "Bonus performance - Décembre 2023",
      amount: "500.00 €",
      date: "2024-01-15",
      method: "Virement bancaire",
      reference: "BON-REF-001",
      status: "Payé",
      details: "Bonus pour objectifs dépassés"
    },
    {
      id: "COM_PAY004",
      type: "Commission",
      description: "Commission sur les ventes - Décembre 2023",
      amount: "1,180.00 €",
      date: "2023-12-31",
      method: "Virement bancaire",
      reference: "COM-REF-002",
      status: "Payé",
      details: "Commission de 5% sur 23,600€ de ventes"
    },
    {
      id: "COM_PAY005",
      type: "Salaire",
      description: "Salaire de base - Décembre 2023",
      amount: "2,500.00 €",
      date: "2023-12-25",
      method: "Virement bancaire",
      reference: "SAL-REF-002",
      status: "Payé",
      details: "Salaire mensuel de base"
    },
    {
      id: "COM_PAY006",
      type: "Commission",
      description: "Commission sur les ventes - Février 2024",
      amount: "1,350.00 €",
      date: "2024-02-29",
      method: "Virement bancaire",
      reference: "COM-REF-003",
      status: "En attente",
      details: "Commission de 5% sur 27,000€ de ventes"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const columns = [
    { key: "id", header: "ID Paiement" },
    { key: "type", header: "Type" },
    { key: "description", header: "Description" },
    { key: "amount", header: "Montant" },
    { key: "date", header: "Date" },
    { key: "method", header: "Méthode" },
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
        <button
          onClick={() => {
            setSelectedPayment(row);
            setIsModalOpen(true);
          }}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
          title="Voir les détails"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      ),
    },
  ];

  // Filter payments based on search term
  const filteredPayments = payments.filter(payment =>
    payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalPaid = payments
    .filter(p => p.status === "Payé")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[€,\s]/g, '')), 0);

  const totalPending = payments
    .filter(p => p.status === "En attente")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[€,\s]/g, '')), 0);

  const commissionTotal = payments
    .filter(p => p.type === "Commission" && p.status === "Payé")
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[€,\s]/g, '')), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Paiements</h1>
          <p className="text-gray-600 mt-1">Suivi de vos commissions, salaires et bonus</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reçu</p>
              <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">{totalPending.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commissions</p>
              <p className="text-2xl font-bold text-blue-600">{commissionTotal.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher dans vos paiements (ID, type, description, montant, statut)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredPayments.length} résultat(s) trouvé(s)
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredPayments}
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showActions={false}
      />

      {/* Payment Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayment(null);
        }}
        title="Détails du Paiement"
        size="md"
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ID Paiement</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.type}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Montant</label>
                <p className="mt-1 text-lg font-semibold text-green-600">{selectedPayment.amount}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Méthode</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.method}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Référence</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.reference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <span
                  className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                    selectedPayment.status === "Payé"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedPayment.status}
                </span>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Détails</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.details}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommercialPayments; 