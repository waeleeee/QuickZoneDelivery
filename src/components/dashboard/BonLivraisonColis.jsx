import React, { useRef } from "react";
import Barcode from "react-barcode";
import html2pdf from "html2pdf.js";

const BonLivraisonColis = ({
  colis = {},
  expediteur = {},
  destinataire = {},
  route = "Sousse >> ---- Dispatch ---- >> Mednine",
  date = "2025-06-13",
  docNumber = "518138215801",
  instructions = "",
  montant = "68,000 DT",
  tva = "0.471 DT",
  quantite = 1,
  designation = "Coli",
  pageCount = 2,
  pageIndex = 1,
}) => {
  const ref = useRef();
  // Hide the export button during PDF export
  const exportBtnRef = useRef();

  const handleExportPDF = () => {
    if (ref.current) {
      // Hide the button before export
      if (exportBtnRef.current) exportBtnRef.current.style.display = "none";
      html2pdf().set({
        margin: 0.5,
        filename: `Bon_Livraison_${colis.code || docNumber}.pdf`,
        html2canvas: { scale: 2 },
        // Export as A5 size
        jsPDF: { unit: "in", format: "a5", orientation: "portrait" }
      }).from(ref.current).save().then(() => {
        // Show the button again after export
        if (exportBtnRef.current) exportBtnRef.current.style.display = "";
      });
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white p-8 rounded-xl shadow mx-auto border border-gray-300"
      style={{ fontFamily: 'Arial, sans-serif', color: '#222', minWidth: 420, maxWidth: 600, width: '100%' }}
    >
      {/* Header with logo only */}
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src="/images/quickzonelogo.png" alt="QuickZone" style={{ height: 48 }} />
        </div>
        <div className="text-xs text-right text-gray-700 font-semibold">
          <div>Date : {date}</div>
          <div className="mt-1">Bon de Livraison N° <span className="font-bold">{docNumber}</span></div>
        </div>
      </div>
      {/* Company info */}
      <div className="text-xs text-gray-600 mb-2">
        Sarl Capital Social 1 000 000DT MF 1609221Y/A/M000 Adresse : N°39 rue 8601, zone industrielle Charguia 1 - Tunis 2035<br />
        Soc. transport terrestre de tous produits non réglementés pour le compte d'autrui.
      </div>
      {/* Barcode and S1/2 */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col items-start">
          <Barcode value={colis.code || docNumber} width={1.5} height={40} fontSize={12} margin={0} />
          <div className="text-xs font-bold mt-1">{docNumber}</div>
        </div>
        <div className="font-bold text-base ml-2 border border-gray-400 rounded px-3 py-1 bg-gray-50">S{pageIndex}/{pageCount}</div>
      </div>
      {/* Expéditeur & Destinataire Info */}
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="font-semibold mb-1 text-gray-700">Expéditeur</div>
          <div className="text-sm">
            <b>Nom:</b> {expediteur.nom || "Bon Prix Sousse"}<br />
            <b>Adresse:</b> {expediteur.adresse || "sousse"}<br />
            <b>Téléphone:</b> {expediteur.tel || "23814555"}<br />
            <b>Matricule Fiscal / CIN:</b> {expediteur.nif || "1678798WNM000"}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="font-semibold mb-1 text-gray-700">Destinataire</div>
          <div className="text-sm">
            <b>Nom:</b> {destinataire.nom || "-"}<br />
            <b>Adresse:</b> {destinataire.adresse || "-"}<br />
            <b>Téléphone:</b> {destinataire.tel || "-"}
          </div>
        </div>
      </div>
      {/* Route */}
      <div className="text-center font-bold text-lg my-2 py-1 bg-gray-100 rounded border border-gray-200">{route}</div>
      {/* Colis Content Table */}
      <table className="w-full text-sm border border-gray-400 mb-1 bg-white rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-2 py-1">Désignation-Contenu du colis</th>
            <th className="border border-gray-400 px-2 py-1">Quantité</th>
            <th className="border border-gray-400 px-2 py-1">Montant TTC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 px-2 py-1">{designation}</td>
            <td className="border border-gray-400 px-2 py-1 text-center">{quantite}</td>
            <td className="border border-gray-400 px-2 py-1 text-right">{montant}</td>
          </tr>
        </tbody>
      </table>
      <div className="text-xs mb-2">Dont TVA 7% {tva}</div>
      {/* Instructions and Signature */}
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs border border-gray-400 p-2 w-2/3 rounded bg-gray-50">
          <b>Instructions diverses :</b><br />
          {instructions || "-"}
        </div>
        <div className="text-xs border border-gray-400 p-2 w-1/3 text-center rounded bg-gray-50">
          <b>Signature expéditeur:</b>
          <div style={{ height: 32 }}></div>
        </div>
      </div>
      {/* Export PDF Button (hidden in print/pdf) */}
      <button
        ref={exportBtnRef}
        onClick={handleExportPDF}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold mt-6 no-print print:hidden"
        style={{ display: "" }}
      >
        Exporter en PDF
      </button>
    </div>
  );
};

export default BonLivraisonColis; 