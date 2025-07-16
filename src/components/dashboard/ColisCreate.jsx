import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import { apiService } from "../../services/api";

const GOUVERNORATS = [
  "Tunis", "Ariana", "Ben Arous", "Manouba", "Nabeul", "Zaghouan", "Bizerte", "Béja", "Jendouba", "Kef", "Siliana", "Sousse", "Monastir", "Mahdia", "Sfax", "Kairouan", "Kasserine", "Sidi Bouzid", "Gabès", "Medenine", "Tataouine", "Gafsa", "Tozeur", "Kebili"
];
const SERVICES = [
  { value: "Livraison", label: "Livraison" },
  { value: "Echange", label: "Échange" },
  { value: "Livraison + Echange", label: "Livraison + Échange" },
];

const generateCode = () => {
  // Génère un code court : C-XXXXXX (6 chiffres)
  return 'C-' + Math.floor(100000 + Math.random() * 900000);
};

// Get real user data from localStorage
const getCurrentUserData = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  
  if (currentUser) {
    // Use current user data directly
    return {
      societe: currentUser.company || "EXPEDITEUR SARL",
      matriculeFiscal: currentUser.fiscalNumber || "123456789",
      expediteurNom: `${currentUser.firstName || currentUser.name || 'User'} ${currentUser.lastName || 'Name'}`,
      expediteurTel: currentUser.phone || "+216 20 123 456",
      expediteurGouv: currentUser.governorate || "Tunis",
      expediteurAdresse: currentUser.address || "12 Rue de la Liberté, Tunis",
      baseFraisLivraison: currentUser.baseDeliveryFee || 8
    };
  }
  
  // Fallback to mock data if no user found
  return {
    societe: "EXPEDITEUR SARL",
    matriculeFiscal: "123456789",
    expediteurNom: "Ahmed Ben Salah",
    expediteurTel: "+216 20 123 456",
    expediteurGouv: "Tunis",
    expediteurAdresse: "12 Rue de la Liberté, Tunis",
    baseFraisLivraison: 8
  };
};

function calcFraisLivraison(baseFrais, poids) {
  const p = parseFloat(poids);
  const base = parseFloat(baseFrais);
  if (!base) return "";
  if (!p || p <= 10) return base.toFixed(2);
  if (p > 10 && p <= 15) return (base + (p - 10) * 0.9).toFixed(2);
  if (p >= 16) return (base * 2).toFixed(2);
  return base.toFixed(2);
}

const ColisCreate = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [colis, setColis] = useState({
    // Expéditeur
    dateCollecte: "",
    societe: "",
    matriculeFiscal: "",
    expediteurNom: "",
    expediteurTel: "",
    expediteurGouv: "",
    expediteurAdresse: "",
    // Client
    clientNom: "",
    clientTel: "",
    clientTel2: "",
    clientGouv: "",
    clientAdresse: "",
    // Colis
    articleNom: "",
    articlePrix: "",
    fraisLivraison: "8.00",
    service: "Livraison",
    poids: "",
    nbPiece: "",
    remarque: "",
    code: generateCode(),
  });

  // Load user data when component mounts
  useEffect(() => {
    try {
      setLoading(true);
      const currentUserData = getCurrentUserData();
      setUserData(currentUserData);
      setColis(prev => ({
        ...prev,
        societe: currentUserData.societe,
        matriculeFiscal: currentUserData.matriculeFiscal,
        expediteurNom: currentUserData.expediteurNom,
        expediteurTel: currentUserData.expediteurTel,
        expediteurGouv: currentUserData.expediteurGouv,
        expediteurAdresse: currentUserData.expediteurAdresse,
        fraisLivraison: currentUserData.baseFraisLivraison.toFixed(2),
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setColis((prev) => {
      let next = { ...prev, [name]: value };
      // Auto-calc frais de livraison
      if (name === "poids" && userData) {
        next.fraisLivraison = calcFraisLivraison(userData.baseFraisLivraison, next.poids);
      }
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      // Get current user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (!currentUser) {
        alert("Erreur: Utilisateur non connecté");
        return;
      }

      // First, get the shipper_id based on the user's email
      let shipperId = 1; // default fallback
      try {
        const shippersResponse = await apiService.getShippers();
        const shipper = shippersResponse.find(s => s.email === currentUser.email);
        if (shipper) {
          shipperId = shipper.id;
        } else {
          console.warn('No shipper found for email:', currentUser.email);
        }
      } catch (error) {
        console.error('Error fetching shippers:', error);
      }

      // Prepare parcel data for API
      const parcelData = {
        tracking_number: colis.code,
        shipper_id: shipperId,
        destination: `${colis.clientNom} - ${colis.clientAdresse}, ${colis.clientGouv}`,
        status: 'En attente',
        weight: parseFloat(colis.poids) || 0,
        price: parseFloat(colis.articlePrix) || 0,
        delivery_fees: parseFloat(colis.fraisLivraison) || 0,
        type: colis.service,
        estimated_delivery_date: colis.dateCollecte ? new Date(colis.dateCollecte).toISOString().split('T')[0] : null
      };

      console.log('Creating parcel with data:', parcelData);

      // Send to backend API using apiService
      const result = await apiService.createParcel(parcelData);
      
      if (result.success) {
        alert("Colis créé avec succès !");
        
        // Reset form with user data
        if (userData) {
          setColis({
            // Expéditeur
            dateCollecte: "",
            societe: userData.societe,
            matriculeFiscal: userData.matriculeFiscal,
            expediteurNom: userData.expediteurNom,
            expediteurTel: userData.expediteurTel,
            expediteurGouv: userData.expediteurGouv,
            expediteurAdresse: userData.expediteurAdresse,
            // Client
            clientNom: "",
            clientTel: "",
            clientTel2: "",
            clientGouv: "",
            clientAdresse: "",
            // Colis
            articleNom: "",
            articlePrix: "",
            fraisLivraison: userData.baseFraisLivraison.toFixed(2),
            service: "Livraison",
            poids: "",
            nbPiece: "",
            remarque: "",
            code: generateCode(),
          });
        }
      } else {
        alert(`Erreur: ${result.message || 'Échec de la création du colis'}`);
      }
    } catch (error) {
      console.error('Error creating parcel:', error);
      alert(`Erreur lors de la création du colis: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 p-12 rounded-3xl shadow-2xl border border-blue-100">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4 text-gray-600">Chargement des données expéditeur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-50 via-white to-blue-100 p-12 rounded-3xl shadow-2xl border border-blue-100 space-y-10">
      <h2 className="text-4xl font-extrabold text-blue-900 mb-6 text-center tracking-tight drop-shadow">Créer un nouveau colis</h2>
      <form className="grid grid-cols-1 lg:grid-cols-3 gap-10" onSubmit={handleSave}>
        {/* EXPEDITEUR */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 space-y-6 flex flex-col items-center justify-between min-h-[600px]">
          <div className="w-full flex flex-col items-center">
            <h3 className="font-bold text-2xl mb-6 text-blue-700 tracking-wide text-center">EXPÉDITEUR</h3>
            <div className="space-y-4 w-full">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Date de collecte *</label>
                <input type="date" name="dateCollecte" value={colis.dateCollecte} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" required />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Nom de la société *</label>
                <input type="text" name="societe" value={colis.societe} readOnly disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-lg text-gray-500" required />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">M. fiscal</label>
                <input type="text" name="matriculeFiscal" value={colis.matriculeFiscal} readOnly disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-lg text-gray-500" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Expéditeur (nom et prénom) *</label>
                <input type="text" name="expediteurNom" value={colis.expediteurNom} readOnly disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-lg text-gray-500" required />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Téléphone *</label>
                <input type="tel" name="expediteurTel" value={colis.expediteurTel} readOnly disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-lg text-gray-500" required />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Gouvernorat *</label>
                <select name="expediteurGouv" value={colis.expediteurGouv} disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-lg text-gray-500" required>
                  <option value="">Sélectionner</option>
                  {GOUVERNORATS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Adresse</label>
                <input type="text" name="expediteurAdresse" value={colis.expediteurAdresse} readOnly disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-lg text-gray-500" />
              </div>
            </div>
          </div>
        </div>
        {/* CLIENT */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 space-y-6 flex flex-col items-center justify-between min-h-[600px]">
          <div className="w-full flex flex-col items-center">
            <h3 className="font-bold text-2xl mb-6 text-blue-700 tracking-wide text-center">CLIENT</h3>
            <div className="space-y-4 w-full">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Nom & Prénom *</label>
                <input type="text" name="clientNom" value={colis.clientNom} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" required />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Téléphone *</label>
                <input type="tel" name="clientTel" value={colis.clientTel} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" required pattern="[0-9]{8,}" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Téléphone 2</label>
                <input type="tel" name="clientTel2" value={colis.clientTel2} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Gouvernorat *</label>
                <select name="clientGouv" value={colis.clientGouv} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" required>
                  <option value="">Sélectionner</option>
                  {GOUVERNORATS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Adresse</label>
                <input type="text" name="clientAdresse" value={colis.clientAdresse} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" />
              </div>
              {/* Barcode section moved here and centered */}
              <div className="flex flex-col items-center space-y-4 mt-8">
                <span className="text-base text-gray-700 font-semibold">Code-barres du colis :</span>
                <div className="bg-white rounded-xl shadow border border-blue-200 p-6 flex flex-col items-center">
                  <Barcode value={colis.code} width={2.5} height={90} fontSize={22} margin={0} />
                  <span className="mt-2 text-lg font-mono tracking-widest text-blue-700">{colis.code}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* COLIS */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 space-y-6 flex flex-col items-center justify-between min-h-[600px]">
          <div className="w-full flex flex-col items-center">
            <h3 className="font-bold text-2xl mb-6 text-blue-700 tracking-wide text-center">COLIS</h3>
            <div className="space-y-4 w-full">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Nom de l’article</label>
                <input type="text" name="articleNom" value={colis.articleNom} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Prix de l’article TTC</label>
                <input type="number" name="articlePrix" value={colis.articlePrix} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Frais de livraison (TND) *</label>
                <input type="number" name="fraisLivraison" value={colis.fraisLivraison} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" min="0" step="0.01" required readOnly />
                <small className="text-xs text-gray-500">Le prix de base est défini par l'expéditeur. Surcharges automatiques selon le poids.</small>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Service</label>
                <select name="service" value={colis.service} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg">
                  {SERVICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Poids (kg)</label>
                <input type="number" name="poids" value={colis.poids} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" min="0.01" step="0.01" />
                <small className="text-xs text-gray-500 block">0-10kg: prix fixe, 11-15kg: +0,9DT/kg, 16kg+: prix x2</small>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Nombre de pièce</label>
                <input type="number" name="nbPiece" value={colis.nbPiece} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" min="1" step="1" />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Remarque</label>
                <textarea name="remarque" value={colis.remarque} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg" rows={2} />
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1 text-left">Code du colis</label>
                <input type="text" name="code" value={colis.code} readOnly className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 text-lg" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 flex justify-end mt-10">
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-4 px-16 rounded-2xl font-extrabold text-2xl shadow-lg transition-all">Créer le colis</button>
        </div>
      </form>
    </div>
  );
};

export default ColisCreate; 