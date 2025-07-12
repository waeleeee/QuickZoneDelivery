import React, { useState, useMemo } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";
import ColisTimeline from "./common/ColisTimeline";
import ColisCreate from "./ColisCreate";
import BonLivraisonColis from "./BonLivraisonColis";
import { useParcels, useCreateParcel, useUpdateParcel, useDeleteParcel } from "../../hooks/useApi";
import { useAppStore } from "../../stores/useAppStore";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ColisClient = () => {
  const { parcels, loading, selectedParcel, setSelectedParcel } = useAppStore();
  const { data: parcelsData, isLoading } = useParcels();

  // Mock data for Expéditeur parcels
  const mockParcelsData = [
    {
      id: "COL001",
      shipper: "Ahmed Mohamed",
      destination: "123 Rue de la Paix, 1000 Tunis",
      status: "En attente",
      weight: "2.5 kg",
      dateCreated: "2024-01-15",
      estimatedDelivery: "2024-01-20",
      price: "25,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-001",
      description: "Colis fragile - Électronique"
    },
    {
      id: "COL002",
      shipper: "Ahmed Mohamed",
      destination: "456 Avenue Habib Bourguiba, 4000 Sousse",
      status: "En attente",
      weight: "1.8 kg",
      dateCreated: "2024-01-16",
      estimatedDelivery: "2024-01-21",
      price: "18,50 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-002",
      description: "Colis standard - Vêtements"
    },
    {
      id: "COL003",
      shipper: "Ahmed Mohamed",
      destination: "789 Rue de la Liberté, 3000 Sfax",
      status: "En attente",
      weight: "3.2 kg",
      dateCreated: "2024-01-17",
      estimatedDelivery: "2024-01-22",
      price: "32,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-003",
      description: "Colis lourd - Livres"
    },
    {
      id: "COL004",
      shipper: "Ahmed Mohamed",
      destination: "321 Boulevard Central, 5000 Monastir",
      status: "À enlever",
      weight: "1.5 kg",
      dateCreated: "2024-01-14",
      estimatedDelivery: "2024-01-19",
      price: "15,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-004",
      description: "Colis express - Documents"
    },
    {
      id: "COL005",
      shipper: "Ahmed Mohamed",
      destination: "654 Rue du Commerce, 6000 Gabès",
      status: "À enlever",
      weight: "2.0 kg",
      dateCreated: "2024-01-13",
      estimatedDelivery: "2024-01-18",
      price: "20,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-005",
      description: "Colis standard - Accessoires"
    },
    {
      id: "COL006",
      shipper: "Ahmed Mohamed",
      destination: "987 Avenue des Fleurs, 7000 Bizerte",
      status: "À enlever",
      weight: "4.1 kg",
      dateCreated: "2024-01-12",
      estimatedDelivery: "2024-01-17",
      price: "41,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-006",
      description: "Colis volumineux - Meubles"
    },
    {
      id: "COL007",
      shipper: "Ahmed Mohamed",
      destination: "147 Rue de la Mer, 8000 Nabeul",
      status: "Enlevé",
      weight: "1.2 kg",
      dateCreated: "2024-01-11",
      estimatedDelivery: "2024-01-16",
      price: "12,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-007",
      description: "Colis léger - Bijoux"
    },
    {
      id: "COL008",
      shipper: "Ahmed Mohamed",
      destination: "258 Boulevard du Sud, 9000 Médenine",
      status: "Enlevé",
      weight: "2.8 kg",
      dateCreated: "2024-01-10",
      estimatedDelivery: "2024-01-15",
      price: "28,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-008",
      description: "Colis standard - Électroménager"
    },
    {
      id: "COL009",
      shipper: "Ahmed Mohamed",
      destination: "369 Rue de l'Est, 10000 Tataouine",
      status: "Enlevé",
      weight: "1.9 kg",
      dateCreated: "2024-01-09",
      estimatedDelivery: "2024-01-14",
      price: "19,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-009",
      description: "Colis fragile - Verre"
    },
    {
      id: "COL010",
      shipper: "Ahmed Mohamed",
      destination: "741 Avenue du Nord, 11000 Le Kef",
      status: "Au dépôt",
      weight: "3.5 kg",
      dateCreated: "2024-01-08",
      estimatedDelivery: "2024-01-13",
      price: "35,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-010",
      description: "Colis lourd - Outils"
    },
    {
      id: "COL011",
      shipper: "Ahmed Mohamed",
      destination: "852 Rue de l'Ouest, 12000 Siliana",
      status: "Au dépôt",
      weight: "2.1 kg",
      dateCreated: "2024-01-07",
      estimatedDelivery: "2024-01-12",
      price: "21,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-011",
      description: "Colis standard - Textile"
    },
    {
      id: "COL012",
      shipper: "Ahmed Mohamed",
      destination: "963 Boulevard Central, 13000 Zaghouan",
      status: "Au dépôt",
      weight: "1.6 kg",
      dateCreated: "2024-01-06",
      estimatedDelivery: "2024-01-11",
      price: "16,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-012",
      description: "Colis express - Médicaments"
    },
    {
      id: "COL013",
      shipper: "Ahmed Mohamed",
      destination: "159 Rue de la Paix, 14000 Kairouan",
      status: "En cours",
      weight: "2.3 kg",
      dateCreated: "2024-01-05",
      estimatedDelivery: "2024-01-10",
      price: "23,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-013",
      description: "Colis standard - Alimentation"
    },
    {
      id: "COL014",
      shipper: "Ahmed Mohamed",
      destination: "357 Avenue des Arts, 15000 Kasserine",
      status: "En cours",
      weight: "1.7 kg",
      dateCreated: "2024-01-04",
      estimatedDelivery: "2024-01-09",
      price: "17,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-014",
      description: "Colis fragile - Art"
    },
    {
      id: "COL015",
      shipper: "Ahmed Mohamed",
      destination: "486 Rue du Sport, 16000 Gafsa",
      status: "En cours",
      weight: "2.9 kg",
      dateCreated: "2024-01-03",
      estimatedDelivery: "2024-01-08",
      price: "29,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-015",
      description: "Colis lourd - Équipement sportif"
    },
    {
      id: "COL016",
      shipper: "Ahmed Mohamed",
      destination: "753 Boulevard de la Mer, 17000 Tozeur",
      status: "RTN dépôt",
      weight: "1.4 kg",
      dateCreated: "2024-01-02",
      estimatedDelivery: "2024-01-07",
      price: "14,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-016",
      description: "Colis retour - Adresse incorrecte"
    },
    {
      id: "COL017",
      shipper: "Ahmed Mohamed",
      destination: "951 Rue de la Montagne, 18000 Kébili",
      status: "RTN dépôt",
      weight: "2.6 kg",
      dateCreated: "2024-01-01",
      estimatedDelivery: "2024-01-06",
      price: "26,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-017",
      description: "Colis retour - Destinataire absent"
    },
    {
      id: "COL018",
      shipper: "Ahmed Mohamed",
      destination: "264 Avenue du Désert, 19000 Jendouba",
      status: "RTN dépôt",
      weight: "1.8 kg",
      dateCreated: "2023-12-31",
      estimatedDelivery: "2024-01-05",
      price: "18,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-018",
      description: "Colis retour - Refusé"
    },
    {
      id: "COL019",
      shipper: "Ahmed Mohamed",
      destination: "837 Rue de la Forêt, 20000 Béja",
      status: "Livrés",
      weight: "2.2 kg",
      dateCreated: "2023-12-30",
      estimatedDelivery: "2024-01-04",
      price: "22,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-019",
      description: "Colis livré avec succès"
    },
    {
      id: "COL020",
      shipper: "Ahmed Mohamed",
      destination: "648 Boulevard du Lac, 21000 Ben Arous",
      status: "Livrés",
      weight: "3.1 kg",
      dateCreated: "2023-12-29",
      estimatedDelivery: "2024-01-03",
      price: "31,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-020",
      description: "Colis livré avec succès"
    },
    {
      id: "COL021",
      shipper: "Ahmed Mohamed",
      destination: "429 Rue de la Plage, 22000 Manouba",
      status: "Livrés",
      weight: "1.9 kg",
      dateCreated: "2023-12-28",
      estimatedDelivery: "2024-01-02",
      price: "19,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-021",
      description: "Colis livré avec succès"
    },
    {
      id: "COL022",
      shipper: "Ahmed Mohamed",
      destination: "573 Avenue du Centre, 23000 Ariana",
      status: "Livrés payés",
      weight: "2.4 kg",
      dateCreated: "2023-12-27",
      estimatedDelivery: "2024-01-01",
      price: "24,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-022",
      description: "Colis livré et payé"
    },
    {
      id: "COL023",
      shipper: "Ahmed Mohamed",
      destination: "816 Rue de la Ville, 24000 Mahdia",
      status: "Livrés payés",
      weight: "1.6 kg",
      dateCreated: "2023-12-26",
      estimatedDelivery: "2023-12-31",
      price: "16,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-023",
      description: "Colis livré et payé"
    },
    {
      id: "COL024",
      shipper: "Ahmed Mohamed",
      destination: "295 Boulevard de la Côte, 25000 Monastir",
      status: "Livrés payés",
      weight: "2.7 kg",
      dateCreated: "2023-12-25",
      estimatedDelivery: "2023-12-30",
      price: "27,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-024",
      description: "Colis livré et payé"
    },
    {
      id: "COL025",
      shipper: "Ahmed Mohamed",
      destination: "738 Rue de la Vallée, 26000 Sidi Bouzid",
      status: "Retour définitif",
      weight: "1.3 kg",
      dateCreated: "2023-12-24",
      estimatedDelivery: "2023-12-29",
      price: "13,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-025",
      description: "Colis retour définitif"
    },
    {
      id: "COL026",
      shipper: "Ahmed Mohamed",
      destination: "147 Avenue du Soleil, 27000 Sfax",
      status: "Retour définitif",
      weight: "2.8 kg",
      dateCreated: "2023-12-23",
      estimatedDelivery: "2023-12-28",
      price: "28,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-026",
      description: "Colis retour définitif"
    },
    {
      id: "COL027",
      shipper: "Ahmed Mohamed",
      destination: "369 Rue de la Lune, 28000 Gabès",
      status: "Retour définitif",
      weight: "1.5 kg",
      dateCreated: "2023-12-22",
      estimatedDelivery: "2023-12-27",
      price: "15,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-027",
      description: "Colis retour définitif"
    },
    {
      id: "COL028",
      shipper: "Ahmed Mohamed",
      destination: "582 Boulevard de l'Étoile, 29000 Gafsa",
      status: "RTN client agence",
      weight: "2.1 kg",
      dateCreated: "2023-12-21",
      estimatedDelivery: "2023-12-26",
      price: "21,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-028",
      description: "Retour à l'agence client"
    },
    {
      id: "COL029",
      shipper: "Ahmed Mohamed",
      destination: "794 Rue de la Planète, 30000 Kairouan",
      status: "RTN client agence",
      weight: "1.7 kg",
      dateCreated: "2023-12-20",
      estimatedDelivery: "2023-12-25",
      price: "17,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-029",
      description: "Retour à l'agence client"
    },
    {
      id: "COL030",
      shipper: "Ahmed Mohamed",
      destination: "916 Avenue de la Galaxie, 31000 Kasserine",
      status: "RTN client agence",
      weight: "3.3 kg",
      dateCreated: "2023-12-19",
      estimatedDelivery: "2023-12-24",
      price: "33,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-030",
      description: "Retour à l'agence client"
    },
    {
      id: "COL031",
      shipper: "Ahmed Mohamed",
      destination: "258 Rue de l'Univers, 32000 Le Kef",
      status: "Retour Expéditeur",
      weight: "1.9 kg",
      dateCreated: "2023-12-18",
      estimatedDelivery: "2023-12-23",
      price: "19,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-031",
      description: "Retour vers l'expéditeur"
    },
    {
      id: "COL032",
      shipper: "Ahmed Mohamed",
      destination: "471 Boulevard du Cosmos, 33000 Siliana",
      status: "Retour Expéditeur",
      weight: "2.5 kg",
      dateCreated: "2023-12-17",
      estimatedDelivery: "2023-12-22",
      price: "25,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-032",
      description: "Retour vers l'expéditeur"
    },
    {
      id: "COL033",
      shipper: "Ahmed Mohamed",
      destination: "683 Avenue de l'Infini, 34000 Zaghouan",
      status: "Retour Expéditeur",
      weight: "1.8 kg",
      dateCreated: "2023-12-16",
      estimatedDelivery: "2023-12-21",
      price: "18,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-033",
      description: "Retour vers l'expéditeur"
    },
    {
      id: "COL034",
      shipper: "Ahmed Mohamed",
      destination: "895 Rue de l'Éternité, 35000 Béja",
      status: "Retour En Cours d'expédition",
      weight: "2.2 kg",
      dateCreated: "2023-12-15",
      estimatedDelivery: "2023-12-20",
      price: "22,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-034",
      description: "Retour en cours d'expédition"
    },
    {
      id: "COL035",
      shipper: "Ahmed Mohamed",
      destination: "127 Boulevard de l'Immortalité, 36000 Jendouba",
      status: "Retour En Cours d'expédition",
      weight: "1.4 kg",
      dateCreated: "2023-12-14",
      estimatedDelivery: "2023-12-19",
      price: "14,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-035",
      description: "Retour en cours d'expédition"
    },
    {
      id: "COL036",
      shipper: "Ahmed Mohamed",
      destination: "349 Avenue de la Vie, 37000 Kébili",
      status: "Retour En Cours d'expédition",
      weight: "2.9 kg",
      dateCreated: "2023-12-13",
      estimatedDelivery: "2023-12-18",
      price: "29,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-036",
      description: "Retour en cours d'expédition"
    },
    {
      id: "COL037",
      shipper: "Ahmed Mohamed",
      destination: "561 Rue de la Mort, 38000 Tataouine",
      status: "Retour reçu",
      weight: "1.6 kg",
      dateCreated: "2023-12-12",
      estimatedDelivery: "2023-12-17",
      price: "16,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-037",
      description: "Retour reçu par l'expéditeur"
    },
    {
      id: "COL038",
      shipper: "Ahmed Mohamed",
      destination: "783 Boulevard de la Résurrection, 39000 Tozeur",
      status: "Retour reçu",
      weight: "2.3 kg",
      dateCreated: "2023-12-11",
      estimatedDelivery: "2023-12-16",
      price: "23,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-038",
      description: "Retour reçu par l'expéditeur"
    },
    {
      id: "COL039",
      shipper: "Ahmed Mohamed",
      destination: "995 Avenue de la Renaissance, 40000 Médenine",
      status: "Retour reçu",
      weight: "1.7 kg",
      dateCreated: "2023-12-10",
      estimatedDelivery: "2023-12-15",
      price: "17,00 €",
      phone: "+216 71 234 567",
      email: "ahmed.mohamed@email.com",
      reference: "REF-039",
      description: "Retour reçu par l'expéditeur"
    }
  ];
  const createParcelMutation = useCreateParcel();
  const updateParcelMutation = useUpdateParcel();
  const deleteParcelMutation = useDeleteParcel();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    shipper: "",
    destination: "",
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, status: null, parcels: [] });
  const [factureColis, setFactureColis] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [parcelsPerPage] = useState(10);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const statusOptions = [
    "En attente",
    "À enlever",
    "Enlevé",
    "Au dépôt",
    "En cours",
    "RTN dépôt",
    "Livrés",
    "Livrés payés",
    "Retour définitif",
    "RTN client agence",
    "Retour Expéditeur",
    "Retour En Cours d'expédition",
    "Retour reçu",
  ];

  const statusColors = {
    "En attente": "bg-yellow-100 text-yellow-800",
    "À enlever": "bg-orange-100 text-orange-800",
    "Enlevé": "bg-blue-100 text-blue-800",
    "Au dépôt": "bg-indigo-100 text-indigo-800",
    "En cours": "bg-purple-100 text-purple-800",
    "RTN dépôt": "bg-pink-100 text-pink-800",
    "Livrés": "bg-green-100 text-green-800",
    "Livrés payés": "bg-emerald-100 text-emerald-800",
    "Retour définitif": "bg-red-100 text-red-800",
    "RTN client agence": "bg-rose-100 text-rose-800",
    "Retour Expéditeur": "bg-gray-100 text-gray-800",
    "Retour En Cours d'expédition": "bg-violet-100 text-violet-800",
    "Retour reçu": "bg-cyan-100 text-cyan-800",
  };

  const columns = [
    { key: "id", header: "N° Colis" },
    { key: "shipper", header: "Expéditeur" },
    { key: "destination", header: "Destination" },
    {
      key: "status",
      header: "Statut",
      render: (value) => {
            const statusColors = {
      "En attente": "bg-yellow-100 text-yellow-800",
      "À enlever": "bg-orange-100 text-orange-800",
      "Enlevé": "bg-blue-100 text-blue-800",
      "Au dépôt": "bg-indigo-100 text-indigo-800",
      "En cours": "bg-purple-100 text-purple-800",
      "RTN dépôt": "bg-pink-100 text-pink-800",
      "Livrés": "bg-green-100 text-green-800",
      "Livrés payés": "bg-emerald-100 text-emerald-800",
      "Retour définitif": "bg-red-100 text-red-800",
      "RTN client agence": "bg-rose-100 text-rose-800",
      "Retour Expéditeur": "bg-gray-100 text-gray-800",
      "Retour En Cours d'expédition": "bg-violet-100 text-violet-800",
      "Retour reçu": "bg-cyan-100 text-cyan-800",
    };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[value] || "bg-gray-100 text-gray-800"}`}>
            {value}
          </span>
        );
      },
    },
    { key: "weight", header: "Poids" },
    { key: "dateCreated", header: "Date de création" },
    { key: "estimatedDelivery", header: "Date de livraison estimée" },
    { key: "price", header: "Prix" },
  ];

  // Memoized filtered data for better performance
  const filteredParcels = useMemo(() => {
    // Use mock data instead of API data for now
    const dataToUse = mockParcelsData;
    
    return dataToUse.filter((parcel) => {
      // Recherche simple
      const matchesSearch = searchTerm === "" || 
        Object.values(parcel).some(value =>
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Filtres avancés
      const matchesStatus = advancedFilters.status === "" || parcel.status === advancedFilters.status;
      const matchesShipper = advancedFilters.shipper === "" || 
        parcel.shipper.toLowerCase().includes(advancedFilters.shipper.toLowerCase());
      const matchesDestination = advancedFilters.destination === "" || 
        parcel.destination.toLowerCase().includes(advancedFilters.destination.toLowerCase());
      
      const matchesDateFrom = advancedFilters.dateFrom === "" || 
        new Date(parcel.dateCreated) >= new Date(advancedFilters.dateFrom);
      const matchesDateTo = advancedFilters.dateTo === "" || 
        new Date(parcel.dateCreated) <= new Date(advancedFilters.dateTo);

      return matchesSearch && matchesStatus && matchesShipper && 
             matchesDestination && matchesDateFrom && matchesDateTo;
    });
  }, [searchTerm, advancedFilters]);

  // Pagination logic
  const indexOfLastParcel = currentPage * parcelsPerPage;
  const indexOfFirstParcel = indexOfLastParcel - parcelsPerPage;
  const currentParcels = filteredParcels.slice(indexOfFirstParcel, indexOfLastParcel);
  const totalPages = Math.ceil(filteredParcels.length / parcelsPerPage);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, advancedFilters]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate detailed statistics for each status
  const statusStatistics = {
    "En attente": filteredParcels.filter(p => p.status === "En attente").length,
    "À enlever": filteredParcels.filter(p => p.status === "À enlever").length,
    "Enlevé": filteredParcels.filter(p => p.status === "Enlevé").length,
    "Au dépôt": filteredParcels.filter(p => p.status === "Au dépôt").length,
    "En cours": filteredParcels.filter(p => p.status === "En cours").length,
    "RTN dépôt": filteredParcels.filter(p => p.status === "RTN dépôt").length,
    "Livrés": filteredParcels.filter(p => p.status === "Livrés").length,
    "Livrés payés": filteredParcels.filter(p => p.status === "Livrés payés").length,
    "Retour définitif": filteredParcels.filter(p => p.status === "Retour définitif").length,
    "RTN client agence": filteredParcels.filter(p => p.status === "RTN client agence").length,
    "Retour Expéditeur": filteredParcels.filter(p => p.status === "Retour Expéditeur").length,
    "Retour En Cours d'expédition": filteredParcels.filter(p => p.status === "Retour En Cours d'expédition").length,
    "Retour reçu": filteredParcels.filter(p => p.status === "Retour reçu").length,
  };

  const totalParcels = filteredParcels.length;

  const handleAdd = () => {
    setEditingParcel(null);
    reset();
    setIsModalOpen(true);
  };

  const handleEdit = (parcel) => {
    setEditingParcel(parcel);
    reset(parcel);
    setIsModalOpen(true);
  };

  const handleDelete = (parcel) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce colis ?")) {
      deleteParcelMutation.mutate(parcel.id);
    }
  };

  const onSubmit = (formData) => {
    if (editingParcel) {
      updateParcelMutation.mutate({ id: editingParcel.id, updates: formData });
    } else {
      createParcelMutation.mutate(formData);
    }
    setIsModalOpen(false);
  };

  const handleAdvancedFilterChange = (e) => {
    const { name, value } = e.target;
    setAdvancedFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRowClick = (parcel) => {
    setSelectedParcel(selectedParcel?.id === parcel.id ? null : parcel);
  };

  const handleStatusCardClick = (status) => {
    const parcelsInStatus = filteredParcels.filter(p => p.status === status);
    setStatusModal({ open: true, status, parcels: parcelsInStatus });
  };

  const handleViewInvoice = (parcel) => {
    setFactureColis(parcel);
  };

  // Données mock pour le bon de livraison (à remplacer par les vraies données si dispo)
  const getBonLivraisonData = (parcel) => ({
    colis: {
      code: parcel.id,
      nom: parcel.description || "Colis démo",
      adresse: parcel.destination,
      poids: parcel.weight,
    },
    expediteur: {
      nom: "Bon Prix Sousse",
      adresse: "sousse",
      tel: "23814555",
      nif: "1678798WNM000",
    },
    destinataire: {
      nom: parcel.shipper,
      adresse: parcel.destination,
      tel: parcel.phone,
    },
    route: "Sousse >> ---- Dispatch ---- >> Mednine",
    date: new Date().toISOString().split('T')[0],
    docNumber: parcel.id,
    instructions: "Burkini noir flowers 34 ????? ?????? ??????",
    montant: parcel.price,
    tva: "0.471 DT",
    quantite: 1,
    designation: "Coli",
    pageCount: 2,
    pageIndex: 1,
  });

  const exportToExcel = () => {
    if (!statusModal.parcels.length) return;
    
    const worksheet = XLSX.utils.json_to_sheet(statusModal.parcels.map(p => ({
      'N° Colis': p.id,
      'Expéditeur': p.shipper,
      'Destination': p.destination,
      'Statut': p.status,
      'Poids': p.weight,
      'Date de création': p.dateCreated,
      'Date de livraison estimée': p.estimatedDelivery,
      'Prix': p.price,
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Colis_${statusModal.status}`);
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `colis_${statusModal.status}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Colis</h1>
          <p className="text-gray-600">Suivez et gérez vos colis</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-semibold">Nouveau Colis</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-blue-600">{totalParcels}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("En attente")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">En attente</p>
              <p className="text-xl font-bold text-yellow-600">{statusStatistics["En attente"]}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("À enlever")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">À enlever</p>
              <p className="text-xl font-bold text-orange-600">{statusStatistics["À enlever"]}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("Enlevé")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Enlevé</p>
              <p className="text-xl font-bold text-blue-600">{statusStatistics["Enlevé"]}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("Au dépôt")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Au dépôt</p>
              <p className="text-xl font-bold text-indigo-600">{statusStatistics["Au dépôt"]}</p>
            </div>
            <div className="p-2 bg-indigo-100 rounded-full">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("En cours")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">En cours</p>
              <p className="text-xl font-bold text-purple-600">{statusStatistics["En cours"]}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("RTN dépôt")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">RTN dépôt</p>
              <p className="text-xl font-bold text-pink-600">{statusStatistics["RTN dépôt"]}</p>
            </div>
            <div className="p-2 bg-pink-100 rounded-full">
              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("Livrés")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Livrés</p>
              <p className="text-xl font-bold text-green-600">{statusStatistics["Livrés"]}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("Livrés payés")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Livrés payés</p>
              <p className="text-xl font-bold text-emerald-600">{statusStatistics["Livrés payés"]}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-full">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("Retour définitif")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Retour définitif</p>
              <p className="text-xl font-bold text-red-600">{statusStatistics["Retour définitif"]}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-full">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("RTN client agence")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">RTN client agence</p>
              <p className="text-xl font-bold text-rose-600">{statusStatistics["RTN client agence"]}</p>
            </div>
            <div className="p-2 bg-rose-100 rounded-full">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("Retour Expéditeur")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Retour Expéditeur</p>
              <p className="text-xl font-bold text-gray-600">{statusStatistics["Retour Expéditeur"]}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("Retour En Cours d'expédition")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Retour En Cours</p>
              <p className="text-xl font-bold text-violet-600">{statusStatistics["Retour En Cours d'expédition"]}</p>
            </div>
            <div className="p-2 bg-violet-100 rounded-full">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleStatusCardClick("Retour reçu")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Retour reçu</p>
              <p className="text-xl font-bold text-cyan-600">{statusStatistics["Retour reçu"]}</p>
            </div>
            <div className="p-2 bg-cyan-100 rounded-full">
              <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recherche avancée</h3>
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showAdvancedSearch ? "Masquer" : "Afficher"}
          </button>
        </div>
        
        {showAdvancedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <select
              name="status"
              value={advancedFilters.status}
              onChange={handleAdvancedFilterChange}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            
            <input
              type="date"
              name="dateFrom"
              value={advancedFilters.dateFrom}
              onChange={handleAdvancedFilterChange}
              placeholder="Date de début"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="date"
              name="dateTo"
              value={advancedFilters.dateTo}
              onChange={handleAdvancedFilterChange}
              placeholder="Date de fin"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="text"
              name="shipper"
              value={advancedFilters.shipper}
              onChange={handleAdvancedFilterChange}
              placeholder="Expéditeur"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            
            <input
              type="text"
              name="destination"
              value={advancedFilters.destination}
              onChange={handleAdvancedFilterChange}
              placeholder="Destination"
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={currentParcels}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {indexOfFirstParcel + 1} à {Math.min(indexOfLastParcel, filteredParcels.length)} sur {filteredParcels.length} colis
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parcel Details */}
      {selectedParcel && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Détails du colis {selectedParcel.id}</h3>
            <button
              onClick={() => setSelectedParcel(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <ColisTimeline parcel={selectedParcel} />
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingParcel ? "Modifier le colis" : "Ajouter un colis"}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expéditeur
                </label>
                <input
                  {...register("shipper", { required: "L'expéditeur est requis" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.shipper && (
                  <p className="text-red-500 text-sm mt-1">{errors.shipper.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  {...register("destination", { required: "La destination est requise" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.destination && (
                  <p className="text-red-500 text-sm mt-1">{errors.destination.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poids
                </label>
                <input
                  {...register("weight", { required: "Le poids est requis" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.weight && (
                  <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de livraison estimée
                </label>
                <input
                  type="date"
                  {...register("estimatedDelivery", { required: "La date de livraison est requise" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.estimatedDelivery && (
                  <p className="text-red-500 text-sm mt-1">{errors.estimatedDelivery.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix
                </label>
                <input
                  {...register("price", { required: "Le prix est requis" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  {...register("status", { required: "Le statut est requis" })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createParcelMutation.isPending || updateParcelMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createParcelMutation.isPending || updateParcelMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} size="full">
        <div className="p-0">
        <ColisCreate onClose={() => setIsCreateModalOpen(false)} />
        </div>
      </Modal>

      {/* Status Details Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, status: null, parcels: [] })}
        title={`Colis - ${statusModal.status}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Exporter en Excel
            </button>
            <button
              onClick={() => setStatusModal({ open: false, status: null, parcels: [] })}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Fermer
            </button>
          </div>

          {/* Parcels Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Colis</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expéditeur</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Poids</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date de création</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statusModal.parcels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Aucun colis pour ce statut
                    </td>
                  </tr>
                ) : (
                  statusModal.parcels.map((parcel) => (
                    <tr key={parcel.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {parcel.id}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {parcel.shipper}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {parcel.destination}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {parcel.weight}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {parcel.dateCreated}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {parcel.price}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleRowClick(parcel)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Voir les détails"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleViewInvoice(parcel)}
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                            title="Voir la facture"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Bon de Livraison Modal */}
      <Modal
        isOpen={!!factureColis}
        onClose={() => setFactureColis(null)}
        title="Bon de Livraison"
        size="xl"
      >
        {factureColis && (
          <BonLivraisonColis {...getBonLivraisonData(factureColis)} />
        )}
      </Modal>
    </div>
  );
};

export default ColisClient; 