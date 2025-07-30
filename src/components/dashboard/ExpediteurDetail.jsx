import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import html2pdf from "html2pdf.js";
import ColisTimeline from "./common/ColisTimeline";

const ExpediteurDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const detailRef = useRef();
  const [shipper, setShipper] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showTimelineModal, setShowTimelineModal] = useState(false);

  useEffect(() => {
    // Récupérer les données de l'expéditeur depuis le state de navigation
    if (location.state?.shipper) {
      setShipper(location.state.shipper);
    } else {
      // Fallback : simuler la récupération depuis une API
      const mockShipper = {
        id: parseInt(id),
        name: "Pierre Dubois",
        email: "pierre.dubois@email.com",
        phone: "+33 1 23 45 67 89",
        address: "12 rue de Paris, 75001 Paris",
        totalShipments: 45,
        successfulShipments: 42,
        status: "Actif",
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
                      { id: "COL006", status: "Livés", date: "2024-01-15", amount: 22.50, destination: "Bordeaux", weight: "2.1kg", type: "Standard" },
          { id: "COL007", status: "Retour", date: "2024-01-14", amount: 0.00, destination: "Nantes", weight: "1.9kg", type: "Standard" },
        ],
        payments: [
          { id: "PAY001", amount: 150.25, date: "2024-01-15", status: "Payé", method: "Carte bancaire", reference: "REF001" },
          { id: "PAY002", amount: 89.50, date: "2024-01-10", status: "En attente", method: "Virement", reference: "REF002" },
          { id: "PAY003", amount: 210.75, date: "2024-01-05", status: "Payé", method: "Chèque", reference: "REF003" },
          { id: "PAY004", amount: 95.00, date: "2024-01-01", status: "Payé", method: "Espèces", reference: "REF004" },
        ],
        statistics: {
          totalRevenue: 2840.50,
          averagePerShipment: 63.12,
          onTimeDelivery: 92,
          customerRating: 4.8,
          monthlyAverage: 236.71,
          peakMonth: "Décembre 2023",
          peakRevenue: 450.00
        }
      };
      setShipper(mockShipper);
    }
  }, [id, location.state]);

  const handleExportPDF = async () => {
    if (detailRef.current) {
      setIsExporting(true);
      try {
        // Configuration optimisée pour éviter les chevauchements
        await html2pdf().set({
          margin: [0.3, 0.3, 0.3, 0.3],
          filename: `Expediteur_${shipper?.name.replace(/\s+/g, '_')}.pdf`,
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

  const handleParcelClick = (parcel) => {
    setSelectedParcel(parcel);
    setShowTimelineModal(true);
  };

  const closeTimelineModal = () => {
    setShowTimelineModal(false);
    setSelectedParcel(null);
  };

  if (!shipper) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  // Vérifications de sécurité pour les propriétés manquantes
  const safeShipper = {
    ...shipper,
    website: shipper.website || "Non renseigné",
    contactPerson: shipper.contactPerson || "Non renseigné",
    contactPhone: shipper.contactPhone || "Non renseigné",
    bankInfo: shipper.bankInfo || {
      bank: "Non renseigné",
      iban: "Non renseigné",
      bic: "Non renseigné"
    },
    successfulShipments: shipper.successfulShipments || 0,
    statistics: shipper.statistics || {
      totalRevenue: 0,
      averagePerShipment: 0,
      onTimeDelivery: 0,
      customerRating: 0,
      monthlyAverage: 0,
      peakMonth: "Non renseigné",
      peakRevenue: 0
    },
    colis: shipper.colis || [],
    payments: shipper.payments || []
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation - masqué lors de l'export PDF */}
      {!isExporting && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard/expediteur")}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Retour à la liste"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de l'expéditeur</h1>
              <p className="text-gray-600 mt-1">{safeShipper.name} - {safeShipper.company}</p>
            </div>
          </div>
          <button
            onClick={handleExportPDF}
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow hover:scale-105 transition-transform"
          >
            Exporter en PDF
          </button>
        </div>
      )}

      {/* Contenu principal */}
      <div ref={detailRef} className="bg-white rounded-2xl shadow-xl p-8 max-w-7xl mx-auto border border-blue-100">
        {/* Titre pour le PDF */}
        {isExporting && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de l'expéditeur</h1>
            <p className="text-xl text-gray-600">{safeShipper.name} - {safeShipper.company}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Nom complet :</span>
                    <span className="text-gray-900">{safeShipper.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Email :</span>
                    <span className="text-gray-900">{safeShipper.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Téléphone :</span>
                    <span className="text-gray-900">{safeShipper.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Contact principal :</span>
                    <span className="text-gray-900">{safeShipper.contactPerson}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Entreprise :</span>
                    <span className="text-gray-900">{safeShipper.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">SIRET :</span>
                    <span className="text-gray-900">{safeShipper.siret}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Site web :</span>
                    <span className="text-gray-900">{safeShipper.website}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Tél. contact :</span>
                    <span className="text-gray-900">{safeShipper.contactPhone}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Adresse complète :</span>
                  <span className="text-gray-900 text-right">{safeShipper.address}</span>
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
                  <div className="text-gray-900">{safeShipper.bankInfo.bank}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">IBAN :</span>
                  <div className="text-gray-900 font-mono text-sm">{safeShipper.bankInfo.iban}</div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">BIC :</span>
                  <div className="text-gray-900 font-mono text-sm">{safeShipper.bankInfo.bic}</div>
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
                  <div className="text-2xl font-bold text-blue-600">{safeShipper.statistics.totalRevenue}€</div>
                  <div className="text-xs text-gray-600">Chiffre d'affaires</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600">{safeShipper.statistics.averagePerShipment}€</div>
                  <div className="text-xs text-gray-600">Moyenne/colis</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-purple-600">{safeShipper.statistics.onTimeDelivery}%</div>
                  <div className="text-xs text-gray-600">Livraison à temps</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-orange-600">{safeShipper.statistics.customerRating}/5</div>
                  <div className="text-xs text-gray-600">Note client</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow">
                  <div className="text-2xl font-bold text-indigo-600">{safeShipper.statistics.monthlyAverage}€</div>
                  <div className="text-xs text-gray-600">Moyenne mensuelle</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="inline-block bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs font-bold">Informations système</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Statut :</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    safeShipper.status === "Actif"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {safeShipper.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Date d'inscription :</span>
                  <span className="text-gray-900">{safeShipper.registrationDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Dernière activité :</span>
                  <span className="text-gray-900">{safeShipper.lastActivity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Total colis :</span>
                  <span className="text-gray-900 font-bold">{safeShipper.totalShipments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Colis réussis :</span>
                  <span className="text-gray-900 font-bold text-green-600">{safeShipper.successfulShipments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Taux de réussite :</span>
                  <span className="text-gray-900 font-bold">{safeShipper.totalShipments > 0 ? Math.round((safeShipper.successfulShipments / safeShipper.totalShipments) * 100) : 0}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colis récents */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block bg-orange-100 text-orange-700 rounded-full px-3 py-1 text-xs font-bold">Historique des colis</span>
            <span className="text-xs text-gray-400">({safeShipper.colis.length})</span>
            <span className="text-xs text-orange-600 ml-auto">💡 Cliquez sur un colis pour voir sa timeline</span>
          </h3>
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
                </tr>
              </thead>
              <tbody>
                {safeShipper.colis.map((colis) => (
                  <tr 
                    key={colis.id} 
                    className="border-b border-orange-100 hover:bg-orange-50 cursor-pointer transition-colors"
                    onClick={() => handleParcelClick(colis)}
                  >
                    <td className="py-2 font-medium text-blue-700">{colis.id}</td>
                    <td className="py-2 text-gray-600">{colis.destination || "Non renseigné"}</td>
                    <td className="py-2 text-gray-600">{colis.type || "Standard"}</td>
                    <td className="py-2 text-gray-600">{colis.weight || "Non renseigné"}</td>
                    <td className="py-2">{getStatusBadge(colis.status)}</td>
                    <td className="py-2 text-gray-600">{colis.date}</td>
                    <td className="py-2 text-right font-semibold">{colis.amount}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historique des paiements */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-xs font-bold">Historique des paiements</span>
            <span className="text-xs text-gray-400">({safeShipper.payments.length})</span>
          </h3>
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
                </tr>
              </thead>
              <tbody>
                {safeShipper.payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-indigo-100">
                    <td className="py-2 font-medium text-indigo-700">{payment.id}</td>
                    <td className="py-2 text-gray-600">{payment.reference || "Non renseigné"}</td>
                    <td className="py-2 text-gray-600">{payment.method}</td>
                    <td className="py-2">{getPaymentStatusBadge(payment.status)}</td>
                    <td className="py-2 text-gray-600">{payment.date}</td>
                    <td className="py-2 text-right font-semibold">{payment.amount}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bouton de retour à la fin - masqué lors de l'export PDF */}
        {!isExporting && (
          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate("/dashboard/expediteur")}
              className="bg-gradient-to-r from-gray-500 to-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow hover:scale-105 transition-transform"
            >
              ← Retour à la gestion des expéditeurs
            </button>
          </div>
        )}
      </div>

      {/* Timeline Modal */}
      {showTimelineModal && selectedParcel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Timeline du Colis {selectedParcel.id}</h3>
                <button 
                  onClick={closeTimelineModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <ColisTimeline parcel={selectedParcel} onClose={closeTimelineModal} />
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ExpediteurDetail; 