import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";

// List of Tunisian governorates
const gouvernorats = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa", "Jendouba", 
  "Kairouan", "Kasserine", "Kébili", "Kef", "Mahdia", "Manouba", "Médenine", 
  "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse", "Tataouine", 
  "Tozeur", "Tunis", "Zaghouan"
];

const Administration = () => {
  const [administrators, setAdministrators] = useState([
    {
      id: "ADM001",
      name: "Pierre Dubois",
      email: "pierre.dubois@quickzone.com",
      role: "Administrateur système",
      phone: "+33 1 23 45 67 89",
      address: "123 Rue de la Paix, 75001 Paris, France",
      gouvernorat: "Tunis",
    },
    {
      id: "ADM002",
      name: "Sarah Ahmed",
      email: "sarah.ahmed@quickzone.com",
      role: "Gestionnaire utilisateurs",
      phone: "+33 1 98 76 54 32",
      address: "456 Avenue des Champs-Élysées, 75008 Paris, France",
      gouvernorat: "Sousse",
    },
    {
      id: "ADM003",
      name: "Mohamed Ali",
      email: "mohamed.ali@quickzone.com",
      role: "Responsable sécurité",
      phone: "+33 1 11 22 33 44",
      address: "789 Boulevard Saint-Germain, 75006 Paris, France",
      gouvernorat: "Sfax",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "admin",
    gouvernorat: "Tunis"
  });

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "gouvernorat", header: "Gouvernorat" },
    { key: "address", header: "Adresse" },
    { key: "role", header: "Rôle" },
  ];

  const handleAdd = () => {
    setEditingAdmin(null);
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "admin",
      gouvernorat: "Tunis"
    });
    setIsModalOpen(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData(admin);
    setIsModalOpen(true);
  };

  const handleDelete = (admin) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet administrateur ?")) {
      setAdministrators(administrators.filter((a) => a.id !== admin.id));
    }
  };

  const handleSubmit = () => {
    if (editingAdmin) {
      setAdministrators(
        administrators.map((admin) =>
          admin.id === editingAdmin.id ? { ...formData, id: admin.id } : admin
        )
      );
    } else {
      const newAdmin = {
        ...formData,
        id: `ADM${String(administrators.length + 1).padStart(3, '0')}`,
      };
      setAdministrators([...administrators, newAdmin]);
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion admin</h1>
          <p className="text-gray-600 mt-1">Gérez les utilisateurs ayant des droits d'administration</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter admin
        </button>
      </div>

      {/* Tableau des administrateurs */}
      <DataTable
        data={administrators}
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
        title={editingAdmin ? "Modifier admin" : "Ajouter admin"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              ID
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              disabled
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
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
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
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
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
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
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Gouvernorat
            </label>
            <select
              name="gouvernorat"
              value={formData.gouvernorat}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {gouvernorats.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Adresse
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Rôle
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="admin">admin</option>
              <option value="Gestionnaire utilisateurs">Gestionnaire utilisateurs</option>
              <option value="Responsable sécurité">Responsable sécurité</option>
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
            {editingAdmin ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Administration; 