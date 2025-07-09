import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";

const Finance = () => {
  const [accountants, setAccountants] = useState([
    {
      id: 1,
      name: "Pierre Dubois",
      email: "pierre.finance@quickzone.com",
      phone: "+33 1 23 45 67 89",
      department: "Comptabilité générale",
    },
    {
      id: 2,
      name: "Sarah Ahmed",
      email: "sarah.finance@quickzone.com",
      phone: "+33 1 98 76 54 32",
      department: "Contrôle de gestion",
    },
    {
      id: 3,
      name: "Mohamed Ali",
      email: "mohamed.finance@quickzone.com",
      phone: "+33 1 11 22 33 44",
      department: "Audit",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccountant, setEditingAccountant] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
  });

  const columns = [
    { key: "name", header: "Nom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "department", header: "Département" },
  ];

  const handleAdd = () => {
    setEditingAccountant(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (accountant) => {
    setEditingAccountant(accountant);
    setFormData(accountant);
    setIsModalOpen(true);
  };

  const handleDelete = (accountant) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce comptable ?")) {
      setAccountants(accountants.filter((a) => a.id !== accountant.id));
    }
  };

  const handleSubmit = () => {
    if (editingAccountant) {
      setAccountants(
        accountants.map((accountant) =>
          accountant.id === editingAccountant.id ? { ...formData, id: accountant.id } : accountant
        )
      );
    } else {
      const newAccountant = {
        ...formData,
        id: Math.max(...accountants.map((a) => a.id)) + 1,
      };
      setAccountants([...accountants, newAccountant]);
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des comptables</h1>
          <p className="text-gray-600 mt-1">Gérez les comptables et leurs informations</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un comptable
        </button>
      </div>

      {/* Tableau des comptables */}
      <DataTable
        data={accountants}
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
        title={editingAccountant ? "Modifier le comptable" : "Ajouter un comptable"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Département
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
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
            {editingAccountant ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Finance; 