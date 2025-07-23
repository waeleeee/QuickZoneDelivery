import React, { useRef } from "react";
import Barcode from "react-barcode";
import html2pdf from "html2pdf.js";

const FactureColis = ({
  colis = [],
  expediteur = {},
  prix = {},
  note = "",
  invoiceNumber = "",
  invoiceDate = ""
}) => {
  const factureRef = useRef();

  const handleExportPDF = () => {
    if (factureRef.current) {
      html2pdf().set({
        margin: 0.5,
        filename: `Facture_${invoiceNumber || "colis"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      }).from(factureRef.current).save();
    }
  };

  // Calculate totals
  const totalColis = colis.length;
  const totalLivres = colis.filter(c => c.status === 'Livré').length;
  const totalRetour = colis.filter(c => c.status === 'Retour').length;
  const totalAmount = colis.reduce((sum, c) => sum + (parseFloat(c.prix) || 0), 0);
  
  // Calculate QuickZone amount (delivery fees + return fees)
  // Based on the example: 3 livrés × 8 TND = 24 TND, 2 retour × 4 TND = 8 TND
  const deliveryFees = totalLivres * 8; // 8 TND per delivered parcel
  const returnFees = totalRetour * 4;   // 4 TND per returned parcel
  const quickZoneAmount = deliveryFees + returnFees;
  
  // Calculate shipper amount following the real business logic
  // Total amount collected from clients = totalAmount (124,000 TND in example)
  // QuickZone keeps the delivery/return fees (32,000 TND in example)
  // Remaining amount goes to expéditeur (92,000 TND in example)
  const amountForExpediteur = totalAmount - quickZoneAmount;
  
  // Calculate taxes on the expéditeur amount
  const packageAmountHT = amountForExpediteur * 0.93; // 93% of amount (HT)
  const vatAmount = packageAmountHT * 0.07;           // 7% VAT on HT amount
  const packageAmountTTC = packageAmountHT + vatAmount;
  const withholdingTax = packageAmountTTC * (expediteur.id_type === 'patente' ? 0.01 : 0.03);
  const stampAmount = 1; // 1 TND stamp
  const shipperTotal = packageAmountTTC - withholdingTax + stampAmount;

  // Function to get agency information based on expéditeur location
  const getAgencyInfo = (expediteur) => {
    const governorate = expediteur.governorate || expediteur.company_governorate || '';
    const governorateLower = governorate.toLowerCase();
    
    if (governorateLower.includes('tunis') || governorateLower.includes('ariana') || 
        governorateLower.includes('ben arous') || governorateLower.includes('manouba')) {
      return {
        name: 'Agence Grand Tunis',
        address: 'نهج جمال برج الوزير 2036 سكرة اريانة',
        phone: '+216 24 581 115',
        email: 'grandTunis@quickzone.tn',
        hours: 'Lun-Ven: 8h-18h'
      };
    } else if (governorateLower.includes('monastir') || governorateLower.includes('sousse') || 
               governorateLower.includes('mahdia') || governorateLower.includes('kairouan')) {
      return {
        name: 'Agence Sahel',
        address: 'قصيبة الميدوني المنستير',
        phone: '+216 28 649 115',
        email: 'sahel@quickzone.tn',
        hours: 'Lun-Ven: 8h-18h'
      };
    } else if (governorateLower.includes('sfax') || governorateLower.includes('gabes') || 
               governorateLower.includes('medenine') || governorateLower.includes('tataouine')) {
      return {
        name: 'Agence Centrale',
        address: 'طريق المهدية قصاص بوعلي صفاقس',
        phone: '+216 28 839 115',
        email: 'sfax@quickzone.tn',
        hours: 'Lun-Ven: 8h-18h'
      };
    } else {
      // Default to Direction Générale
      return {
        name: 'Direction Générale',
        address: 'QuickZone Headquarters',
        phone: '+216 28 681 115',
        email: 'pdg@quickzone.tn',
        hours: 'Lun-Ven: 8h-18h'
      };
    }
  };

  const agencyInfo = getAgencyInfo(expediteur);

  return (
    <div className="bg-white p-8 rounded shadow max-w-4xl mx-auto" ref={factureRef} style={{ fontFamily: 'Arial, sans-serif', color: '#222' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-3">
          <img src="/images/quickzonelogo.png" alt="QuickZone" style={{ height: 60 }} />
        </div>
        <div className="flex flex-col items-end">
          <div className="text-lg font-bold">Facture</div>
          <div className="text-sm text-gray-600">REF-{invoiceNumber}</div>
          {invoiceNumber && (
            <Barcode value={invoiceNumber} width={1.5} height={40} fontSize={12} margin={0} />
          )}
        </div>
      </div>

      {/* Company and Shipper Details */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <div className="font-semibold mb-2">{agencyInfo.name}</div>
          <div className="text-sm">
            <div><b>Adresse:</b> {agencyInfo.address}</div>
            <div><b>Numéro de Téléphone:</b> {agencyInfo.phone}</div>
            <div><b>Email:</b> {agencyInfo.email}</div>
            <div><b>Horaires:</b> {agencyInfo.hours}</div>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Détails du Expéditeur</div>
          <div className="text-sm">
            <div><b>Nom de société:</b> {expediteur.company_name || expediteur.name || "N/A"}</div>
            <div><b>Nom et prénom:</b> {expediteur.name || "N/A"}</div>
            <div><b>Numéro d'Immatriculation Fiscale:</b> {expediteur.fiscal_number || expediteur.tax_number || "N/A"}</div>
            <div><b>Adresse:</b> {expediteur.address || expediteur.company_address || "Adresse non spécifiée"}</div>
            <div><b>Gouvernorat:</b> {expediteur.governorate || expediteur.company_governorate || "N/A"}</div>
            <div><b>Numéro de Téléphone:</b> {expediteur.phone || "N/A"}</div>
            <div><b>Email:</b> {expediteur.email || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Delivery Summary */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Récapitulatif des Livraisons</div>
        <table className="w-full text-sm border border-gray-200 mb-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left">Date Livraison</th>
              <th className="border border-gray-200 px-3 py-2 text-center">NB Colis</th>
              <th className="border border-gray-200 px-3 py-2 text-center">Total</th>
              <th className="border border-gray-200 px-3 py-2 text-center">Livrés</th>
              <th className="border border-gray-200 px-3 py-2 text-center">Retour</th>
              <th className="border border-gray-200 px-3 py-2 text-center">Montant Quick Zone</th>
              <th className="border border-gray-200 px-3 py-2 text-center">Montant Expéditeur</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-3 py-2">{invoiceDate}</td>
              <td className="border border-gray-200 px-3 py-2 text-center">{totalColis}</td>
              <td className="border border-gray-200 px-3 py-2 text-center">{totalColis}</td>
              <td className="border border-gray-200 px-3 py-2 text-center">{totalLivres}</td>
              <td className="border border-gray-200 px-3 py-2 text-center">{totalRetour}</td>
              <td className="border border-gray-200 px-3 py-2 text-center">{quickZoneAmount.toFixed(3)} TND</td>
              <td className="border border-gray-200 px-3 py-2 text-center">{shipperTotal.toFixed(3)} TND</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <div className="font-semibold mb-2">Quick Zone</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Sous-total:</span>
              <span>{totalAmount.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between">
              <span>Frais de livraison:</span>
              <span>{deliveryFees.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between">
              <span>Frais de retour:</span>
              <span>{returnFees.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total TTC Quick Zone:</span>
              <span className="text-red-600">-{quickZoneAmount.toFixed(3)} TND</span>
            </div>
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">MONTANT EXPIDITEUR TOTAL</div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Montant Les colis: HT</span>
              <span>{packageAmountHT.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between">
              <span>TOTAL TVA 7%</span>
              <span>{vatAmount.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between">
              <span>Montant les colis: TTC</span>
              <span>{packageAmountTTC.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between">
              <span>Retenu a la source {expediteur.id_type === 'patente' ? '1%' : '3%'}</span>
              <span>-{withholdingTax.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between">
              <span>Montant Timbre</span>
              <span>-{stampAmount.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1">
              <span>MONTANT EXPIDITEUR TOTAL:</span>
              <span>{shipperTotal.toFixed(3)} TND</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Areas */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border-2 border-gray-300 p-4">
          <div className="font-semibold mb-2">{agencyInfo.name}</div>
          <div className="text-sm space-y-2">
            <div>Signature: _________________</div>
            <div>Date: {invoiceDate}</div>
            <div>Admin</div>
            <div>Processor</div>
            <div className="mt-4">Cachet</div>
          </div>
        </div>
        <div className="border-2 border-gray-300 p-4">
          <div className="font-semibold mb-2">Signature et cache</div>
          <div className="text-sm space-y-2">
            <div>Expéditeur</div>
            <div>Signature: _________________</div>
            <div>Date: {invoiceDate}</div>
            <div>{expediteur.name || "N/A"}</div>
            <div className="mt-4">Cachet</div>
          </div>
        </div>
      </div>

      {/* Parcel Details - Moved to the end */}
      <div className="mt-8">
        <div className="font-semibold mb-2">Détails des Colis + livraison</div>
        <table className="w-full text-sm border border-gray-200 mb-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-3 py-2 text-left">Date</th>
              <th className="border border-gray-200 px-3 py-2 text-left">Etat</th>
              <th className="border border-gray-200 px-3 py-2 text-left">Code</th>
              <th className="border border-gray-200 px-3 py-2 text-left">Client</th>
              <th className="border border-gray-200 px-3 py-2 text-left">Désignation</th>
              <th className="border border-gray-200 px-3 py-2 text-left">Gouvernorat</th>
              <th className="border border-gray-200 px-3 py-2 text-right">Prix</th>
            </tr>
          </thead>
          <tbody>
            {colis.map((parcel, index) => (
              <tr key={index}>
                <td className="border border-gray-200 px-3 py-2">{parcel.date || invoiceDate}</td>
                <td className="border border-gray-200 px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    parcel.status === 'Livré' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {parcel.status}
                  </span>
                </td>
                <td className="border border-gray-200 px-3 py-2 font-mono">{parcel.code}</td>
                <td className="border border-gray-200 px-3 py-2">{parcel.client_name} ({parcel.client_phone})</td>
                <td className="border border-gray-200 px-3 py-2">{parcel.designation}</td>
                <td className="border border-gray-200 px-3 py-2">{parcel.governorate}</td>
                <td className="border border-gray-200 px-3 py-2 text-right">{parseFloat(parcel.prix).toFixed(3)} TND</td>
              </tr>
            ))}
            <tr className="font-bold">
              <td colSpan="6" className="border border-gray-200 px-3 py-2">Total ({totalColis} colis)</td>
              <td className="border border-gray-200 px-3 py-2 text-right">{totalAmount.toFixed(3)} TND</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        onClick={handleExportPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold mt-6 print:hidden"
      >
        Exporter en PDF
      </button>
    </div>
  );
};

export default FactureColis; 