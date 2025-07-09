import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import ActionButtons from "./common/ActionButtons";
import MembreAgence from "./MembreAgence";

const ChefAgence = () => {
  const [chefs, setChefs] = useState([
    {
      id: 1,
      name: "Pierre Dubois",
      email: "pierre.chef@email.com",
      phone: "+33 1 23 45 67 89",
      agency: "Paris",
    },
    {
      id: 2,
      name: "Sarah Ahmed",
      email: "sarah.chef@email.com",
      phone: "+33 1 98 76 54 32",
      agency: "Lyon",
    },
    {
      id: 3,
      name: "Mohamed Ali",
      email: "mohamed.chef@email.com",
      phone: "+33 1 11 22 33 44",
      agency: "Marseille",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChef, setEditingChef] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    agency: "",
  });
  const [selectedChef, setSelectedChef] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Simuler les membres d'agence pour la démo (reprendre la structure de MembreAgence)
  const allMembers = [
    { id: 1, name: "Pierre Dubois", email: "pierre.membre@email.com", phone: "+33 1 23 45 67 89", role: "Responsable d'agence", agency: "Paris" },
    { id: 2, name: "Sarah Ahmed", email: "sarah.membre@email.com", phone: "+33 1 98 76 54 32", role: "Agent d'accueil", agency: "Paris" },
    { id: 3, name: "Mohamed Ali", email: "mohamed.membre@email.com", phone: "+33 1 11 22 33 44", role: "Gestionnaire de stock", agency: "Lyon" },
    { id: 4, name: "Emma Rousseau", email: "emma.membre@email.com", phone: "+33 6 99 88 77 66", role: "Livreur", agency: "Lyon" },
    { id: 5, name: "Fatima Benali", email: "fatima.membre@email.com", phone: "+33 6 77 66 55 44", role: "Agent de tri", agency: "Marseille" },
  ];

  const columns = [
    { key: "name", header: "Nom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "agency", header: "Agence" },
    {
      key: "actions",
      header: "Actions",
      render: (_, chef) => (
        <ActionButtons
          onView={() => {
            setSelectedChef(chef);
            setShowMembersModal(true);
          }}
        />
      ),
    },
  ];

  const handleAdd = () => {
    setEditingChef(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      agency: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (chef) => {
    setEditingChef(chef);
    setFormData(chef);
    setIsModalOpen(true);
  };

  const handleDelete = (chef) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce chef d'agence ?")) {
      setChefs(chefs.filter((c) => c.id !== chef.id));
    }
  };

  const handleSubmit = () => {
    if (editingChef) {
      setChefs(
        chefs.map((chef) =>
          chef.id === editingChef.id ? { ...formData, id: chef.id } : chef
        )
      );
    } else {
      const newChef = {
        ...formData,
        id: Math.max(...chefs.map((c) => c.id)) + 1,
      };
      setChefs([...chefs, newChef]);
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des chefs d'agence</h1>
          <p className="text-gray-600 mt-1">Liste des chefs d'agence et leurs informations</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un chef d'agence
        </button>
      </div>

      {/* Tableau des chefs d'agence */}
      <DataTable
        data={chefs}
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
        title={editingChef ? "Modifier le chef d'agence" : "Ajouter un chef d'agence"}
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
              Agence
            </label>
            <input
              type="text"
              name="agency"
              value={formData.agency}
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
            {editingChef ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </Modal>

      {/* Modal membres d'agence */}
      <Modal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={selectedChef ? `Membres de l'agence ${selectedChef.agency}` : "Membres de l'agence"}
        size="md"
      >
        <div className="grid grid-cols-1 gap-4">
          {selectedChef && allMembers.filter(m => m.agency === selectedChef.agency).length > 0 ? (
            allMembers.filter(m => m.agency === selectedChef.agency).map((member) => (
              <div key={member.id} className="flex items-center bg-white rounded-lg shadow p-4 border border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 mr-4">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email} &bull; {member.phone}</div>
                </div>
                <div className="ml-4 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: '#f3f4f6', color: '#2563eb' }}>
                  {member.role}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500">Aucun membre trouvé pour cette agence.</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ChefAgence; 