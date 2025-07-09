import React, { useRef } from "react";
import Barcode from "react-barcode";
import html2pdf from "html2pdf.js";

const FactureColis = ({
  colis = {},
  client = {},
  expediteur = {},
  prix = {},
  note = ""
}) => {
  const factureRef = useRef();

  const handleExportPDF = () => {
    if (factureRef.current) {
      html2pdf().set({
        margin: 0.5,
        filename: `Facture_${colis.code || "colis"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" }
      }).from(factureRef.current).save();
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow max-w-3xl mx-auto" ref={factureRef} style={{ fontFamily: 'Arial, sans-serif', color: '#222' }}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <img src="/images/quickzonelogo.png" alt="QuickZone" style={{ height: 48 }} />
          <div className="text-lg font-bold">QUICKZONE delivery</div>
        </div>
        <div className="flex flex-col items-end">
          {colis.code && (
            <Barcode value={colis.code} width={1.5} height={40} fontSize={12} margin={0} />
          )}
        </div>
      </div>
      <div className="flex justify-between items-center mb-2">
        <div className="text-2xl font-bold">Facture</div>
        <div className="text-sm text-gray-600">Pour assistance, appelez : +216 28 563 115</div>
      </div>
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <div className="font-semibold mb-2">Détails du Colis {colis.fragile && <span className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded">FRAGILE</span>}</div>
          <div className="text-sm">
            <div><b>Nom du Colis :</b> {colis.nom || "-"}</div>
            <div><b>Nom du Client :</b> {client.nom || "-"}</div>
            <div><b>Téléphone du Client :</b> {client.tel || "-"}</div>
            <div><b>Adresse de Livraison :</b> {colis.adresse || "-"}</div>
            <div><b>Poids :</b> {colis.poids || "-"} kg</div>
            {note && <div><b>Note :</b> {note}</div>}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Détails du Expéditeur</div>
          <div className="text-sm">
            <div><b>Numéro d’Immatriculation Fiscale :</b> {expediteur.nif || "-"}</div>
            <div><b>Numéro de Téléphone :</b> {expediteur.tel || "-"}</div>
            <div><b>Nom de société :</b> {expediteur.societe || "-"}</div>
            <div><b>Nom et prénom :</b> {expediteur.nom || "-"}</div>
            <div><b>Adresse :</b> {expediteur.adresse || "-"}</div>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="font-semibold mb-2">Détails des Prix</div>
        <table className="w-full text-sm border border-gray-200">
          <tbody>
            <tr>
              <td>Coût de Livraison de Base</td>
              <td className="text-right">{prix.livraisonBase || "0.00 DT"}</td>
            </tr>
            <tr>
              <td>Coûts Supplémentaires (Poids)</td>
              <td className="text-right">{prix.suppPoids || "0.00 DT"}</td>
            </tr>
            <tr>
              <td>Coûts Supplémentaires (Livraison Rapide)</td>
              <td className="text-right">{prix.suppRapide || "0.00 DT"}</td>
            </tr>
            <tr className="font-bold">
              <td>Total Frais de Livraison</td>
              <td className="text-right">{prix.totalLivraison || "0.00 DT"}</td>
            </tr>
            <tr>
              <td>Total HT</td>
              <td className="text-right">{prix.ht || "0.00 DT"}</td>
            </tr>
            <tr>
              <td>TVA (7%)</td>
              <td className="text-right">{prix.tva || "0.00 DT"}</td>
            </tr>
            <tr>
              <td>Prix colis</td>
              <td className="text-right">{prix.prixColis || "0.00 DT"}</td>
            </tr>
            <tr className="font-bold text-lg">
              <td>Total TTC</td>
              <td className="text-right">{prix.ttc || "0.00 DT"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        onClick={handleExportPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold mt-4 print:hidden"
      >
        Exporter en PDF
      </button>
    </div>
  );
};

export default FactureColis; 