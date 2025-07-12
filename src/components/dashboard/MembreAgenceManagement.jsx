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

const MembreAgenceManagement = () => {
  const [members, setMembers] = useState([
    {
      id: "MEM001",
      name: "Pierre Dubois",
      email: "pierre.membre@email.com",
      phone: "+33 1 23 45 67 89",
      address: "12 Rue de Paris, Tunis",
      agence: "Tunis",
      role: "Responsable d'agence",
      gouvernorat: "Tunis",
      status: "Actif",
      dateCreation: "2024-01-15"
    },
    {
      id: "MEM002",
      name: "Sarah Ahmed",
      email: "sarah.membre@email.com",
      phone: "+33 1 98 76 54 32",
      address: "34 Avenue Habib Bourguiba, Sousse",
      agence: "Sousse",
      role: "Agent d'accueil",
      gouvernorat: "Sousse",
      status: "Actif",
      dateCreation: "2024-01-20"
    },
    {
      id: "MEM003",
      name: "Mohamed Ali",
      email: "mohamed.membre@email.com",
      phone: "+33 1 11 22 33 44",
      address: "56 Rue de la Liberté, Sfax",
      agence: "Sfax",
      role: "Gestionnaire de stock",
      gouvernorat: "Sfax",
      status: "Actif",
      dateCreation: "2024-02-01"
    },
    {
      id: "MEM004",
      name: "Fatima Ben Salem",
      email: "fatima.membre@email.com",
      phone: "+33 1 44 55 66 77",
      address: "78 Boulevard Central, Monastir",
      agence: "Monastir",
      role: "Agent de livraison",
      gouvernorat: "Monastir",
      status: "Inactif",
      dateCreation: "2024-01-10"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    agence: "Tunis",
    role: "",
    gouvernorat: "Tunis",
    status: "Actif"
  });

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nom et prénom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "gouvernorat", header: "Gouvernorat" },
    { key: "agence", header: "Agence" },
    { key: "role", header: "Rôle" },
    { key: "status", header: "Statut" },
    { key: "dateCreation", header: "Date de création" }
  ];

  const handleAdd = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      agence: "Tunis",
      role: "",
      gouvernorat: "Tunis",
      status: "Actif"
    });
    setIsModalOpen(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData(member);
    setIsModalOpen(true);
  };

  const handleDelete = (member) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce membre d'agence ?")) {
      setMembers(members.filter((m) => m.id !== member.id));
    }
  };

  const handleSubmit = () => {
    if (editingMember) {
      setMembers(
        members.map((member) =>
          member.id === editingMember.id ? { ...formData, id: member.id, dateCreation: member.dateCreation } : member
        )
      );
    } else {
      const newMember = {
        ...formData,
        id: `MEM${String(members.length + 1).padStart(3, '0')}`,
        dateCreation: new Date().toISOString().split('T')[0]
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

  // Calculate statistics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === "Actif").length;
  const inactiveMembers = members.filter(m => m.status === "Inactif").length;
  const agencies = [...new Set(members.map(m => m.agence))].length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Membres d'Agence</h1>
          <p className="text-gray-600 mt-1">Gestion complète du personnel des agences</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un membre
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Membres</p>
              <p className="text-xl font-bold text-blue-600">{totalMembers}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Membres Actifs</p>
              <p className="text-xl font-bold text-green-600">{activeMembers}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Membres Inactifs</p>
              <p className="text-xl font-bold text-red-600">{inactiveMembers}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Agences</p>
              <p className="text-xl font-bold text-purple-600">{agencies}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <DataTable
        data={members}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? "Modifier le membre d'agence" : "Ajouter un membre d'agence"}
        size="md"
      >
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-left">Nom et prénom</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Téléphone</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Gouvernorat</label>
              <select 
                name="gouvernorat" 
                value={formData.gouvernorat} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {gouvernorats.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-left">Adresse</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Agence</label>
              <select 
                name="agence" 
                value={formData.agence} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Tunis">Tunis</option>
                <option value="Sousse">Sousse</option>
                <option value="Sfax">Sfax</option>
                <option value="Monastir">Monastir</option>
                <option value="Gabès">Gabès</option>
                <option value="Médenine">Médenine</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Rôle</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un rôle</option>
                <option value="Responsable d'agence">Responsable d'agence</option>
                <option value="Agent d'accueil">Agent d'accueil</option>
                <option value="Gestionnaire de stock">Gestionnaire de stock</option>
                <option value="Agent de livraison">Agent de livraison</option>
                <option value="Agent administratif">Agent administratif</option>
                <option value="Superviseur">Superviseur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Statut</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleInputChange} 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="En congé">En congé</option>
                <option value="Suspendu">Suspendu</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 space-x-reverse pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {editingMember ? "Mettre à jour" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembreAgenceManagement; 