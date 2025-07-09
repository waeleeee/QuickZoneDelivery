import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";

const MembreAgence = () => {
  const [members, setMembers] = useState([
    {
      id: 1,
      name: "Pierre Dubois",
      email: "pierre.membre@email.com",
      phone: "+33 1 23 45 67 89",
      role: "Responsable d'agence",
    },
    {
      id: 2,
      name: "Sarah Ahmed",
      email: "sarah.membre@email.com",
      phone: "+33 1 98 76 54 32",
      role: "Agent d'accueil",
    },
    {
      id: 3,
      name: "Mohamed Ali",
      email: "mohamed.membre@email.com",
      phone: "+33 1 11 22 33 44",
      role: "Gestionnaire de stock",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
  });

  const columns = [
    { key: "name", header: "Nom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "role", header: "Rôle" },
  ];

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleDelete = (member) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
      setMembers(members.filter((m) => m.id !== member.id));
    }
  };

  const handleSubmit = () => {
    if (editingMember) {
      setMembers(
        members.map((member) =>
          member.id === editingMember.id ? { ...formData, id: member.id } : member
        )
      );
    } else {
      const newMember = {
        ...formData,
        id: Math.max(...members.map((m) => m.id)) + 1,
      };
      setMembers([...members, newMember]);
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des membres d'agence</h1>
          <p className="text-gray-600 mt-1">Liste des membres d'agence et leurs rôles</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un membre
        </button>
      </div>

      {/* Tableau des membres */}
      <DataTable
        data={members}
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
        title={editingMember ? "Modifier le membre" : "Ajouter un membre"}
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
              Rôle
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
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
            {editingMember ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MembreAgence; 