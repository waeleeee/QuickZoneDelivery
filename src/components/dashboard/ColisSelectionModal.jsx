import React, { useState, useEffect } from "react";
import Modal from "./common/Modal";
import { apiService } from "../../services/api";

const ColisSelectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  expediteurId, 
  expediteurEmail,
  shippers = []
}) => {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedParcels, setSelectedParcels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedShipper, setSelectedShipper] = useState(null);
  const [step, setStep] = useState('shipper'); // 'shipper' or 'parcels'

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('shipper');
      setSelectedShipper(null);
      setSelectedParcels([]);
      setParcels([]);
    }
  }, [isOpen]);

  // Fetch parcels for the expediteur
  useEffect(() => {
    if (isOpen && selectedShipper && step === 'parcels') {
      fetchParcels();
    }
  }, [isOpen, selectedShipper, step]);

  const fetchParcels = async () => {
    try {
      setLoading(true);
      let parcelsData = [];
      
      if (selectedShipper) {
        console.log('🔍 Fetching parcels for shipper:', selectedShipper);
        
        // Try to get parcels by shipper ID from all parcels
        const allParcels = await apiService.getParcels();
        console.log('📦 All parcels received:', allParcels?.length || 0);
        
        if (allParcels && Array.isArray(allParcels)) {
          parcelsData = allParcels.filter(p => p.shipper_id == selectedShipper.id);
          console.log('📦 Filtered parcels for shipper:', parcelsData.length);
        }
        
        // If no parcels found, try to get parcels by shipper email
        if (parcelsData.length === 0 && selectedShipper.email) {
          console.log('🔍 Trying to get parcels by email:', selectedShipper.email);
          const expediteurParcels = await apiService.getExpediteurParcels(selectedShipper.email);
          console.log('📦 Expediteur parcels received:', expediteurParcels?.length || 0);
          
          if (expediteurParcels && Array.isArray(expediteurParcels)) {
            parcelsData = expediteurParcels;
          } else if (expediteurParcels && expediteurParcels.parcels) {
            parcelsData = expediteurParcels.parcels;
          }
        }
      }
      
      console.log('📦 Raw parcels data:', parcelsData);
      
      // Filter only delivered or returned parcels (including French and English statuses)
      const filteredParcels = parcelsData.filter(p => 
        p.status === 'Livré' || p.status === 'Retour' || 
        p.status === 'delivered' || p.status === 'returned' ||
        p.status === 'Livrés' || p.status === 'Livrés payés'
      );
      
      console.log('📦 Filtered parcels (Livré/Retour):', filteredParcels.length);
      setParcels(filteredParcels);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      setParcels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleParcelToggle = (parcel) => {
    setSelectedParcels(prev => {
      const isSelected = prev.find(p => p.id === parcel.id);
      if (isSelected) {
        return prev.filter(p => p.id !== parcel.id);
      } else {
        return [...prev, parcel];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedParcels.length === filteredParcels.length) {
      setSelectedParcels([]);
    } else {
      setSelectedParcels(filteredParcels);
    }
  };

  const handleShipperSelect = (shipper) => {
    setSelectedShipper(shipper);
    setStep('parcels');
  };

  const handleConfirm = () => {
    if (selectedParcels.length === 0) {
      alert('Veuillez sélectionner au moins un colis');
      return;
    }
    onConfirm(selectedParcels);
    onClose();
  };

  const handleBack = () => {
    setStep('shipper');
    setSelectedShipper(null);
    setSelectedParcels([]);
    setParcels([]);
  };

  // Filter parcels based on search and status
  const filteredParcels = parcels.filter(parcel => {
    const matchesSearch = !searchTerm || 
      parcel.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || parcel.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalAmount = selectedParcels.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'shipper' ? "Sélectionner l'Expéditeur" : `Sélectionner les Colis - ${selectedShipper?.name}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Step indicator */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'shipper' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step === 'parcels' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'parcels' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {step === 'shipper' ? (
          /* Shipper Selection Step */
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium">Choisissez l'expéditeur pour créer la facture</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {shippers.map((shipper) => (
                <div
                  key={shipper.id}
                  onClick={() => handleShipperSelect(shipper)}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="font-medium">{shipper.name}</div>
                  <div className="text-sm text-gray-600">{shipper.email}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {shipper.phone || 'Téléphone non spécifié'}
                  </div>
                </div>
              ))}
            </div>
            
            {shippers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun expéditeur disponible
              </div>
            )}
          </div>
        ) : (
          /* Parcels Selection Step */
          <div className="space-y-4">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à la sélection d'expéditeur
            </button>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Rechercher par numéro de suivi, destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Livré">Livré</option>
                  <option value="Livrés">Livrés</option>
                  <option value="Livrés payés">Livrés payés</option>
                  <option value="Retour">Retour</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            </div>

            {/* Selection Summary */}
            {selectedParcels.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {selectedParcels.length} colis sélectionné(s)
                  </span>
                  <span className="font-bold text-blue-600">
                    Total: {totalAmount.toFixed(3)} TND
                  </span>
                </div>
              </div>
            )}

            {/* Parcels List */}
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Chargement des colis...</span>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={selectedParcels.length === filteredParcels.length && filteredParcels.length > 0}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-3 py-2 text-left">N° Suivi</th>
                      <th className="px-3 py-2 text-left">Destination</th>
                      <th className="px-3 py-2 text-left">Client</th>
                      <th className="px-3 py-2 text-left">Statut</th>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-right">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParcels.map((parcel) => {
                      const isSelected = selectedParcels.find(p => p.id === parcel.id);
                      return (
                        <tr 
                          key={parcel.id} 
                          className={`border-b hover:bg-gray-50 cursor-pointer ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleParcelToggle(parcel)}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={!!isSelected}
                              onChange={() => handleParcelToggle(parcel)}
                              className="rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {parcel.tracking_number}
                          </td>
                          <td className="px-3 py-2">
                            {parcel.destination || parcel.recipient_address}
                          </td>
                          <td className="px-3 py-2">
                            {parcel.recipient_name}
                          </td>
                          <td className="px-3 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                          parcel.status === 'Livré' || parcel.status === 'delivered' || 
                          parcel.status === 'Livrés' || parcel.status === 'Livrés payés'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {parcel.status}
                        </span>
                          </td>
                          <td className="px-3 py-2">
                            {parcel.created_at ? new Date(parcel.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {parseFloat(parcel.price || 0).toFixed(3)} TND
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {filteredParcels.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Aucun colis trouvé
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          {step === 'parcels' && (
            <button
              onClick={handleConfirm}
              disabled={selectedParcels.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Créer la Facture ({selectedParcels.length})
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ColisSelectionModal; 