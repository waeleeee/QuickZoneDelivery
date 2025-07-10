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

const Livreurs = () => {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "Pierre Dubois",
      email: "pierre.livreur@email.com",
      phone: "+33 1 23 45 67 89",
      address: "12 Rue de Paris, Tunis",
      vehicle: "Renault Kangoo",
      gouvernorat: "Tunis",
    },
    {
      id: 2,
      name: "Sarah Ahmed",
      email: "sarah.livreur@email.com",
      phone: "+33 1 98 76 54 32",
      address: "34 Avenue Habib Bourguiba, Sousse",
      vehicle: "Peugeot Partner",
      gouvernorat: "Sousse",
    },
    {
      id: 3,
      name: "Mohamed Ali",
      email: "mohamed.livreur@email.com",
      phone: "+33 1 11 22 33 44",
      address: "56 Rue de la Liberté, Sfax",
      vehicle: "Citroën Berlingo",
      gouvernorat: "Sfax",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    vehicle: "",
    gouvernorat: "Tunis",
  });

  const columns = [
    { key: "name", header: "Nom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "gouvernorat", header: "Gouvernorat" },
    { key: "address", header: "Adresse" },
    { key: "vehicle", header: "Véhicule" },
  ];

  const handleAdd = () => {
    setEditingDriver(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      vehicle: "",
      gouvernorat: "Tunis",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData(driver);
    setIsModalOpen(true);
  };

  const handleDelete = (driver) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce livreur ?")) {
      setDrivers(drivers.filter((d) => d.id !== driver.id));
    }
  };

  const handleSubmit = () => {
    if (editingDriver) {
      setDrivers(
        drivers.map((driver) =>
          driver.id === editingDriver.id ? { ...formData, id: driver.id } : driver
        )
      );
    } else {
      const newDriver = {
        ...formData,
        id: Math.max(...drivers.map((d) => d.id)) + 1,
      };
      setDrivers([...drivers, newDriver]);
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
          <h1 className="text-2xl font-bold text-gray-900">Gestion des livreurs</h1>
          <p className="text-gray-600 mt-1">Liste des livreurs et leurs informations</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Ajouter un livreur
        </button>
      </div>

      {/* Tableau des livreurs */}
      <DataTable
        data={drivers}
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
        title={editingDriver ? "Modifier le livreur" : "Ajouter un livreur"}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Véhicule
            </label>
            <input
              type="text"
              name="vehicle"
              value={formData.vehicle}
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
            {editingDriver ? "Mettre à jour" : "Ajouter"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Livreurs; 