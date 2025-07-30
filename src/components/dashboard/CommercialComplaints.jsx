import React, { useState, useEffect } from "react";
import DataTable from "./common/DataTable";
import { apiService } from "../../services/api";

const CommercialComplaints = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [commercialData, setCommercialData] = useState(null);
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");



  useEffect(() => {
    const userFromStorage = JSON.parse(localStorage.getItem('currentUser') || 'null');
    setCurrentUser(userFromStorage);
    
    if (userFromStorage && userFromStorage.role === 'Commercial') {
      fetchCommercialComplaints(userFromStorage);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch complaints for commercial's expediteurs
  const fetchCommercialComplaints = async (user) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get commercial data by email
      const commercials = await apiService.getCommercials();
      const commercial = commercials.find(c => c.email === user.email);
      
      if (!commercial) {
        console.error('Commercial not found for user:', user.email);
        setError('Commercial non trouvé');
        setLoading(false);
        return;
      }
      
      setCommercialData(commercial);
      
      // Fetch complaints from expediteurs managed by this commercial
      const complaintsData = await apiService.getCommercialComplaints(commercial.id, 1, 1000, {});
      setReclamations(complaintsData.complaints || []);
      
    } catch (err) {
      console.error('❌ Error fetching expediteur complaints:', err);
      setError('Erreur lors du chargement des réclamations');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "client_name", header: "Client" },
    { key: "client_email", header: "Email" },
    { key: "subject", header: "Type de problème" },
    { key: "created_at", header: "Date", render: (value) => new Date(value).toLocaleDateString('fr-FR') },
    {
      key: "attachments",
      header: "Pièces jointes",
      render: (value) => {
        if (!value || value.length === 0) {
          return <span className="text-gray-400">Aucune</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((attachment, index) => (
              <a
                key={index}
                href={`http://localhost:5000/uploads/complaints/${attachment}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                <i className="fas fa-paperclip mr-1"></i>
                {attachment}
              </a>
            ))}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (value) => {
        const statusColors = {
          "En attente": "bg-yellow-100 text-yellow-800",
          "En cours de traitement": "bg-blue-100 text-blue-800",
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





  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des réclamations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <i className="fas fa-exclamation-triangle text-2xl"></i>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => fetchCommercialComplaints(currentUser)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header harmonisé */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Réclamations des expéditeurs</h1>
          <p className="text-gray-600 mt-1">
            Réclamations des expéditeurs assignés à votre commercial
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <i className="fas fa-clock text-yellow-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">
                {reclamations.filter(r => r.status === 'En attente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="fas fa-cog text-blue-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En traitement</p>
              <p className="text-2xl font-bold text-gray-900">
                {reclamations.filter(r => r.status === 'En cours de traitement').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <i className="fas fa-check text-green-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Traitées</p>
              <p className="text-2xl font-bold text-gray-900">
                {reclamations.filter(r => r.status === 'Traitée').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <i className="fas fa-times text-red-600"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold text-gray-900">
                {reclamations.filter(r => r.status === 'Rejetée').length}
              </p>
            </div>
          </div>
        </div>
      </div>

             {/* Tableau des réclamations */}
       <DataTable
         data={reclamations}
         columns={columns}
         searchTerm={searchTerm}
         onSearchChange={setSearchTerm}
         showActions={false}
       />

      
    </div>
  );
};

export default CommercialComplaints; 