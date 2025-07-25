import React, { useRef, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

const LivreurBarcodeScan = ({ mission, onScan, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [scannedParcels, setScannedParcels] = useState([]);
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (scanning) {
      setError("");
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode("livreur-qr-reader");
      }
      html5QrCodeRef.current
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 100 },
            aspectRatio: 2.5,
          },
          (decodedText) => {
            handleScan(decodedText);
          },
          (err) => {}
        )
        .catch((err) => {
          setError("Impossible d'accéder à la caméra : " + err);
          setScanning(false);
        });
    }
    return () => {
      if (html5QrCodeRef.current && scanning) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear().catch(() => {});
      }
    };
    // eslint-disable-next-line
  }, [scanning]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
        html5QrCodeRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const startScan = () => {
    setScanning(true);
  };

  const stopScan = () => {
    setScanning(false);
  };

  const handleScan = async (barcode) => {
    try {
      console.log('📱 Scanning barcode:', barcode);
      setScanMessage("Scanning...");
      
      // Find the parcel with this barcode
      const parcel = mission?.parcels?.find(p => 
        p.tracking_number === barcode || 
        p.id.toString() === barcode ||
        p.client_code === barcode
      );
      
      if (!parcel) {
        setScanMessage("❌ Colis non trouvé dans cette mission");
        return;
      }
      
      if (scannedParcels.includes(parcel.id)) {
        setScanMessage("⚠️ Ce colis a déjà été scanné");
        return;
      }
      
      // Add to scanned parcels
      setScannedParcels(prev => [...prev, parcel.id]);
      setScanMessage(`✅ ${parcel.recipient_name || parcel.destination || 'Colis'} scanné avec succès`);
      
      // Call the parent handler
      if (onScan) {
        onScan(parcel.id, barcode);
      }
      
      // Clear message after short delay
      setTimeout(() => {
        setScanMessage("");
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error scanning parcel:', error);
      setScanMessage("❌ Erreur lors du scan");
    }
  };

  const handleManualAdd = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
      setManualCode("");
    }
  };

  const handleRemove = (parcelId) => {
    setScannedParcels(prev => prev.filter(id => id !== parcelId));
  };

  const handleComplete = () => {
    if (onClose) {
      onClose(scannedParcels);
    }
  };

  const totalParcels = mission?.parcels?.length || 0;
  const progressPercentage = totalParcels > 0 ? (scannedParcels.length / totalParcels) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Scanner les colis - Mission #{mission?.mission_number || mission?.id}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mission Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Expéditeur:</span> {mission?.shipper?.name || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Adresse:</span> {mission?.shipper?.address || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Colis:</span> {totalParcels}
          </div>
          <div>
            <span className="font-semibold">Scannés:</span> {scannedParcels.length}
          </div>
        </div>
      </div>

      {/* Scanning Controls */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={scanning ? stopScan : startScan}
          className={`px-4 py-2 rounded-md font-semibold text-white ${
            scanning ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {scanning ? "Arrêter le scan" : "Scanner avec caméra"}
        </button>
        <form onSubmit={handleManualAdd} className="flex space-x-2 flex-1">
          <input
            type="text"
            placeholder="Entrez le code-barres manuellement..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
          >
            Ajouter
          </button>
        </form>
      </div>

      {/* Error and Status Messages */}
      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}
      
      {scanMessage && (
        <div className={`p-3 rounded-lg text-sm ${
          scanMessage.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' :
          scanMessage.includes('⚠️') ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
          'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {scanMessage}
        </div>
      )}

      {/* Camera Scanner */}
      <div className="mb-4">
        <div 
          id="livreur-qr-reader" 
          ref={scannerRef} 
          className="mx-auto" 
          style={{ width: 300, display: scanning ? 'block' : 'none' }} 
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-blue-800">Progression du scan</span>
          <span className="text-sm text-blue-600">
            {scannedParcels.length} / {totalParcels}
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="text-center mt-2 text-sm text-blue-600">
          {progressPercentage.toFixed(0)}% terminé
        </div>
      </div>

      {/* Parcels List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Colis de la mission</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {mission?.parcels?.map((parcel) => {
            const isScanned = scannedParcels.includes(parcel.id);
            return (
              <div 
                key={parcel.id} 
                className={`p-3 rounded-lg border ${
                  isScanned 
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
                      {isScanned && (
                        <span className="text-green-600 text-lg">✅</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {parcel.destination || 'Destination non spécifiée'}
                    </div>
                    {parcel.tracking_number && (
                      <div className="text-xs text-gray-500 mt-1 font-mono">
                        Code: {parcel.tracking_number}
                      </div>
                    )}
                    {!isScanned && (
                      <div className="text-xs text-blue-600 mt-1 font-medium">
                        ⚠️ Scanner ce colis
                      </div>
                    )}
                  </div>
                  {isScanned && (
                    <button
                      onClick={() => handleRemove(parcel.id)}
                      className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 rounded"
                    >
                      Retirer
                    </button>
                  )}
                </div>
              </div>
            );
          }) || (
            <div className="text-gray-500 text-sm">Aucun colis associé à cette mission</div>
          )}
        </div>
      </div>

      {/* Complete Button */}
      {scannedParcels.length === totalParcels && totalParcels > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleComplete}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg"
          >
            ✅ Terminer le scanning - Mission Enlevé
          </button>
        </div>
      )}
    </div>
  );
};

export default LivreurBarcodeScan; 