import React, { useState, useMemo } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import ColisTimeline from "./common/ColisTimeline";
import ColisCreate from "./ColisCreate";
import { useParcels, useCreateParcel, useUpdateParcel, useDeleteParcel } from "../../hooks/useApi";
import { useAppStore } from "../../stores/useAppStore";
import { useForm } from "react-hook-form";

const Colis = () => {
  const { parcels, loading, selectedParcel, setSelectedParcel } = useAppStore();
  const { data: parcelsData, isLoading } = useParcels();
  const createParcelMutation = useCreateParcel();
  const updateParcelMutation = useUpdateParcel();
  const deleteParcelMutation = useDeleteParcel();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    shipper: "",
    destination: "",
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const statusOptions = [
    "En attente",
    "Au dépôt",
    "En cours",
    "RTN dépot",
    "Livés",
    "Livrés payés",
    "Retour définitif",
    "RTN client agence",
    "Retour Expéditeur",
    "Retour En Cours d'expédition",
    "Retour reçu",
  ];

  const columns = [
    { key: "id", header: "N° Colis" },
    { key: "shipper", header: "Expéditeur" },
    { key: "destination", header: "Destination" },
    {
      key: "status",
      header: "Statut",
      render: (value) => {
        const statusColors = {
          "En attente": "bg-yellow-100 text-yellow-800",
          "Au dépôt": "bg-blue-100 text-blue-800",
          "En cours": "bg-purple-100 text-purple-800",
          "RTN dépot": "bg-orange-100 text-orange-800",
          "Livés": "bg-green-100 text-green-800",
          "Livrés payés": "bg-emerald-100 text-emerald-800",
          "Retour définitif": "bg-red-100 text-red-800",
          "RTN client agence": "bg-pink-100 text-pink-800",
          "Retour Expéditeur": "bg-gray-100 text-gray-800",
          "Retour En Cours d'expédition": "bg-indigo-100 text-indigo-800",
          "Retour reçu": "bg-cyan-100 text-cyan-800",
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[value] || "bg-gray-100 text-gray-800"}`}>
            {value}
          </span>
        );
      },
    },
    { key: "weight", header: "Poids" },
    { key: "dateCreated", header: "Date de création" },
    { key: "estimatedDelivery", header: "Date de livraison estimée" },
    { key: "price", header: "Prix" },
  ];

  // Memoized filtered data for better performance
  const filteredParcels = useMemo(() => {
    if (!parcelsData) return [];
    
    return parcelsData.filter((parcel) => {
      // Recherche simple
      const matchesSearch = searchTerm === "" || 
        Object.values(parcel).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filtres avancés
      const matchesStatus = advancedFilters.status === "" || parcel.status === advancedFilters.status;
      const matchesShipper = advancedFilters.shipper === "" || 
        parcel.shipper.toLowerCase().includes(advancedFilters.shipper.toLowerCase());
      const matchesDestination = advancedFilters.destination === "" || 
        parcel.destination.toLowerCase().includes(advancedFilters.destination.toLowerCase());
      
      const matchesDateFrom = advancedFilters.dateFrom === "" || 
        new Date(parcel.dateCreated) >= new Date(advancedFilters.dateFrom);
      const matchesDateTo = advancedFilters.dateTo === "" || 
        new Date(parcel.dateCreated) <= new Date(advancedFilters.dateTo);

      return matchesSearch && matchesStatus && matchesShipper && 
             matchesDestination && matchesDateFrom && matchesDateTo;
    });
  }, [parcelsData, searchTerm, advancedFilters]);

  const handleAdd = () => {
    setEditingParcel(null);
    reset();
    setIsModalOpen(true);
  };

  const handleEdit = (parcel) => {
    setEditingParcel(parcel);
    reset(parcel);
    setIsModalOpen(true);
  };

  const handleDelete = (parcel) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce colis ?")) {
      deleteParcelMutation.mutate(parcel.id);
    }
  };

  const onSubmit = (formData) => {
    if (editingParcel) {
      updateParcelMutation.mutate({ id: editingParcel.id, updates: formData });
    } else {
      createParcelMutation.mutate(formData);
    }
    setIsModalOpen(false);
  };

  const handleAdvancedFilterChange = (e) => {
    const { name, value } = e.target;
    setAdvancedFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRowClick = (parcel) => {
    setSelectedParcel(selectedParcel?.id === parcel.id ? null : parcel);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Colis</h1>
          <p className="text-gray-600">Gérez vos colis et suivez leur statut</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>+</span>
            <span>Créer un colis</span>
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <span>+</span>
            <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recherche avancée</h3>
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showAdvancedSearch ? "Masquer" : "Afficher"}
          </button>
        </div>
        
        {showAdvancedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <select
              name="status"
              value={advancedFilters.status}
              onChange={handleAdvancedFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            
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
            
            <input
              type="text"
              name="shipper"
              value={advancedFilters.shipper}
              onChange={handleAdvancedFilterChange}
              placeholder="Expéditeur"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="text"
              name="destination"
              value={advancedFilters.destination}
              onChange={handleAdvancedFilterChange}
              placeholder="Destination"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredParcels}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRowClick={handleRowClick}
      />

      {/* Parcel Details */}
      {selectedParcel && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Détails du colis {selectedParcel.id}</h3>
            <button
              onClick={() => setSelectedParcel(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <ColisTimeline parcel={selectedParcel} />
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingParcel ? "Modifier le colis" : "Ajouter un colis"}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expéditeur
                </label>
                <input
                  {...register("shipper", { required: "L'expéditeur est requis" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.shipper && (
                  <p className="text-red-500 text-sm mt-1">{errors.shipper.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  {...register("destination", { required: "La destination est requise" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.destination && (
                  <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids
                </label>
                <input
                  {...register("weight", { required: "Le poids est requis" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de livraison estimée
                </label>
                <input
                  type="date"
                  {...register("estimatedDelivery", { required: "La date de livraison est requise" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.estimatedDelivery && (
                  <p className="text-red-500 text-sm mt-1">{errors.estimatedDelivery.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix
                </label>
                <input
                  {...register("price", { required: "Le prix est requis" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  {...register("status", { required: "Le statut est requis" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createParcelMutation.isPending || updateParcelMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createParcelMutation.isPending || updateParcelMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <ColisCreate onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Colis; 