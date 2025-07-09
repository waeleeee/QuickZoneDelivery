import React, { useState } from "react";
import Barcode from "react-barcode";

const generateCode = () => {
  // Génère un code court : C-XXXXXX (6 chiffres)
  return 'C-' + Math.floor(100000 + Math.random() * 900000);
};

const ColisCreate = () => {
  const [colis, setColis] = useState({
    code: generateCode(),
    expediteur: "",
    description: "",
    poids: "",
    adresse: "",
    prix: "",
    client: "",
    telClient: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setColis((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Ici, tu peux remplacer par un appel API ou autre logique de sauvegarde
    console.log("Colis sauvegardé :", colis);
    alert("Colis créé avec succès !");
    setColis({
      code: generateCode(),
      expediteur: "",
      description: "",
      poids: "",
      adresse: "",
      prix: "",
      client: "",
      telClient: ""
    });
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un nouveau colis</h2>
      <form className="space-y-4" onSubmit={handleSave}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expéditeur</label>
          <input
            type="text"
            name="expediteur"
            value={colis.expediteur}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client</label>
          <input
            type="text"
            name="client"
            value={colis.client}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone du client</label>
          <input
            type="tel"
            name="telClient"
            value={colis.telClient}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            pattern="[0-9+ ]{6,}"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            name="description"
            value={colis.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poids (kg)</label>
          <input
            type="number"
            name="poids"
            value={colis.poids}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
          <input
            type="text"
            name="adresse"
            value={colis.adresse}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
          <input
            type="number"
            name="prix"
            value={colis.prix}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code du colis</label>
          <input
            type="text"
            name="code"
            value={colis.code}
            readOnly
            className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-500"
          />
        </div>
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-gray-500">Code-barres du colis :</span>
          <Barcode value={colis.code} width={2} height={60} fontSize={16} margin={0} />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold text-lg mt-4"
        >
          Créer le colis
        </button>
      </form>
    </div>
  );
};

export default ColisCreate; 