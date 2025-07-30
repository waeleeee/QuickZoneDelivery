import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import DeliveryChart from "../charts/DeliveryChart";
import GeoChart from "../charts/GeoChart";
import StatusChart from "../charts/StatusChart";
import ColisCreate from "./ColisCreate";
import Expediteur from "./Expediteur";
import PaimentExpediteur from "./PaimentExpediteur";
import Reclamation from "./Reclamation";
import CommercialPayments from "./CommercialPayments";
import CommercialComplaints from "./CommercialComplaints";
import { apiService } from "../../services/api";

const DashboardHome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [roleSpecificStats, setRoleSpecificStats] = useState({});
  const [expediteurStats, setExpediteurStats] = useState(null);
  const [expediteurChartData, setExpediteurChartData] = useState(null);
  const [adminChartData, setAdminChartData] = useState(null);
  const [chefAgenceStats, setChefAgenceStats] = useState(null);
  const [commercialStats, setCommercialStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paidParcels, setPaidParcels] = useState([]);
  
  // Modal states
  const [showNewParcelModal, setShowNewParcelModal] = useState(false);
  const [showColisCreateModal, setShowColisCreateModal] = useState(false);
  const [showTrackParcelModal, setShowTrackParcelModal] = useState(false);
  const [showPaymentsModal, setShowPaymentsModal] = useState(false);
  const [showExpediteurModal, setShowExpediteurModal] = useState(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);
  const [showPaymentsManagementModal, setShowPaymentsManagementModal] = useState(false);
  const [showCommercialPaymentsModal, setShowCommercialPaymentsModal] = useState(false);
  const [showCommercialComplaintsModal, setShowCommercialComplaintsModal] = useState(false);
  
  // Track parcel states
  const [trackingNumber, setTrackingNumber] = useState('');
  const [parcelData, setParcelData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    console.log('🔍 Dashboard - Current user from localStorage:', user);
    setCurrentUser(user);
    
    // Generate role-specific statistics
    if (user && user.role) {
      console.log('🔍 Dashboard - User role:', user.role);
      console.log('🔍 Dashboard - User email:', user.email);
      generateRoleSpecificStats(user.role);
      
      // Fetch real data for expéditeurs
      if (user.role === 'Expéditeur' && user.email) {
        console.log('🔍 Dashboard - Fetching expediteur stats for:', user.email);
        fetchExpediteurStats(user.email);
        fetchExpediteurChartData(user.email);
      } else if (user.role === 'Administration' || user.role === 'Admin') {
        console.log('🔍 Dashboard - Fetching admin chart data');
        fetchAdminChartData();
      } else if (user.role === 'Chef d\'agence') {
        console.log('🔍 Dashboard - Fetching chef d\'agence stats');
        fetchChefAgenceStats(user.email);
      } else if (user.role === 'Commercial') {
        console.log('🔍 Dashboard - Fetching commercial stats');
        fetchCommercialStats(user.email);
      } else {
        console.log('🔍 Dashboard - No specific data fetching for role:', user.role);
        setLoading(false);
      }
    } else {
      console.log('🔍 Dashboard - No user or role found');
      setLoading(false);
    }
  }, []);

  // Regenerate stats when expediteurStats, adminChartData, chefAgenceStats, or commercialStats changes
  useEffect(() => {
    if (currentUser && currentUser.role) {
      generateRoleSpecificStats(currentUser.role);
    }
  }, [expediteurStats, adminChartData, chefAgenceStats, commercialStats, currentUser]);

  const fetchAdminChartData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdminDashboard();
      if (data && data.success && data.data) {
        setAdminChartData(data.data);
      } else {
        // Create sample admin chart data
        setAdminChartData({
          deliveryHistory: generateSampleDeliveryHistory(),
          geographicalData: generateSampleGeographicalData(),
          statusStats: generateSampleStatusStats()
        });
      }
    } catch (error) {
      console.error('Error fetching admin chart data:', error);
      // Create sample admin chart data as fallback
      setAdminChartData({
        deliveryHistory: generateSampleDeliveryHistory(),
        geographicalData: generateSampleGeographicalData(),
        statusStats: generateSampleStatusStats()
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSampleDeliveryHistory = () => {
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      history.push({
        date: date.toISOString().split('T')[0],
        delivered: Math.floor(Math.random() * 20) + 10 // Random 10-30 deliveries
      });
    }
    return history;
  };

  const generateSampleGeographicalData = () => {
    const regions = ['Tunis', 'Sousse', 'Sfax', 'Mahdia', 'Monastir', 'Gabès', 'Gafsa', 'Kairouan'];
    return regions.map(region => ({
      region: region,
      count: Math.floor(Math.random() * 50) + 10 // Random 10-60 parcels
    }));
  };

  const generateSampleStatusStats = () => {
    return {
      'En attente': Math.floor(Math.random() * 50) + 20,
      'À enlever': Math.floor(Math.random() * 30) + 10,
      'Enlevé': Math.floor(Math.random() * 40) + 15,
      'Au dépôt': Math.floor(Math.random() * 60) + 25,
      'En cours': Math.floor(Math.random() * 80) + 40,
      'Livrés': Math.floor(Math.random() * 100) + 60,
      'Livrés payés': Math.floor(Math.random() * 80) + 50,
      'Retour définitif': Math.floor(Math.random() * 10) + 5
    };
  };

  const fetchExpediteurStats = async (email) => {
    try {
      console.log('🔍 fetchExpediteurStats - Starting with email:', email);
      setLoading(true);
      const stats = await apiService.getExpediteurStats(email);
      console.log('✅ fetchExpediteurStats - Success:', stats);
      setExpediteurStats(stats);
    } catch (error) {
      console.error('❌ fetchExpediteurStats - Error:', error);
      console.error('❌ fetchExpediteurStats - Error details:', error.response?.data);
      setExpediteurStats({
        totalParcels: 0,
        totalRevenue: 0,
        currentMonth: 0,
        deliveredThisMonth: 0,
        inTransit: 0,
        complaintsCount: 0,
        monthlyChanges: { parcels: 0, delivered: 0 },
        statusStats: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchExpediteurChartData = async (email) => {
    try {
      console.log('🔍 fetchExpediteurChartData - Starting with email:', email);
      const chartData = await apiService.getExpediteurChartData(email);
      console.log('✅ fetchExpediteurChartData - Success:', chartData);
      
      // Check if we have real data with actual values
      const hasRealData = chartData && 
        chartData.deliveryHistory && 
        chartData.deliveryHistory.length > 0 && 
        chartData.deliveryHistory.some(item => item.delivered > 0);
      
      if (hasRealData) {
        console.log('✅ Using real chart data');
        setExpediteurChartData(chartData);
      } else {
        console.log('📊 No real data available, using empty charts');
        setExpediteurChartData({
          deliveryHistory: [],
          geographicalData: []
        });
      }
    } catch (error) {
      console.error('❌ fetchExpediteurChartData - Error:', error);
      console.log('📊 Error occurred, using empty charts');
      setExpediteurChartData({
        deliveryHistory: [],
        geographicalData: []
      });
    }
  };

  const fetchChefAgenceStats = async (email) => {
    try {
      console.log('🔍 fetchChefAgenceStats - Starting with email:', email);
      setLoading(true);
      
      // Get agency manager data
      const agencyManagers = await apiService.getAgencyManagers();
      const agencyManager = agencyManagers.find(am => am.email === email);
      
      if (!agencyManager) {
        console.error('❌ Agency manager not found for email:', email);
        setChefAgenceStats(null);
        setLoading(false);
        return;
      }
      
      console.log('🔍 Agency manager found:', agencyManager);
      
      // Get all users in the agency
      const allUsers = [];
      
      // Fetch agency managers
      const agencyManagersInAgency = agencyManagers.filter(am => am.governorate === agencyManager.governorate);
      agencyManagersInAgency.forEach(am => {
        allUsers.push({ role: 'Chef d\'agence', created_at: am.created_at });
      });
      
      // Fetch agency members
      const agencyMembers = await apiService.getAgencyMembers();
      const agencyMembersInAgency = agencyMembers.filter(member => member.agency === agencyManager.governorate);
      agencyMembersInAgency.forEach(member => {
        allUsers.push({ role: member.role || 'Membre d\'agence', created_at: member.created_at });
      });
      
      // Fetch drivers
      const drivers = await apiService.getDrivers();
      const driversInAgency = drivers.filter(driver => driver.agency === agencyManager.governorate);
      driversInAgency.forEach(driver => {
        allUsers.push({ role: 'Livreur', created_at: driver.created_at });
      });
      
      // Fetch commercials
      const commercials = await apiService.getCommercials();
      const commercialsInAgency = commercials.filter(commercial => commercial.agency === agencyManager.governorate);
      commercialsInAgency.forEach(commercial => {
        allUsers.push({ role: 'Commercial', created_at: commercial.created_at });
      });
      
      // Fetch shippers (expéditeurs)
      const shippers = await apiService.getShippers();
      const shippersInAgency = shippers.filter(shipper => shipper.agency === agencyManager.governorate);
      shippersInAgency.forEach(shipper => {
        allUsers.push({ role: 'Expéditeur', created_at: shipper.created_at });
      });
      
      // Get parcels for the agency
      const parcels = await apiService.getParcels();
      const agencyParcels = parcels.filter(parcel => {
        const shipper = shippersInAgency.find(s => s.id === parcel.shipper_id);
        return shipper || shippersInAgency.some(s => 
          s.name === parcel.shipper_name || s.code === parcel.shipper_code
        );
      });
      
      // Calculate statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      // Team members growth
      const currentMonthUsers = allUsers.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      });
      
      const lastMonthUsers = allUsers.filter(user => {
        const userDate = new Date(user.created_at);
        return userDate.getMonth() === lastMonth && userDate.getFullYear() === lastYear;
      });
      
      const teamGrowth = lastMonthUsers.length > 0 
        ? currentMonthUsers.length - lastMonthUsers.length 
        : currentMonthUsers.length;
      
      // Active missions (parcels in transit)
      const activeMissions = agencyParcels.filter(parcel => 
        ['En cours', 'Au dépôt', 'Enlevé'].includes(parcel.status)
      );
      
      const lastMonthMissions = agencyParcels.filter(parcel => {
        const parcelDate = new Date(parcel.created_at);
        return parcelDate.getMonth() === lastMonth && parcelDate.getFullYear() === lastYear;
      });
      
      const missionGrowth = lastMonthMissions.length > 0 
        ? activeMissions.length - lastMonthMissions.length 
        : activeMissions.length;
      
      // Parcels in processing
      const processingParcels = agencyParcels.filter(parcel => 
        ['En attente', 'À enlever', 'Enlevé', 'Au dépôt', 'En cours'].includes(parcel.status)
      );
      
      const lastMonthProcessing = agencyParcels.filter(parcel => {
        const parcelDate = new Date(parcel.created_at);
        return parcelDate.getMonth() === lastMonth && parcelDate.getFullYear() === lastYear;
      });
      
      const processingGrowth = lastMonthProcessing.length > 0 
        ? Math.round(((processingParcels.length - lastMonthProcessing.length) / lastMonthProcessing.length) * 100)
        : processingParcels.length > 0 ? 100 : 0;
      
      // Performance calculation
      const deliveredParcels = agencyParcels.filter(parcel => 
        ['Livrés', 'Livrés payés'].includes(parcel.status)
      );
      
      const performance = agencyParcels.length > 0 
        ? Math.round((deliveredParcels.length / agencyParcels.length) * 100)
        : 0;
      
      const lastMonthDelivered = agencyParcels.filter(parcel => {
        const parcelDate = new Date(parcel.created_at);
        return parcelDate.getMonth() === lastMonth && parcelDate.getFullYear() === lastYear &&
               ['Livrés', 'Livrés payés'].includes(parcel.status);
      });
      
      const performanceGrowth = lastMonthDelivered.length > 0 
        ? Math.round(((deliveredParcels.length - lastMonthDelivered.length) / lastMonthDelivered.length) * 100)
        : deliveredParcels.length > 0 ? 100 : 0;
      
      const stats = {
        teamMembers: allUsers.length,
        teamGrowth: teamGrowth,
        activeMissions: activeMissions.length,
        missionGrowth: missionGrowth,
        processingParcels: processingParcels.length,
        processingGrowth: processingGrowth,
        performance: performance,
        performanceGrowth: performanceGrowth,
        totalParcels: agencyParcels.length,
        deliveredParcels: deliveredParcels.length
      };
      
      console.log('✅ Chef d\'agence stats calculated:', stats);
      setChefAgenceStats(stats);
      
    } catch (error) {
      console.error('❌ fetchChefAgenceStats - Error:', error);
      setChefAgenceStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommercialStats = async (email) => {
    try {
      console.log('🔍 fetchCommercialStats - Starting with email:', email);
      setLoading(true);
      
      // Get commercial data by email
      const commercials = await apiService.getCommercials();
      const commercial = commercials.find(c => c.email === email);
      
      if (!commercial) {
        console.error('❌ Commercial not found for email:', email);
        setCommercialStats(null);
        setLoading(false);
        return;
      }
      
      console.log('🔍 Commercial found:', commercial);
      
      // Get shippers for this commercial
      const shippers = await apiService.getShippers();
      const commercialShippers = shippers.filter(shipper => shipper.commercial_id === commercial.id);
      
      // Get parcels for this commercial's shippers
      const parcels = await apiService.getParcels();
      const commercialParcels = parcels.filter(parcel => {
        return commercialShippers.some(shipper => 
          shipper.id === parcel.shipper_id || 
          shipper.name === parcel.shipper_name ||
          shipper.code === parcel.shipper_code
        );
      });
      
      // Get commercial's own payments (commissions, salaries, bonuses)
      const commercialOwnPayments = await apiService.getCommercialOwnPayments(commercial.id);
      const commercialPayments = commercialOwnPayments.payments || [];
      
      // Get complaints for this commercial's shippers
      const complaints = await apiService.getComplaints(1, 1000, {});
      const commercialComplaints = complaints.complaints ? complaints.complaints.filter(complaint => {
        return commercialShippers.some(shipper => 
          shipper.email === complaint.client_email ||
          shipper.name === complaint.client_name
        );
      }) : [];
      
      // Calculate statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      // Active clients (shippers with recent activity)
      const activeClients = commercialShippers.filter(shipper => {
        const shipperParcels = commercialParcels.filter(p => 
          p.shipper_id === shipper.id || 
          p.shipper_name === shipper.name ||
          p.shipper_code === shipper.code
        );
        return shipperParcels.length > 0;
      });
      
      const lastMonthActiveClients = commercialShippers.filter(shipper => {
        const shipperParcels = commercialParcels.filter(p => {
          const parcelDate = new Date(p.created_at);
          return (p.shipper_id === shipper.id || 
                  p.shipper_name === shipper.name ||
                  p.shipper_code === shipper.code) &&
                 parcelDate.getMonth() === lastMonth && 
                 parcelDate.getFullYear() === lastYear;
        });
        return shipperParcels.length > 0;
      });
      
      const activeClientsGrowth = lastMonthActiveClients.length > 0 
        ? Math.round(((activeClients.length - lastMonthActiveClients.length) / lastMonthActiveClients.length) * 100)
        : activeClients.length;
      
      // Total payments
      const totalPayments = commercialPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
      
      const lastMonthPayments = commercialPayments.filter(payment => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastYear;
      });
      
      const lastMonthTotalPayments = lastMonthPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
      
      const totalPaymentsGrowth = lastMonthTotalPayments > 0 
        ? Math.round(((totalPayments - lastMonthTotalPayments) / lastMonthTotalPayments) * 100)
        : totalPayments > 0 ? 100 : 0;
      
      // Total complaints
      const totalComplaints = commercialComplaints.length;
      
      const lastMonthComplaints = commercialComplaints.filter(complaint => {
        const complaintDate = new Date(complaint.created_at);
        return complaintDate.getMonth() === lastMonth && complaintDate.getFullYear() === lastYear;
      });
      
      const totalComplaintsGrowth = lastMonthComplaints.length > 0 
        ? Math.round(((totalComplaints - lastMonthComplaints.length) / lastMonthComplaints.length) * 100)
        : totalComplaints > 0 ? 100 : 0;
      
      // New clients (shippers created this month)
      const newClients = commercialShippers.filter(shipper => {
        const shipperDate = new Date(shipper.created_at);
        return shipperDate.getMonth() === currentMonth && shipperDate.getFullYear() === currentYear;
      });
      
      const lastMonthNewClients = commercialShippers.filter(shipper => {
        const shipperDate = new Date(shipper.created_at);
        return shipperDate.getMonth() === lastMonth && shipperDate.getFullYear() === lastYear;
      });
      
      const newClientsGrowth = lastMonthNewClients.length > 0 
        ? Math.round(((newClients.length - lastMonthNewClients.length) / lastMonthNewClients.length) * 100)
        : newClients.length > 0 ? 100 : 0;
      
      // Generate chart data for Commercial dashboard
      const chartData = {
        // Client evolution data (last 7 days)
        clientEvolution: generateClientEvolutionData(commercialShippers, commercialParcels),
        // Client distribution by region/governorate
        clientDistribution: generateClientDistributionData(commercialShippers, commercialParcels),
        // Parcel status distribution
        parcelStatusStats: generateParcelStatusStats(commercialShippers, commercialParcels)
      };
      
      console.log('🔍 Commercial chart data:', chartData);
      
      const stats = {
        activeClients: activeClients.length,
        activeClientsGrowth: activeClientsGrowth,
        totalPayments: totalPayments,
        totalPaymentsGrowth: totalPaymentsGrowth,
        totalComplaints: totalComplaints,
        totalComplaintsGrowth: totalComplaintsGrowth,
        newClients: newClients.length,
        newClientsGrowth: newClientsGrowth,
        chartData: chartData
      };
      
      console.log('✅ Commercial stats calculated:', stats);
      setCommercialStats(stats);
      
    } catch (error) {
      console.error('❌ fetchCommercialStats - Error:', error);
      setCommercialStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate client evolution data for Commercial dashboard
  const generateClientEvolutionData = (shippers, parcels) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date);
    }

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      
      // Filter parcels from this Commercial's expediteurs only
      const dayParcels = parcels.filter(parcel => {
        const parcelDate = new Date(parcel.created_at);
        const isFromCommercialExpediteurs = shippers.some(shipper => 
          shipper.id === parcel.shipper_id || 
          shipper.name === parcel.shipper_name ||
          shipper.code === parcel.shipper_code
        );
        return parcelDate.toISOString().split('T')[0] === dateStr && isFromCommercialExpediteurs;
      });
      
      // Count unique expediteurs for this day
      const uniqueExpediteurs = new Set(dayParcels.map(p => p.shipper_id || p.shipper_name || p.shipper_code));
      
      return {
        date: date.toISOString().split('T')[0],
        clients: uniqueExpediteurs.size
      };
    });
  };

  // Generate client distribution data for Commercial dashboard
  const generateClientDistributionData = (shippers, parcels) => {
    const distribution = {};
    
    // Group parcels by governorate/region - ONLY from this Commercial's expediteurs
    parcels.forEach(parcel => {
      // Check if this parcel is from one of the Commercial's expediteurs
      const isFromCommercialExpediteurs = shippers.some(shipper => 
        shipper.id === parcel.shipper_id || 
        shipper.name === parcel.shipper_name ||
        shipper.code === parcel.shipper_code
      );
      
      if (isFromCommercialExpediteurs) {
        const region = parcel.recipient_governorate || parcel.governorate || 'Autre';
        if (!distribution[region]) {
          distribution[region] = 0;
        }
        distribution[region]++;
      }
    });
    
    // Convert to chart format
    return Object.entries(distribution).map(([region, count]) => ({
      region: region,
      count: count
    }));
  };

  // Generate parcel status data for Commercial dashboard
  const generateParcelStatusStats = (shippers, parcels) => {
    console.log('🔍 generateParcelStatusStats - Shippers:', shippers.length, 'Parcels:', parcels.length);
    
    const statusCounts = {};
    
    // Count parcels by status - ONLY from this Commercial's expediteurs
    parcels.forEach(parcel => {
      // Check if this parcel is from one of the Commercial's expediteurs
      const isFromCommercialExpediteurs = shippers.some(shipper => 
        shipper.id === parcel.shipper_id || 
        shipper.name === parcel.shipper_name ||
        shipper.code === parcel.shipper_code
      );
      
      if (isFromCommercialExpediteurs) {
        const status = parcel.status || 'En attente';
        if (!statusCounts[status]) {
          statusCounts[status] = 0;
        }
        statusCounts[status]++;
      }
    });
    
    console.log('🔍 Status counts:', statusCounts);
    
    // Convert to chart format with colors
    const statusColors = {
      'En attente': '#f97316', // Orange
      'À enlever': '#fbbf24', // Yellow
      'Enlevé': '#ea580c', // Dark Orange
      'Au dépôt': '#3b82f6', // Blue
      'En cours': '#8b5cf6', // Purple
      'Livrés': '#10b981', // Teal/Green
      'Livrés payés': '#059669', // Dark Green
      'Retour définitif': '#ef4444' // Red
    };
    
    const result = Object.entries(statusCounts).map(([status, count]) => ({
      status: status,
      count: count,
      color: statusColors[status] || '#6b7280' // Gray as fallback
    }));
    
    console.log('🔍 Final parcel status stats:', result);
    console.log('🔍 Result length:', result.length);
    console.log('🔍 Result content:', JSON.stringify(result, null, 2));
    return result;
  };

  // Function to render professional SVG icons
  const renderIcon = (iconType) => {
    const iconSize = "w-8 h-8";
    
    switch (iconType) {
      case "users":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case "user":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case "package":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case "check":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "business":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "money":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "new":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case "card":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case "clock":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "document":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "chart":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "truck":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM21 13V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H7a2 2 0 01-2-2v-4m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        );
      case "clipboard":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case "warning":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case "trending":
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const generateRoleSpecificStats = (role) => {
    const stats = {
      'Administration': {
        title: "Tableau de Bord",
        subtitle: "Statistiques globales de QuickZone",
        cards: [
          { 
            title: "Total Utilisateurs", 
            value: adminChartData?.keyMetrics?.totalUsers?.toLocaleString() || "0", 
            change: adminChartData?.keyMetrics?.userGrowth ? `${adminChartData.keyMetrics.userGrowth >= 0 ? '+' : ''}${adminChartData.keyMetrics.userGrowth}%` : "0%", 
            color: "blue", 
            icon: "user" 
          },
          { 
            title: "Colis Reçus", 
            value: adminChartData?.keyMetrics?.totalColis?.toLocaleString() || "0", 
            change: adminChartData?.keyMetrics?.parcelGrowth ? `${adminChartData.keyMetrics.parcelGrowth >= 0 ? '+' : ''}${adminChartData.keyMetrics.parcelGrowth}%` : "0%", 
            color: "green", 
            icon: "package" 
          },
          { 
            title: "Colis Livrés", 
            value: adminChartData?.keyMetrics?.livraisonsCompletees?.toLocaleString() || "0", 
            change: adminChartData?.keyMetrics?.deliveryGrowth ? `${adminChartData.keyMetrics.deliveryGrowth >= 0 ? '+' : ''}${adminChartData.keyMetrics.deliveryGrowth}%` : "0%", 
            color: "purple", 
            icon: "check" 
          },
          { 
            title: "Expéditeurs", 
            value: adminChartData?.keyMetrics?.totalShippers?.toLocaleString() || "0", 
            change: adminChartData?.keyMetrics?.shipperGrowth ? `${adminChartData.keyMetrics.shipperGrowth >= 0 ? '+' : ''}${adminChartData.keyMetrics.shipperGrowth}%` : "0%", 
            color: "purple", 
            icon: "business" 
          },
          { 
            title: "Revenus Mensuels", 
            value: adminChartData?.keyMetrics?.monthlyRevenue ? `${adminChartData.keyMetrics.monthlyRevenue.toLocaleString()} DT` : "0 DT", 
            change: adminChartData?.keyMetrics?.revenueGrowth ? `${adminChartData.keyMetrics.revenueGrowth >= 0 ? '+' : ''}${adminChartData.keyMetrics.revenueGrowth}%` : "0%", 
            color: "orange", 
            icon: "money" 
          }
        ]
      },
      'Commercial': {
        title: "Tableau de Bord Commercial",
        subtitle: "Gestion des clients, paiements et réclamations",
        cards: [
          { 
            title: "Clients Actifs", 
            value: commercialStats ? commercialStats.activeClients.toString() : "0", 
            change: commercialStats ? (commercialStats.activeClientsGrowth >= 0 ? `+${commercialStats.activeClientsGrowth}%` : `${commercialStats.activeClientsGrowth}%`) : "0%", 
            color: "blue", 
            icon: "users" 
          },
          { 
            title: "Paiements Reçus", 
            value: commercialStats ? `${commercialStats.totalPayments.toLocaleString()} DT` : "0 DT", 
            change: commercialStats ? (commercialStats.totalPaymentsGrowth >= 0 ? `+${commercialStats.totalPaymentsGrowth}%` : `${commercialStats.totalPaymentsGrowth}%`) : "0%", 
            color: "green", 
            icon: "card" 
          },
          { 
            title: "Réclamations", 
            value: commercialStats ? commercialStats.totalComplaints.toString() : "0", 
            change: commercialStats ? (commercialStats.totalComplaintsGrowth >= 0 ? `+${commercialStats.totalComplaintsGrowth}%` : `${commercialStats.totalComplaintsGrowth}%`) : "0%", 
            color: "orange", 
            icon: "warning" 
          },
          { 
            title: "Nouveaux Clients", 
            value: commercialStats ? commercialStats.newClients.toString() : "0", 
            change: commercialStats ? (commercialStats.newClientsGrowth >= 0 ? `+${commercialStats.newClientsGrowth}%` : `${commercialStats.newClientsGrowth}%`) : "0%", 
            color: "purple", 
            icon: "new" 
          }
        ]
      },
      'Finance': {
        title: "Tableau de Bord Financier",
        subtitle: "Gestion financière et comptabilité",
        cards: [
          { title: "Paiements Reçus", value: "89,450 DT", change: "+14%", color: "green", icon: "card" },
          { title: "Paiements En Attente", value: "12,340 DT", change: "-5%", color: "orange", icon: "clock" },
          { title: "Factures Émises", value: "156", change: "+8%", color: "blue", icon: "document" },
          { title: "Marge Brute", value: "23,450 DT", change: "+22%", color: "purple", icon: "chart" }
        ]
      },
      'Chef d\'agence': {
        title: "Tableau de Bord Opérationnel",
        subtitle: "Gestion de l'agence et des équipes",
        cards: [
          { 
            title: "Membres d'Équipe", 
            value: chefAgenceStats ? chefAgenceStats.teamMembers.toString() : "0", 
            change: chefAgenceStats ? (chefAgenceStats.teamGrowth >= 0 ? `+${chefAgenceStats.teamGrowth}` : `${chefAgenceStats.teamGrowth}`) : "0", 
            color: "blue", 
            icon: "users" 
          },
          { 
            title: "Missions Actives", 
            value: chefAgenceStats ? chefAgenceStats.activeMissions.toString() : "0", 
            change: chefAgenceStats ? (chefAgenceStats.missionGrowth >= 0 ? `+${chefAgenceStats.missionGrowth}` : `${chefAgenceStats.missionGrowth}`) : "0", 
            color: "green", 
            icon: "truck" 
          },
          { 
            title: "Colis en Traitement", 
            value: chefAgenceStats ? chefAgenceStats.processingParcels.toString() : "0", 
            change: chefAgenceStats ? `${chefAgenceStats.processingGrowth >= 0 ? '+' : ''}${chefAgenceStats.processingGrowth}%` : "0%", 
            color: "purple", 
            icon: "package" 
          },
          { 
            title: "Performance", 
            value: chefAgenceStats ? `${chefAgenceStats.performance}%` : "0%", 
            change: chefAgenceStats ? `${chefAgenceStats.performanceGrowth >= 0 ? '+' : ''}${chefAgenceStats.performanceGrowth}%` : "0%", 
            color: "orange", 
            icon: "trending" 
          }
        ]
      },
      'Membre de l\'agence': {
        title: "Tableau de Bord Quotidien",
        subtitle: "Activités et tâches du jour",
        cards: [
          { title: "Colis Traités", value: "45", change: "+5", color: "green", icon: "package" },
          { title: "Tâches en Cours", value: "8", change: "-2", color: "blue", icon: "clipboard" },
          { title: "Réclamations", value: "3", change: "+1", color: "orange", icon: "warning" },
          { title: "Efficacité", value: "87%", change: "+2%", color: "purple", icon: "chart" }
        ]
      },
      'Livreurs': {
        title: "Tableau de Bord Livraison",
        subtitle: "Missions et livraisons du jour",
        cards: [
          { title: "Missions du Jour", value: "12", change: "+2", color: "blue", icon: "truck" },
          { title: "Colis Livrés", value: "34", change: "+8", color: "green", icon: "check" },
          { title: "En Cours", value: "6", change: "-1", color: "orange", icon: "clock" },
          { title: "Performance", value: "96%", change: "+1%", color: "purple", icon: "trending" }
        ]
      },
      'Expéditeur': {
        title: "Tableau de Bord Client",
        subtitle: "Suivi de vos colis et paiements",
        cards: [
          { 
            title: "Mes Colis", 
            value: expediteurStats ? expediteurStats.totalParcels.toString() : "0", 
            change: expediteurStats ? (expediteurStats.monthlyChanges.parcels >= 0 ? `+${expediteurStats.monthlyChanges.parcels}` : `${expediteurStats.monthlyChanges.parcels}`) : "0", 
            color: "blue", 
            icon: "package" 
          },
          { 
            title: "Livrés", 
            value: expediteurStats ? (expediteurStats.statusStats?.['Livrés'] || 0).toString() : "0", 
            change: expediteurStats ? (expediteurStats.monthlyChanges.delivered >= 0 ? `+${expediteurStats.monthlyChanges.delivered}` : `${expediteurStats.monthlyChanges.delivered}`) : "0", 
            color: "green", 
            icon: "check" 
          },
          { 
            title: "Livrés payés", 
            value: expediteurStats ? (expediteurStats.statusStats?.['Livrés payés'] || 0).toString() : "0", 
            change: "0", 
            color: "purple", 
            icon: "card" 
          },
          { 
            title: "Solde", 
            value: expediteurStats ? `${expediteurStats.balance?.toFixed(2) || '0.00'} DT` : "0.00 DT", 
            change: "", 
            color: "orange", 
            icon: "money" 
          },
          { 
            title: "Réclamations", 
            value: expediteurStats ? expediteurStats.complaintsCount.toString() : "0", 
            change: "0", 
            color: "red", 
            icon: "warning" 
          }
        ]
      }
    };

    setRoleSpecificStats(stats[role] || stats['Administration']);
  };

  const getCardColorClasses = (color) => {
    const colors = {
      blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
      green: "bg-gradient-to-br from-green-500 to-green-600 text-white",
      purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
      orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
      red: "bg-gradient-to-br from-red-500 to-red-600 text-white"
    };
    return colors[color] || colors.blue;
  };

  // Quick action functions
  const handleNewParcel = () => {
    setShowColisCreateModal(true);
  };

  const handleTrackParcel = () => {
    setShowTrackParcelModal(true);
  };

  const handlePayments = async () => {
    try {
      if (currentUser && currentUser.email) {
        // Fetch paid parcels (Livrés payés)
        const response = await apiService.getExpediteurParcels(currentUser.email);
        const paidParcelsList = response.filter(parcel => parcel.status === 'Livrés payés');
        setPaidParcels(paidParcelsList);
      }
    } catch (error) {
      console.error('Error fetching paid parcels:', error);
      setPaidParcels([]);
    }
    setShowPaymentsModal(true);
  };

  // Commercial user action functions
  const handleNewClient = () => {
    // For Commercial users, directly open the expediteur form
    if (currentUser?.role === 'Commercial') {
      setShowExpediteurModal(true);
    } else {
      // For other users, show expediteur management in a compact modal
      setShowExpediteurModal(true);
    }
  };

  const handleManagePayments = () => {
    // For Commercial users, show their own payments
    if (currentUser?.role === 'Commercial') {
      setShowCommercialPaymentsModal(true);
    } else {
      // For other users, show payments management in a compact modal
      setShowPaymentsManagementModal(true);
    }
  };

  const handleManageComplaints = () => {
    // For Commercial users, show their own complaints
    if (currentUser?.role === 'Commercial') {
      setShowCommercialComplaintsModal(true);
    } else {
      // For other users, show complaints management in a compact modal
      setShowComplaintsModal(true);
    }
  };

  // Admin/Default user action functions
  const handleNewParcelAdmin = () => {
    setShowColisCreateModal(true);
  };

  const handleNewExpediteur = () => {
    setShowExpediteurModal(true);
  };

  const handleGenerateReport = () => {
    // Navigate to reports or analytics section
    navigate('/dashboard?key=dashboard');
  };

  const handleSearchParcel = async () => {
    if (!trackingNumber.trim()) return;
    
    setIsSearching(true);
    try {
      // For now, using mock data. Replace with actual API call
      const mockParcelData = {
        tracking_number: trackingNumber,
        status: 'En cours',
        created_at: '2025-07-24T00:59:22.000Z',
        updated_at: '2025-07-24T12:30:00.000Z',
        shipper: {
          name: 'Ritej Chaieb',
          company: 'Zina Wear',
          phone: '27107374',
          governorate: 'Mahdia'
        },
        recipient: {
          name: 'Ahmed Ben Ali',
          phone: '98765432',
          governorate: 'Tunis',
          address: '123 Rue de la Paix, Tunis'
        },
        parcel: {
          article_name: 'Vêtements',
          price: 45.50,
          delivery_fee: 8.00,
          weight: 2.5,
          pieces: 1,
          service: 'Livraison'
        },
        timeline: [
          {
            date: '2025-07-24T12:30:00.000Z',
            status: 'En cours',
            location: 'Centre de tri Tunis',
            description: 'Colis en cours de livraison'
          },
          {
            date: '2025-07-24T08:15:00.000Z',
            status: 'Au dépôt',
            location: 'Dépôt Mahdia',
            description: 'Colis reçu au dépôt'
          },
          {
            date: '2025-07-24T00:59:22.000Z',
            status: 'Créé',
            location: 'Mahdia',
            description: 'Colis créé par l\'expéditeur'
          }
        ]
      };
      
      setParcelData(mockParcelData);
    } catch (error) {
      console.error('Error searching parcel:', error);
      setParcelData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const resetTrackModal = () => {
    setShowTrackParcelModal(false);
    setTrackingNumber('');
    setParcelData(null);
    setIsSearching(false);
  };

  if (!currentUser || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-red-800">
              {roleSpecificStats.title || "Tableau de Bord"}
            </h1>
            <p className="text-red-600 mt-2 text-lg">
              {roleSpecificStats.subtitle || "Bienvenue sur QuickZone"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-red-600 font-medium">Connecté en tant que</p>
              <p className="font-bold text-red-800 text-lg">{currentUser.name || currentUser.firstName || currentUser.email || 'Utilisateur'}</p>
              <p className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">{currentUser.role}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {(currentUser.name || currentUser.firstName || currentUser.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {roleSpecificStats.cards?.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                <div className="flex items-center">
                  <span className={`text-sm font-semibold ${
                    card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">ce mois</span>
                </div>
              </div>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getCardColorClasses(card.color)} shadow-lg`}>
                {renderIcon(card.icon)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section - Role-specific */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Chart - Role-specific */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {currentUser?.role === 'Commercial' ? 'Évolution des Clients' : 'Performance des Livraisons'}
          </h3>
          <div className="h-80">
            {currentUser?.role === 'Expéditeur' && expediteurChartData?.deliveryHistory?.length > 0 ? (
              <DeliveryChart 
                deliveryData={expediteurChartData.deliveryHistory.map(item => ({
                  label: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                  value: item.delivered
                }))}
              />
            ) : (currentUser?.role === 'Administration' || currentUser?.role === 'Admin') && adminChartData?.deliveryHistory ? (
              <DeliveryChart 
                deliveryData={adminChartData.deliveryHistory.map(item => ({
                  label: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                  value: item.delivered
                }))}
              />
            ) : currentUser?.role === 'Commercial' && commercialStats?.chartData?.clientEvolution ? (
              <DeliveryChart 
                deliveryData={commercialStats.chartData.clientEvolution.map(item => ({
                  label: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                  value: item.clients
                }))}
              />
            ) : currentUser?.role === 'Expéditeur' ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Aucune donnée de livraison disponible</p>
                  <p className="text-gray-400 text-xs mt-1">Les données apparaîtront ici une fois que vous aurez des colis livrés</p>
                </div>
              </div>
            ) : (
              <DeliveryChart 
                deliveryData={generateSampleDeliveryHistory().map(item => ({
                  label: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                  value: item.delivered
                }))}
              />
            )}
          </div>
        </div>

        {/* Second Chart - Role-specific */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {currentUser?.role === 'Commercial' ? 'Répartition des Clients' : 'Répartition Géographique'}
          </h3>
          <div className="h-80">
            {currentUser?.role === 'Expéditeur' && expediteurChartData?.geographicalData?.length > 0 ? (
              <GeoChart 
                geoData={expediteurChartData.geographicalData.map(item => ({
                  label: item.region,
                  value: item.count
                }))}
              />
            ) : (currentUser?.role === 'Administration' || currentUser?.role === 'Admin') && adminChartData?.geographicalData ? (
              <GeoChart 
                geoData={adminChartData.geographicalData.map(item => ({
                  label: item.region,
                  value: item.count
                }))}
              />
            ) : currentUser?.role === 'Commercial' && commercialStats?.chartData?.clientDistribution ? (
              <GeoChart 
                geoData={commercialStats.chartData.clientDistribution.map(item => ({
                  label: item.region,
                  value: item.count
                }))}
              />
            ) : currentUser?.role === 'Expéditeur' ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Aucune donnée géographique disponible</p>
                  <p className="text-gray-400 text-xs mt-1">Les données apparaîtront ici une fois que vous aurez des colis avec destinations</p>
                </div>
              </div>
            ) : (
              <GeoChart 
                geoData={generateSampleGeographicalData().map(item => ({
                  label: item.region,
                  value: item.count
                }))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status Overview - Role-specific */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {currentUser?.role === 'Commercial' ? 'Statut des Colis' : 'Statut des Colis'}
        </h3>
        <div className="h-96">
          {currentUser?.role === 'Expéditeur' && expediteurStats?.statusStats ? (
            <StatusChart 
              statusStats={expediteurStats.statusStats}
            />
          ) : currentUser?.role === 'Expéditeur' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">Aucun colis disponible</p>
                <p className="text-gray-400 text-xs mt-1">Les données apparaîtront ici une fois que vous aurez des colis</p>
              </div>
            </div>
          ) : currentUser?.role === 'Commercial' ? (
            (() => {
              console.log('🔍 Commercial chart condition check:');
              console.log('🔍 commercialStats:', commercialStats);
              console.log('🔍 chartData:', commercialStats?.chartData);
              console.log('🔍 parcelStatusStats:', commercialStats?.chartData?.parcelStatusStats);
              console.log('🔍 parcelStatusStats length:', commercialStats?.chartData?.parcelStatusStats?.length);
              
              if (commercialStats?.chartData?.parcelStatusStats && commercialStats.chartData.parcelStatusStats.length > 0) {
                // Convert array format to object format for StatusChart
                const statusStatsObject = {};
                commercialStats.chartData.parcelStatusStats.forEach(item => {
                  statusStatsObject[item.status] = item.count;
                });
                console.log('🔍 Converted statusStatsObject:', statusStatsObject);
                return <StatusChart statusStats={statusStatsObject} />;
              } else {
                return (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">Aucun colis disponible</p>
                      <p className="text-gray-400 text-xs mt-1">Les données apparaîtront ici une fois que vos expéditeurs auront des colis</p>
                    </div>
                  </div>
                );
              }
            })()
          ) : (currentUser?.role === 'Administration' || currentUser?.role === 'Admin') && adminChartData?.statusStats ? (
            <StatusChart 
              statusStats={adminChartData.statusStats}
            />
          ) : (
            <StatusChart 
              statusStats={generateSampleStatusStats()}
            />
          )}
        </div>
      </div>

      {/* Quick Actions - Role-specific */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Actions Rapides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentUser?.role === 'Commercial' ? (
            <>
              <button 
                onClick={handleNewClient}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Nouveau Client</p>
                  <p className="text-sm text-gray-500 mt-1">Ajouter un expéditeur</p>
                </div>
              </button>
              <button 
                onClick={handleManagePayments}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Paiements</p>
                  <p className="text-sm text-gray-500 mt-1">Gérer les paiements</p>
                </div>
              </button>
              <button 
                onClick={handleManageComplaints}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-orange-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Réclamations</p>
                  <p className="text-sm text-gray-500 mt-1">Gérer les réclamations</p>
                </div>
              </button>
            </>
          ) : currentUser?.role === 'Expéditeur' ? (
            <>
              <button 
                onClick={handleNewParcel}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Nouveau Colis</p>
                  <p className="text-sm text-gray-500 mt-1">Créer un nouveau colis</p>
                </div>
              </button>
              <button 
                onClick={handleTrackParcel}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Suivre Colis</p>
                  <p className="text-sm text-gray-500 mt-1">Suivre mes colis</p>
                </div>
              </button>
              <button 
                onClick={handlePayments}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Mes Paiements</p>
                  <p className="text-sm text-gray-500 mt-1">Voir mes paiements</p>
                </div>
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleNewParcelAdmin}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Nouveau Colis</p>
                  <p className="text-sm text-gray-500 mt-1">Créer un nouveau colis</p>
                </div>
              </button>
              <button 
                onClick={handleNewExpediteur}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-blue-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Nouveau Expéditeur</p>
                  <p className="text-sm text-gray-500 mt-1">Ajouter un expéditeur</p>
                </div>
              </button>
              <button 
                onClick={handleGenerateReport}
                className="group flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="text-center">
                  <div className="mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-700 text-lg">Rapport</p>
                  <p className="text-sm text-gray-500 mt-1">Générer un rapport</p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ColisCreate Modal */}
      {showColisCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Créer un nouveau colis</h3>
                <button 
                  onClick={() => setShowColisCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <ColisCreate onClose={() => setShowColisCreateModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Track Parcel Modal */}
      {showTrackParcelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Suivre Colis</h3>
                <button 
                  onClick={resetTrackModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {!parcelData ? (
                // Search Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de Suivi</label>
                    <input 
                      type="text" 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Entrez le numéro de suivi"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchParcel()}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={resetTrackModal}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={handleSearchParcel}
                      disabled={isSearching || !trackingNumber.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? 'Recherche...' : 'Rechercher'}
                    </button>
                  </div>
                </div>
              ) : (
                // Parcel Details
                <div className="space-y-6">
                  {/* Header with Status */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Colis #{parcelData.tracking_number}</h4>
                        <p className="text-sm text-gray-600">Créé le {new Date(parcelData.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          parcelData.status === 'Livrés' ? 'bg-green-100 text-green-800' :
                          parcelData.status === 'En cours' ? 'bg-blue-100 text-blue-800' :
                          parcelData.status === 'Au dépôt' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {parcelData.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Three Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* EXPÉDITEUR */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-bold text-blue-600 uppercase">EXPÉDITEUR</h5>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nom</label>
                          <p className="text-gray-900">{parcelData.shipper.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Société</label>
                          <p className="text-gray-900">{parcelData.shipper.company}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Téléphone</label>
                          <p className="text-gray-900">{parcelData.shipper.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Gouvernorat</label>
                          <p className="text-gray-900">{parcelData.shipper.governorate}</p>
                        </div>
                      </div>
                    </div>

                    {/* DESTINATAIRE */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-bold text-blue-600 uppercase">DESTINATAIRE</h5>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Nom</label>
                          <p className="text-gray-900">{parcelData.recipient.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Téléphone</label>
                          <p className="text-gray-900">{parcelData.recipient.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Gouvernorat</label>
                          <p className="text-gray-900">{parcelData.recipient.governorate}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Adresse</label>
                          <p className="text-gray-900">{parcelData.recipient.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* COLIS */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-bold text-blue-600 uppercase">COLIS</h5>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Article</label>
                          <p className="text-gray-900">{parcelData.parcel.article_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Prix</label>
                          <p className="text-gray-900">{parcelData.parcel.price.toFixed(2)} DT</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Frais de livraison</label>
                          <p className="text-gray-900">{parcelData.parcel.delivery_fee.toFixed(2)} DT</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Poids</label>
                          <p className="text-gray-900">{parcelData.parcel.weight} kg</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Service</label>
                          <p className="text-gray-900">{parcelData.parcel.service}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h5 className="text-lg font-bold text-blue-600 uppercase">HISTORIQUE</h5>
                    <div className="space-y-3">
                      {parcelData.timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{event.status}</p>
                                <p className="text-sm text-gray-600">{event.description}</p>
                                <p className="text-sm text-gray-500">{event.location}</p>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(event.date).toLocaleString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        setParcelData(null);
                        setTrackingNumber('');
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Nouvelle Recherche
                    </button>
                    <button 
                      onClick={resetTrackModal}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payments Modal */}
      {showPaymentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Mes Paiements</h3>
              <button 
                onClick={() => setShowPaymentsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">Total Revenus Livrés Payés</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {paidParcels.reduce((total, parcel) => total + (parseFloat(parcel.price) || 0), 0).toFixed(2)} DT
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Colis Livrés</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {expediteurStats?.statusStats?.['Livrés'] || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800">Livrés Payés</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {expediteurStats?.statusStats?.['Livrés payés'] || 0}
                  </p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Liste des Colis Livrés Payés</h4>
                <div className="space-y-2">
                  {paidParcels.length > 0 ? (
                    paidParcels.map((parcel, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Colis #{parcel.tracking_number}</p>
                          <p className="text-sm text-gray-600">
                            Livré le {parcel.updated_at ? new Date(parcel.updated_at).toLocaleDateString('fr-FR') : 'N/A'}
                          </p>
                        </div>
                        <span className="font-bold text-green-600">+{parseFloat(parcel.price || 0).toFixed(2)} DT</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Aucun colis livré payé trouvé
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expediteur Management Modal */}
      {showExpediteurModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Gestion des Expéditeurs</h3>
                <button 
                  onClick={() => setShowExpediteurModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <Expediteur 
                autoOpenAddForm={currentUser?.role === 'Commercial'} 
                onClose={() => setShowExpediteurModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Payments Management Modal */}
      {showPaymentsManagementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h3>
                <button 
                  onClick={() => setShowPaymentsManagementModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <PaimentExpediteur />
            </div>
          </div>
        </div>
      )}

      {/* Complaints Management Modal */}
      {showComplaintsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Gestion des Réclamations</h3>
                <button 
                  onClick={() => setShowComplaintsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <Reclamation />
            </div>
          </div>
        </div>
      )}

      {/* Commercial Payments Modal */}
      {showCommercialPaymentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Mes Paiements</h3>
                <button 
                  onClick={() => setShowCommercialPaymentsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <CommercialPayments />
            </div>
          </div>
        </div>
      )}

      {/* Commercial Complaints Modal */}
      {showCommercialComplaintsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">Gestion des réclamations</h3>
                <button 
                  onClick={() => setShowCommercialComplaintsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <CommercialComplaints />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome; 