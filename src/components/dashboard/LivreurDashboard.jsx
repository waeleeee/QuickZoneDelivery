import React, { useState, useEffect } from "react";
import Modal from "./common/Modal";
import { missionsPickupService, apiService } from '../../services/api';

// Status mapping from French to database English values
const statusMapping = {
  "En attente": "scheduled",
  "À enlever": "scheduled", 
  "Enlevé": "in_progress",
  "Au dépôt": "completed",
  "Mission terminée": "completed",
  "Refusé par livreur": "cancelled"
};

// Reverse mapping for display
const reverseStatusMapping = {
  "scheduled": "En attente",
  "in_progress": "Enlevé", 
  "completed": "Au dépôt",
  "cancelled": "Refusé par livreur"
};

const statusBadge = (status) => {
  // Convert database status to French for display
  const displayStatus = reverseStatusMapping[status] || status;
  
  const colorMap = {
    "En attente": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "À enlever": "bg-blue-100 text-blue-800 border-blue-300",
    "Enlevé": "bg-green-100 text-green-800 border-green-300",
    "Au dépôt": "bg-purple-100 text-purple-800 border-purple-300",
    "En cours": "bg-purple-100 text-purple-800 border-purple-300",
    "Livrés": "bg-green-100 text-green-800 border-green-300",
    "Livrés payés": "bg-emerald-100 text-emerald-800 border-emerald-300",
    "Retour définitif": "bg-red-100 text-red-800 border-red-300",
    "Accepté par livreur": "bg-green-50 text-green-700 border-green-300",
    "Refusé par livreur": "bg-red-50 text-red-700 border-red-300",
    "En cours de ramassage": "bg-orange-100 text-orange-800 border-orange-300",
    "Ramassage terminé": "bg-blue-100 text-blue-800 border-blue-300",
    "Mission terminée": "bg-green-100 text-green-800 border-green-300",
  };
  return <span className={`inline-block px-2 py-1 rounded-full border text-xs font-semibold ${colorMap[displayStatus] || "bg-gray-100 text-gray-800 border-gray-300"}`}>{displayStatus}</span>;
};

const LivreurDashboard = () => {
  // Get logged-in livreur from localStorage
  const [currentUser, setCurrentUser] = useState(null);
  const [livreurProfile, setLivreurProfile] = useState(null);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [showSecurityCodeModal, setShowSecurityCodeModal] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [pendingMissionCompletion, setPendingMissionCompletion] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanningMission, setScanningMission] = useState(null);
  const [scannedParcels, setScannedParcels] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [codeReader, setCodeReader] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Fetch current user and livreur profile
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user from localStorage
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (!user) {
          console.error('No user found in localStorage');
          return;
        }
        
        setCurrentUser(user);
        console.log('🔍 Current user:', user);

        // Fetch livreur profile from database
        const drivers = await apiService.getDrivers();
        console.log('🚗 All drivers:', drivers);
        
        // Find the current livreur by email
        const livreur = drivers.find(driver => driver.email === user.email);
        console.log('👤 Found livreur profile:', livreur);
        
        if (livreur) {
          setLivreurProfile(livreur);
        } else {
          console.warn('Livreur profile not found for email:', user.email);
          // Use fallback data
          setLivreurProfile({
            name: user.name || user.firstName + ' ' + user.lastName,
            email: user.email,
            phone: user.phone || 'N/A',
            address: user.address || 'N/A',
            governorate: user.governorate || 'Tunis',
            car_number: user.car_number || 'N/A',
            car_type: user.car_type || 'N/A',
            driving_license: user.driving_license || 'N/A',
            agency: user.agency || 'Siège',
            photo_url: user.photo_url || null,
            cin_number: user.cin_number || 'N/A',
            insurance_number: user.insurance_number || 'N/A'
          });
        }
      } catch (error) {
        console.error('❌ Error fetching user and profile:', error);
        // Use fallback data
        const user = JSON.parse(localStorage.getItem('currentUser') || 'null') || {
          name: "Livreur",
          email: "livreur@quickzone.tn",
          role: "Livreurs"
        };
        setCurrentUser(user);
        setLivreurProfile({
          name: user.name,
          email: user.email,
          phone: 'N/A',
          address: 'N/A',
          governorate: 'Tunis',
          car_number: 'N/A',
          car_type: 'N/A',
          driving_license: 'N/A',
          agency: 'Siège',
          photo_url: null,
          cin_number: 'N/A',
          insurance_number: 'N/A'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (codeReader) {
        try {
          codeReader.reset();
        } catch (error) {
          console.error('❌ Error cleaning up camera:', error);
        }
      }
    };
  }, [codeReader]);

  // Fetch missions assigned to this driver
  useEffect(() => {
    const fetchDriverMissions = async () => {
      if (!currentUser?.email) return;
      
      try {
        console.log('🔍 Fetching missions for driver:', currentUser.email);
        console.log('👤 Current user:', currentUser);
        console.log('🚗 Livreur profile:', livreurProfile);
        
        // Try multiple ways to find missions for this driver
        let driverMissions = [];
        
        // Method 1: Try by email
        try {
          const responseByEmail = await missionsPickupService.getMissionsPickup({ driver_email: currentUser.email });
          console.log('📧 Missions by email response:', responseByEmail);
          
          // Handle both response formats
          if (Array.isArray(responseByEmail)) {
            driverMissions = responseByEmail;
          } else if (responseByEmail.success && responseByEmail.data) {
            driverMissions = responseByEmail.data;
          }
        } catch (error) {
          console.log('❌ No missions found by email:', error);
        }
        
        // Method 2: If no missions by email, try by name
        if (driverMissions.length === 0 && livreurProfile?.name) {
          try {
            const responseByName = await missionsPickupService.getMissionsPickup({ driver_name: livreurProfile.name });
            console.log('📝 Missions by name response:', responseByName);
            
            // Handle both response formats
            if (Array.isArray(responseByName)) {
              driverMissions = responseByName;
            } else if (responseByName.success && responseByName.data) {
              driverMissions = responseByName.data;
            }
          } catch (error) {
            console.log('❌ No missions found by name:', error);
          }
        }
        
        // Method 3: If still no missions, try getting all missions and filter client-side
        if (driverMissions.length === 0) {
          try {
            const allMissionsResponse = await missionsPickupService.getMissionsPickup();
            console.log('📦 All missions response:', allMissionsResponse);
            
            // Handle both response formats: { success: true, data: [...] } and direct array
            let allMissions = [];
            if (allMissionsResponse && typeof allMissionsResponse === 'object') {
              if (Array.isArray(allMissionsResponse)) {
                allMissions = allMissionsResponse;
              } else if (allMissionsResponse.success && Array.isArray(allMissionsResponse.data)) {
                allMissions = allMissionsResponse.data;
              }
            }
            
            console.log('🔍 Filtering all missions for driver:', livreurProfile?.name, currentUser.email);
            console.log('📋 All missions structure:', allMissions.map(m => ({
              id: m.id,
              driver: m.driver,
              driver_name: m.driver_name,
              driver_email: m.driver_email,
              shipper: m.shipper,
              status: m.status
            })));
            
            // Log the full mission objects for debugging
            console.log('🔍 FULL MISSION OBJECTS:', JSON.stringify(allMissions, null, 2));
            
            // Filter missions that match the driver by name or email
            driverMissions = allMissions.filter(mission => {
              const driverName = mission.driver?.name || mission.driver_name || '';
              const driverEmail = mission.driver?.email || mission.driver_email || '';
              
              // Try multiple matching strategies
              const matchesName = driverName.toLowerCase().includes(livreurProfile?.name?.toLowerCase() || '');
              const matchesEmail = driverEmail.toLowerCase() === currentUser.email.toLowerCase();
              
              // Try matching by first name only (e.g., "adem" in "adem adem")
              const firstName = livreurProfile?.name?.split(' ')[0]?.toLowerCase() || '';
              const matchesFirstName = driverName.toLowerCase().includes(firstName);
              
              // Try matching by any part of the name
              const nameParts = livreurProfile?.name?.toLowerCase().split(' ') || [];
              const matchesAnyNamePart = nameParts.some(part => 
                driverName.toLowerCase().includes(part) && part.length > 2
              );
              
              console.log(`Mission ${mission.id}: driver="${driverName}" email="${driverEmail}"`);
              console.log(`  matchesName=${matchesName} matchesEmail=${matchesEmail} matchesFirstName=${matchesFirstName} matchesAnyNamePart=${matchesAnyNamePart}`);
              console.log(`  livreurProfile.name="${livreurProfile?.name}" firstName="${firstName}" nameParts=${JSON.stringify(nameParts)}`);
              
              return matchesName || matchesEmail || matchesFirstName || matchesAnyNamePart;
            });
            
            // TEMPORARY: If still no matches, show all missions for debugging
            if (driverMissions.length === 0) {
              console.log('⚠️ No missions matched by filtering. Showing all missions for debugging.');
              console.log('🔍 All available missions:', allMissions);
              // Uncomment the next line to show all missions temporarily
              // driverMissions = allMissions;
            }
          } catch (error) {
            console.log('❌ Error getting all missions:', error);
          }
        }
        
        console.log('🚚 Final driver missions:', driverMissions);
        setMissions(driverMissions);
      } catch (error) {
        console.error('❌ Error fetching driver missions:', error);
        setMissions([]);
      }
    };

    fetchDriverMissions();
  }, [currentUser?.email, livreurProfile?.name]);

  // Calculate statistics
  const totalMissions = missions.length;
  const pendingMissions = missions.filter(m => m.status === "En attente" || m.status === "scheduled").length;
  const acceptedMissions = missions.filter(m => m.status === "À enlever" || m.status === "scheduled").length;
  const inProgressMissions = missions.filter(m => m.status === "Enlevé" || m.status === "in_progress").length;
  const completedMissions = missions.filter(m => m.status === "Au dépôt" || m.status === "Mission terminée" || m.status === "completed").length;
  const totalParcels = missions.reduce((sum, mission) => sum + (mission.parcels?.length || 0), 0);

  // Filter missions based on status and search
  const filteredMissions = missions.filter(mission => {
    // Convert database status to French for filtering
    const displayStatus = reverseStatusMapping[mission.status] || mission.status;
    
    const statusMatch = filterStatus === "all" || displayStatus === filterStatus;
    const searchMatch = !searchTerm || 
      mission.mission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.shipper?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.shipper?.address?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Handler to accept/refuse a pickup mission
  const handlePickupAction = async (missionId, action) => {
    try {
      console.log(`🚀 handlePickupAction called with missionId: ${missionId}, action: ${action}`);
      
      const frenchStatus = action === "accept" ? "À enlever" : "Refusé par livreur";
      const dbStatus = statusMapping[frenchStatus];
      console.log(`📋 French status: ${frenchStatus}, DB status: ${dbStatus}`);
      
      // Find the mission to get all its parcels
      const mission = missions.find(m => m.id === missionId);
      if (!mission) {
        console.error('❌ Mission not found:', missionId);
        alert('Mission introuvable');
        return;
      }
      
      console.log('📦 Found mission:', mission);
      
      // For accept/refuse actions, just update the mission status
      // The backend will handle this as a simple status update
      const updateData = { status: dbStatus };
      
      console.log('📤 Sending update data to API:', updateData);
      const response = await missionsPickupService.updateMissionPickup(missionId, updateData);
      console.log('✅ API response:', response);
      
      // Update local state with French status for display
      setMissions((prevMissions) =>
        prevMissions.map((m) =>
          m.id === missionId
            ? { ...m, status: frenchStatus }
            : m
        )
      );
      
      // Update selectedMission if open
      if (selectedMission && selectedMission.id === missionId) {
        setSelectedMission((prev) => ({ ...prev, status: frenchStatus }));
      }
      
      console.log(`✅ Mission ${action === 'accept' ? 'accepted' : 'refused'} successfully`);
      alert(`Mission ${action === 'accept' ? 'acceptée' : 'refusée'} avec succès!`);
      
    } catch (error) {
      console.error('❌ Error updating mission status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Erreur lors de la mise à jour du statut de la mission';
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Handler to update mission status
  const handleMissionStatusUpdate = async (missionId, newStatus) => {
    try {
      console.log(`🚀 handleMissionStatusUpdate called with missionId: ${missionId}, newStatus: ${newStatus}`);
      
      // If trying to complete mission, require security code
      if (newStatus === 'Mission terminée') {
        console.log('🔐 Mission completion requested, getting security code...');
        setPendingMissionCompletion({ missionId, newStatus });
        setShowSecurityCodeModal(true);
        return;
      }
      
      // Map French status to database status
      const dbStatus = statusMapping[newStatus];
      if (!dbStatus) {
        console.error('❌ Unknown status:', newStatus);
        alert('Statut inconnu');
        return;
      }
      
      console.log(`📋 French status: ${newStatus}, DB status: ${dbStatus}`);
      
      // Use the same simplified approach - just send status update
      const updateData = { status: dbStatus };
      
      console.log('📤 Sending update data to API:', updateData);
      const response = await missionsPickupService.updateMissionPickup(missionId, updateData);
      console.log('✅ API response:', response);
      
      // Update local state with French status for display
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission.id === missionId
            ? { ...mission, status: newStatus }
            : mission
        )
      );
      
      // Update selectedMission if open
      if (selectedMission && selectedMission.id === missionId) {
        setSelectedMission((prev) => ({ ...prev, status: newStatus }));
      }
      
      console.log(`✅ Mission status updated to: ${newStatus}`);
      alert(`Mission mise à jour: ${newStatus}`);
      
    } catch (error) {
      console.error('❌ Error updating mission status:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Erreur lors de la mise à jour du statut de la mission';
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Handler to submit security code for mission completion
  const handleSecurityCodeSubmit = async () => {
    if (!pendingMissionCompletion || !securityCode.trim()) {
      alert('Veuillez entrer le code de sécurité');
      return;
    }

    try {
      console.log('🔐 Submitting security code for mission completion...');
      
      // Map French status to database status
      const dbStatus = statusMapping[pendingMissionCompletion.newStatus];
      if (!dbStatus) {
        console.error('❌ Unknown status:', pendingMissionCompletion.newStatus);
        alert('Statut inconnu');
        return;
      }
      
      console.log(`📋 French status: ${pendingMissionCompletion.newStatus}, DB status: ${dbStatus}`);
      
      const updateData = { 
        status: dbStatus,
        securityCode: securityCode.trim()
      };
      
      console.log('📤 Sending update data with security code:', updateData);
      const response = await missionsPickupService.updateMissionPickup(pendingMissionCompletion.missionId, updateData);
      console.log('✅ API response:', response);
      
      // Update local state with French status for display
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission.id === pendingMissionCompletion.missionId
            ? { ...mission, status: pendingMissionCompletion.newStatus }
            : mission
        )
      );
      
      // Update selectedMission if open
      if (selectedMission && selectedMission.id === pendingMissionCompletion.missionId) {
        setSelectedMission((prev) => ({ ...prev, status: pendingMissionCompletion.newStatus }));
      }
      
      // Close modal and reset state
      setShowSecurityCodeModal(false);
      setSecurityCode("");
      setPendingMissionCompletion(null);
      
      console.log('✅ Mission completed successfully with security code');
      alert('Mission terminée avec succès!');
      
    } catch (error) {
      console.error('❌ Error completing mission with security code:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Erreur lors de la finalisation de la mission';
      if (error.response?.data?.message) {
        errorMessage += `: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Handler to start barcode scanning
  const handleStartScanning = (mission) => {
    console.log('📱 Starting barcode scanning for mission:', mission);
    setScanningMission(mission);
    setScannedParcels([]);
    setScanInput("");
    setScanMessage("");
    setShowScanModal(true);
  };

  // Initialize camera scanner
  const initializeCamera = async () => {
    try {
      console.log('📷 Initializing camera scanner...');
      
      // Dynamically import ZXing library
      let BrowserMultiFormatReader;
      try {
        const zxing = await import('@zxing/library');
        BrowserMultiFormatReader = zxing.BrowserMultiFormatReader;
        console.log('📷 ZXing library loaded:', zxing);
      } catch (importError) {
        console.error('❌ Failed to import ZXing library:', importError);
        setCameraError("Impossible de charger la bibliothèque de scan");
        return false;
      }
      
      // Check if BrowserMultiFormatReader is available
      if (typeof BrowserMultiFormatReader === 'undefined') {
        console.error('❌ BrowserMultiFormatReader not available');
        setCameraError("Scanner library non disponible");
        return false;
      }
      
      const reader = new BrowserMultiFormatReader();
      console.log('📷 Reader created:', reader);
      
      // Test if reader is properly initialized
      if (!reader || typeof reader.decodeFromVideoDevice !== 'function') {
        console.error('❌ Reader not properly initialized');
        setCameraError("Erreur d'initialisation du scanner");
        return false;
      }
      
      setCodeReader(reader);
      
      // Get available video devices
      const videoInputDevices = await reader.listVideoInputDevices();
      console.log('📷 Available cameras:', videoInputDevices);
      
      if (videoInputDevices.length === 0) {
        setCameraError("Aucune caméra trouvée");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing camera:', error);
      setCameraError("Erreur d'initialisation de la caméra: " + error.message);
      return false;
    }
  };

  // Start camera scanning
  const startCameraScanning = async () => {
    try {
      console.log('📷 Starting camera scanning...');
      console.log('📷 Current codeReader:', codeReader);
      
      // Always initialize if codeReader is null
      if (!codeReader) {
        console.log('📷 CodeReader is null, initializing...');
        const initialized = await initializeCamera();
        if (!initialized) {
          console.error('❌ Failed to initialize camera');
          return;
        }
      }
      
      // Double-check codeReader exists
      if (!codeReader) {
        console.error('❌ CodeReader still null after initialization');
        setCameraError("Impossible d'initialiser le scanner");
        return;
      }
      
      setShowCamera(true);
      setCameraError("");
      setIsScanning(true);
      
      console.log('📷 Starting video device decoding...');
      
      // Configure scanning options for better performance - simplified approach
      const hints = new Map();
      hints.set(2, true); // TRY_HARDER
      hints.set(3, true); // PURE_BARCODE
      
      // Enable specific formats that are most common for parcel tracking
      const formats = [
        'CODE_128',
        'CODE_39', 
        'EAN_13',
        'EAN_8',
        'UPC_A',
        'UPC_E',
        'CODABAR',
        'ITF',
        'QR_CODE',
        'DATA_MATRIX'
      ];
      
      console.log('📷 Starting scan with formats:', formats);
      
      // Start scanning from camera with simplified configuration
      await codeReader.decodeFromVideoDevice(
        undefined, // Use default camera
        'video-preview',
        (result, error) => {
          if (result) {
            console.log('📷 Barcode detected:', result.text);
            console.log('📷 Barcode format:', result.format);
            console.log('📷 Raw result:', result);
            handleScan(result.text);
            // Don't stop scanning - continue for multiple scans
            // stopCameraScanning();
          }
          if (error) {
            console.log('📷 Scanning in progress...', error.name, error.message);
            // Only show error if it's not a "not found" error (which is normal during scanning)
            if (error.name !== 'NotFoundException' && error.name !== 'NoMultiFormatReaderException') {
              console.error('❌ Camera scanning error:', error);
              setCameraError("Erreur de scan: " + error.message);
            }
          }
        },
        hints
      );
      
    } catch (error) {
      console.error('❌ Error starting camera scanning:', error);
      setCameraError("Erreur de démarrage de la caméra: " + error.message);
      setIsScanning(false);
    }
  };

  // Stop camera scanning
  const stopCameraScanning = () => {
    if (codeReader) {
      try {
        codeReader.reset();
        setShowCamera(false);
        setCameraError("");
        setIsScanning(false); // Reset scanning status
      } catch (error) {
        console.error('❌ Error stopping camera:', error);
      }
    }
  };

  // Handler to scan barcode
  const handleScan = async (barcode) => {
    try {
      console.log('📱 Scanning barcode:', barcode);
      console.log('📱 Available parcels:', scanningMission?.parcels);
      setScanMessage("Scanning...");
      
      // Clean the barcode (remove spaces, special characters)
      const cleanBarcode = barcode.trim().replace(/[^a-zA-Z0-9]/g, '');
      console.log('📱 Cleaned barcode:', cleanBarcode);
      
      // Find the parcel with this barcode - try multiple matching strategies
      let parcel = null;
      
      // Strategy 1: Exact match with tracking_number
      parcel = scanningMission?.parcels?.find(p => 
        p.tracking_number === barcode || p.tracking_number === cleanBarcode
      );
      
      // Strategy 2: Exact match with ID
      if (!parcel) {
        parcel = scanningMission?.parcels?.find(p => 
          p.id.toString() === barcode || p.id.toString() === cleanBarcode
        );
      }
      
      // Strategy 3: Partial match with tracking_number
      if (!parcel) {
        parcel = scanningMission?.parcels?.find(p => 
          p.tracking_number && p.tracking_number.includes(cleanBarcode)
        );
      }
      
      // Strategy 4: Partial match with ID
      if (!parcel) {
        parcel = scanningMission?.parcels?.find(p => 
          p.id.toString().includes(cleanBarcode)
        );
      }
      
      console.log('📱 Found parcel:', parcel);
      
      if (!parcel) {
        setScanMessage(`❌ Colis non trouvé: ${barcode}`);
        console.log('❌ No parcel found for barcode:', barcode);
        console.log('❌ Available tracking numbers:', scanningMission?.parcels?.map(p => p.tracking_number));
        console.log('❌ Available IDs:', scanningMission?.parcels?.map(p => p.id));
        return;
      }
      
      if (scannedParcels.includes(parcel.id)) {
        setScanMessage("⚠️ Ce colis a déjà été scanné");
        return;
      }
      
      // Add to scanned parcels
      setScannedParcels(prev => [...prev, parcel.id]);
      setScanMessage(`✅ ${parcel.recipient_name || parcel.destination || 'Colis'} scanné avec succès`);
      
      // Visual feedback - flash the scanning frame green
      const videoElement = document.getElementById('video-preview');
      if (videoElement) {
        videoElement.style.border = '4px solid #10B981';
        setTimeout(() => {
          videoElement.style.border = '2px solid #3B82F6';
        }, 500);
      }
      
      // Clear input after short delay
      setTimeout(() => {
        setScanInput("");
        setScanMessage("");
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error scanning parcel:', error);
      setScanMessage("❌ Erreur lors du scan");
    }
  };

  // Test scanning function for debugging
  const testScan = () => {
    if (scanningMission?.parcels?.length > 0) {
      const firstParcel = scanningMission.parcels[0];
      const testBarcode = firstParcel.tracking_number || firstParcel.id.toString();
      console.log('🧪 Testing scan with barcode:', testBarcode);
      handleScan(testBarcode);
    }
  };

  // Handler to submit scan input
  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (scanInput.trim()) {
      handleScan(scanInput.trim());
    }
  };

  // Handler to complete scanning and update mission status
  const handleCompleteScanning = async () => {
    try {
      console.log('📱 Completing scanning for mission:', scanningMission.id);
      
      // Update mission status to "Enlevé"
      const dbStatus = statusMapping["Enlevé"];
      const updateData = { status: dbStatus };
      
      const response = await missionsPickupService.updateMissionPickup(scanningMission.id, updateData);
      console.log('✅ Mission updated:', response);
      
      // Update local state with French status for display
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission.id === scanningMission.id
            ? { ...mission, status: "Enlevé" }
            : mission
        )
      );
      
      // Update selectedMission if open
      if (selectedMission && selectedMission.id === scanningMission.id) {
        setSelectedMission((prev) => ({ ...prev, status: "Enlevé" }));
      }
      
      // Close modal and reset state
      setShowScanModal(false);
      setScanningMission(null);
      setScannedParcels([]);
      setScanInput("");
      setScanMessage("");
      
      alert('Mission mise à jour: Enlevé');
      
    } catch (error) {
      console.error('❌ Error completing scanning:', error);
      alert('Erreur lors de la mise à jour de la mission');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Chargement du profil...
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || !livreurProfile) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-gray-500">
            Impossible de charger les informations du livreur.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            {livreurProfile.photo_url ? (
              <img
                className="h-20 w-20 rounded-full object-cover border-4 border-blue-100"
                src={livreurProfile.photo_url.startsWith('http') ? livreurProfile.photo_url : `http://localhost:5000${livreurProfile.photo_url}`}
                alt={livreurProfile.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`h-20 w-20 rounded-full border-4 border-blue-100 bg-gray-100 flex items-center justify-center ${livreurProfile.photo_url ? 'hidden' : 'flex'}`}>
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{livreurProfile.name}</h1>
            <p className="text-gray-600">{currentUser.role}</p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {livreurProfile.email}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {livreurProfile.phone}
              </span>
            </div>
        </div>
        <div className="text-right">
            <div className="text-sm text-gray-500">Permis de conduire</div>
            <div className="text-lg font-bold text-blue-600">{livreurProfile.driving_license}</div>
            <div className="text-sm text-gray-500 mt-1">Véhicule</div>
            <div className="text-sm font-medium text-gray-700">{livreurProfile.car_type} - {livreurProfile.car_number}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tableau de Bord
            </button>
            <button
              onClick={() => setActiveTab('missions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'missions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mes Missions ({totalMissions})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mon Profil
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
                      <p className="text-xs font-medium opacity-90">Total Missions</p>
                      <p className="text-2xl font-bold">{totalMissions}</p>
            </div>
                    <div className="p-2 bg-white bg-opacity-20 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
                      <p className="text-xs font-medium opacity-90">En Attente</p>
                      <p className="text-2xl font-bold">{pendingMissions}</p>
            </div>
                    <div className="p-2 bg-white bg-opacity-20 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
                      <p className="text-xs font-medium opacity-90">À enlever</p>
                      <p className="text-2xl font-bold">{acceptedMissions}</p>
            </div>
                    <div className="p-2 bg-white bg-opacity-20 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
                      <p className="text-xs font-medium opacity-90">Enlevé</p>
                      <p className="text-2xl font-bold">{inProgressMissions}</p>
            </div>
                    <div className="p-2 bg-white bg-opacity-20 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
                      <p className="text-xs font-medium opacity-90">Terminées</p>
                      <p className="text-2xl font-bold">{completedMissions}</p>
            </div>
                    <div className="p-2 bg-white bg-opacity-20 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

              {/* Recent Missions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Missions Récentes</h3>
                {missions.slice(0, 3).map((mission) => (
                  <div key={mission.id} className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Mission #{mission.mission_number || mission.id}</h4>
                        <p className="text-sm text-gray-600">{mission.shipper?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{mission.scheduled_time}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {statusBadge(mission.status)}
                        <button
                          onClick={() => setSelectedMission(mission)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {missions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Aucune mission récente</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'missions' && (
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher par numéro de mission, expéditeur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="À enlever">À enlever</option>
              <option value="Enlevé">Enlevé</option>
              <option value="Au dépôt">Au dépôt</option>
              <option value="Mission terminée">Mission terminée</option>
              <option value="Refusé par livreur">Refusé</option>
            </select>
        </div>
        
              {/* Missions Table */}
              {missions.length === 0 ? (
                <div className="text-center py-8">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune mission trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || filterStatus !== "all" 
                        ? "Aucune mission ne correspond à vos critères de recherche."
                        : "Aucune mission de ramassage ne vous a été assignée pour le moment."
                      }
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date prévue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expéditeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colis</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMissions.map((mission) => (
                  <tr key={mission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mission.mission_number || mission.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(mission.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.scheduled_time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mission.shipper?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">{mission.shipper?.address || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mission.parcels?.length || 0} colis</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {(mission.status === "En attente" || mission.status === "scheduled") && (
                                <>
                                  <button
                                    onClick={() => handlePickupAction(mission.id, "accept")}
                                    className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold"
                                    title="Accepter la mission"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => handlePickupAction(mission.id, "refuse")}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold"
                                    title="Refuser la mission"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                      <button
                        onClick={() => setSelectedMission(mission)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        title="Voir les détails"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                            </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Personnelles</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Nom complet</label>
                      <p className="text-gray-900">{livreurProfile.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{livreurProfile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Téléphone</label>
                      <p className="text-gray-900">{livreurProfile.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Adresse</label>
                      <p className="text-gray-900">{livreurProfile.address}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Gouvernorat</label>
                      <p className="text-gray-900">{livreurProfile.governorate}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Professionnelles</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Rôle</label>
                      <p className="text-gray-900">{currentUser.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Numéro CIN</label>
                      <p className="text-gray-900">{livreurProfile.cin_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Numéro de permis</label>
                      <p className="text-gray-900">{livreurProfile.driving_license}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Véhicule assigné</label>
                      <p className="text-gray-900">{livreurProfile.car_type} - {livreurProfile.car_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Numéro d'assurance</label>
                      <p className="text-gray-900">{livreurProfile.insurance_number}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Agence</label>
                      <p className="text-gray-900">{livreurProfile.agency}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Photo */}
              {livreurProfile.photo_url && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo de Profil</h3>
                  <div className="flex justify-center">
                    <img
                      src={livreurProfile.photo_url.startsWith('http') ? livreurProfile.photo_url : `http://localhost:5000${livreurProfile.photo_url}`}
                      alt={livreurProfile.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-32 h-32 rounded-full border-4 border-blue-100 bg-gray-100 flex items-center justify-center hidden">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Stats */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{totalMissions}</div>
                      <div className="text-sm text-gray-600">Missions totales</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{completedMissions}</div>
                      <div className="text-sm text-gray-600">Missions terminées</div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{totalParcels}</div>
                      <div className="text-sm text-gray-600">Colis traités</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mission Details Modal */}
      <Modal
        isOpen={!!selectedMission}
        onClose={() => setSelectedMission(null)}
        title={selectedMission ? `Détail de la mission #${selectedMission.mission_number || selectedMission.id}` : ""}
        size="lg"
      >
        {selectedMission && (
          <div className="space-y-6">
            {/* Mission Status and Actions */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-gray-700 mb-2">Statut :</div>
                {statusBadge(selectedMission.status)}
              </div>
              <div className="flex space-x-2">
                {(selectedMission.status === "En attente" || selectedMission.status === "scheduled") && (
                  <>
                    <button
                      onClick={() => handlePickupAction(selectedMission.id, "accept")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                      Accepter la mission
                    </button>
                    <button
                      onClick={() => handlePickupAction(selectedMission.id, "refuse")}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold"
                    >
                      Refuser la mission
                    </button>
                  </>
                )}
                {(selectedMission.status === "À enlever" || selectedMission.status === "scheduled") && (
                  <button
                    onClick={() => handleStartScanning(selectedMission)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold"
                  >
                    Démarrer le ramassage
                  </button>
                )}
                {(selectedMission.status === "Enlevé" || selectedMission.status === "in_progress") && (
                  <button
                    onClick={() => handleMissionStatusUpdate(selectedMission.id, "Au dépôt")}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold"
                  >
                    Terminer le ramassage
                  </button>
                )}
                {(selectedMission.status === "Au dépôt" || selectedMission.status === "completed") && (
                  <button
                    onClick={() => handleMissionStatusUpdate(selectedMission.id, "Mission terminée")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm font-semibold"
                  >
                    Confirmer la mission
                  </button>
                )}
              </div>
            </div>

            {/* Mission Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700">Date prévue :</div>
                <div className="text-sm">{selectedMission.scheduled_time}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700">Téléphone :</div>
                <div className="text-sm">{selectedMission.shipper?.phone || 'N/A'}</div>
              </div>
            </div>

            <div>
              <div className="font-semibold text-gray-700">Expéditeur :</div>
              <div className="text-sm">{selectedMission.shipper?.name || 'N/A'}</div>
              <div className="font-semibold text-gray-700 mt-2">Adresse :</div>
              <div className="text-sm">{selectedMission.shipper?.address || 'N/A'}</div>
              {selectedMission.notes && (
                <>
                  <div className="font-semibold text-gray-700 mt-2">Notes :</div>
                  <div className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">{selectedMission.notes}</div>
                </>
              )}
            </div>

            {/* Colis List */}
            <div>
              <div className="font-semibold text-gray-700 mb-3">Colis associés ({selectedMission.parcels?.length || 0}) :</div>
              <div className="space-y-2">
                {selectedMission.parcels?.map((parcel) => (
                  <div key={parcel.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm">{parcel.recipient_name || parcel.destination || 'Colis sans nom'}</span>
                          {statusBadge(parcel.status)}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {parcel.destination || 'Destination non spécifiée'}
                        </div>
                        {parcel.weight && (
                          <div className="text-xs text-gray-500 mt-1">
                            Poids: {parcel.weight} kg
                          </div>
                        )}
                        {parcel.dimensions && (
                          <div className="text-xs text-gray-500 mt-1">
                            Dimensions: {parcel.dimensions}
                          </div>
                        )}
                        {parcel.package_type && (
                          <div className="text-xs text-gray-500 mt-1">
                            Type: {parcel.package_type}
                          </div>
                        )}
                        {parcel.service_type && (
                          <div className="text-xs text-gray-500 mt-1">
                            Service: {parcel.service_type}
                          </div>
                        )}
                        {parcel.special_instructions && (
                          <div className="text-xs text-gray-500 mt-1">
                            Instructions: {parcel.special_instructions}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-gray-500 text-sm">Aucun colis associé à cette mission</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Security Code Modal */}
      <Modal
        isOpen={showSecurityCodeModal}
        onClose={() => {
          setShowSecurityCodeModal(false);
          setSecurityCode("");
          setPendingMissionCompletion(null);
        }}
        title="Code de Sécurité Requis"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Code de Sécurité Requis
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Pour terminer cette mission, vous devez entrer le code de sécurité fourni par l'administrateur.
            </p>
          </div>
          
          <div>
            <label htmlFor="securityCode" className="block text-sm font-medium text-gray-700 mb-2">
              Code de Sécurité
            </label>
            <input
              type="text"
              id="securityCode"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              placeholder="Entrez le code de sécurité"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowSecurityCodeModal(false);
                setSecurityCode("");
                setPendingMissionCompletion(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Annuler
            </button>
            <button
              onClick={handleSecurityCodeSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Confirmer
            </button>
          </div>
        </div>
      </Modal>

      {/* Barcode Scanning Modal */}
      <Modal
        isOpen={showScanModal}
        onClose={() => {
          stopCameraScanning();
          setShowScanModal(false);
          setScanningMission(null);
          setScannedParcels([]);
          setScanInput("");
          setScanMessage("");
        }}
        title={scanningMission ? `Scanning Mission #${scanningMission.mission_number || scanningMission.id}` : ""}
        size="lg"
      >
        {scanningMission && (
          <div className="space-y-6">
            {/* Mission Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Expéditeur:</span> {scanningMission.shipper?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Statut:</span> {statusBadge(scanningMission.status)}
                </div>
                <div>
                  <span className="font-semibold">Colis:</span> {scanningMission.parcels?.length || 0}
                </div>
                <div>
                  <span className="font-semibold">Adresse:</span> {scanningMission.shipper?.address || 'N/A'}
                </div>
              </div>
            </div>

            {/* Scanning Interface */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scanner le code-barres du colis
                </label>
                
                {/* Camera Scanner */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={startCameraScanning}
                    disabled={showCamera}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-semibold mr-2"
                  >
                    📷 {showCamera ? 'Caméra active...' : 'Ouvrir la caméra'}
                  </button>
                  {showCamera && (
                    <button
                      type="button"
                      onClick={stopCameraScanning}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-semibold mr-2"
                    >
                      ❌ Fermer la caméra
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={testScan}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md font-semibold mr-2"
                  >
                    🧪 Test Scan
                  </button>
                  {showCamera && (
                    <button
                      type="button"
                      onClick={() => {
                        // Force a manual scan attempt
                        console.log('🔍 Manual scan trigger');
                        setScanMessage("🔍 Tentative de scan manuel...");
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md font-semibold"
                    >
                      🔍 Scan Manuel
                    </button>
                  )}
                </div>

                {/* Camera Instructions */}
                {!showCamera && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold mb-1">📱 Instructions de scan:</div>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Cliquez sur "Ouvrir la caméra" pour scanner avec l'appareil photo</li>
                        <li>Ou utilisez "Test Scan" pour simuler un scan</li>
                        <li>Ou entrez manuellement le code-barres ci-dessous</li>
                        <li>Assurez-vous que la caméra a les permissions nécessaires</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Camera Preview */}
                {showCamera && (
                  <div className="mb-4">
                    <div className="relative">
                      <video
                        id="video-preview"
                        className="w-full h-96 bg-black rounded-lg border-2 border-blue-500"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-white rounded-lg p-2">
                          <div className="w-80 h-60 border-2 border-red-500 rounded relative">
                            {/* Scanning animation */}
                            {isScanning && (
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/20 to-transparent animate-pulse"></div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Scanning status overlay */}
                      {isScanning && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          🔍 Scanning...
                        </div>
                      )}
                      {/* Progress indicator */}
                      {isScanning && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {scannedParcels.length}/{scanningMission.parcels?.length || 0}
                        </div>
                      )}
                    </div>
                    {cameraError && (
                      <div className="mt-2 p-2 bg-red-100 text-red-800 rounded text-sm">
                        ❌ {cameraError}
                      </div>
                    )}
                    {isScanning && !cameraError && (
                      <div className="mt-2 p-2 bg-blue-100 text-blue-800 rounded text-sm text-center">
                        📱 Pointez la caméra vers le code-barres du colis
                      </div>
                    )}
                    
                    {/* Debug Panel */}
                    {showCamera && (
                      <div className="mt-2 p-2 bg-gray-100 border border-gray-300 rounded text-xs">
                        <div className="font-semibold mb-1">🔧 Debug Info:</div>
                        <div>Camera: {showCamera ? '✅ Active' : '❌ Inactive'}</div>
                        <div>Scanning: {isScanning ? '✅ En cours' : '❌ Arrêté'}</div>
                        <div>Parcels: {scannedParcels.length}/{scanningMission.parcels?.length || 0}</div>
                        <div>Error: {cameraError || 'Aucune'}</div>
                        <div className="mt-1 text-gray-600">
                          💡 Conseil: Assurez-vous que le code-barres est bien éclairé et stable
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Manual Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Ou entrez manuellement le code-barres..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus={!showCamera}
                  />
                  <button
                    type="submit"
                    onClick={handleScanSubmit}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-semibold"
                  >
                    Entrer
                  </button>
                </div>
                {scanMessage && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    scanMessage.includes('✅') ? 'bg-green-100 text-green-800' :
                    scanMessage.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {scanMessage}
                  </div>
                )}
              </div>

              {/* Scanned Parcels Progress */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-blue-800">Progression du scan</span>
                  <span className="text-sm text-blue-600">
                    {scannedParcels.length} / {scanningMission.parcels?.length || 0}
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${scanningMission.parcels?.length ? (scannedParcels.length / scanningMission.parcels.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Parcels List */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Colis de la mission</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {scanningMission.parcels?.map((parcel) => (
                    <div 
                      key={parcel.id} 
                      className={`p-3 rounded-lg border ${
                        scannedParcels.includes(parcel.id) 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm">
                              {parcel.recipient_name || parcel.destination || 'Colis sans nom'}
                            </span>
                            {scannedParcels.includes(parcel.id) && (
                              <span className="text-green-600">✅</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {parcel.destination || 'Destination non spécifiée'}
                          </div>
                          {!scannedParcels.includes(parcel.id) && (
                            <div className="text-xs text-blue-600 mt-1 font-medium">
                              ⚠️ Scanner ce colis
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-gray-500 text-sm">Aucun colis associé à cette mission</div>
                  )}
                </div>
              </div>

              {/* Complete Button */}
              {scannedParcels.length === (scanningMission.parcels?.length || 0) && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCompleteScanning}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg"
                  >
                    ✅ Terminer le scanning - Mission Enlevé
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LivreurDashboard; 