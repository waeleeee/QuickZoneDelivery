import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";

const Reclamation = () => {
  const [reclamations, setReclamations] = useState([
    {
      id: "REC001",
      client: "Pierre Dubois",
      subject: "Colis endommagé",
      date: "2024-01-15",
      status: "En attente",
    },
    {
      id: "REC002",
      client: "Sarah Ahmed",
      subject: "Retard de livraison",
      date: "2024-01-14",
      status: "Traitée",
    },
    {
      id: "REC003",
      client: "Mohamed Ali",
      subject: "Erreur d'adresse",
      date: "2024-01-13",
      status: "Rejetée",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReclamation, setEditingReclamation] = useState(null);
  const [formData, setFormData] = useState({
    client: "",
    subject: "",
    date: "",
    status: "En attente",
  });

  const statusOptions = [
    "En attente",
    "Traitée",
    "Rejetée",
  ];

  const columns = [
    { key: "id", header: "ID" },
    { key: "client", header: "Client" },
    { key: "subject", header: "Objet" },
    { key: "date", header: "Date" },
    {
      key: "status",
      header: "Statut",
      render: (value) => {
        const statusColors = {
          "En attente": "bg-yellow-100 text-yellow-800",
          "Traitée": "bg-green-100 text-green-800",
          "Rejetée": "bg-red-100 text-red-800",
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[value] || "bg-gray-100 text-gray-800"}`}>
            {value}
          </span>
        );
      },
    },
  ];

  const handleAdd = () => {
    setEditingReclamation(null);
    setFormData({
      client: "",
      subject: "",
      date: "",
      status: "En attente",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (reclamation) => {
    setEditingReclamation(reclamation);
    setFormData(reclamation);
    setIsModalOpen(true);
  };

  const handleDelete = (reclamation) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réclamation ?")) {
      setReclamations(reclamations.filter((r) => r.id !== reclamation.id));
    }
  };

  const handleSubmit = () => {
    if (editingReclamation) {
      setReclamations(
        reclamations.map((reclamation) =>
          reclamation.id === editingReclamation.id ? { ...formData, id: reclamation.id } : reclamation
        )
      );
    } else {
      const newReclamation = {
        ...formData,
        id: `REC${String(reclamations.length + 1).padStart(3, '0')}`,
      };
      setReclamations([...reclamations, newReclamation]);
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

  return (
    <div className="space-y-6">
      {/* Header harmonisé */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des réclamations</h1>
          <p className="text-gray-600 mt-1">Liste des réclamations clients et leur suivi</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter une réclamation
        </button>
      </div>

      {/* Tableau des réclamations */}
      <DataTable
        data={reclamations}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Modal d'ajout/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReclamation ? "Modifier la réclamation" : "Ajouter une réclamation"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <input
              type="text"
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objet
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
              {editingReclamation ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reclamation; 