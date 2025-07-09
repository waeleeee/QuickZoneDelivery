import React from "react";

const timelineData = [
  {
    date: "2025-06-13 14:32",
    label: "En attente",
    city: "Sousse",
    status: "en_attente",
    icon: "clock",
    emoji: "⏳",
    color: "yellow",
    comment: "Colis enregistré dans le système."
  },
  {
    date: "2025-06-13 20:46",
    label: "Au dépôt",
    city: "Sousse",
    status: "au_depot",
    icon: "box",
    emoji: "📦",
    color: "blue",
    comment: "Colis reçu au dépôt de Sousse."
  },
  {
    date: "2025-06-14 08:16",
    label: "En cours",
    city: "Bizerte",
    status: "en_cours",
    icon: "truck",
    emoji: "🚚",
    color: "purple",
    comment: "Colis en cours de livraison."
  },
  {
    date: "2025-06-14 14:29",
    label: "Livés",
    city: "Bizerte",
    status: "livre",
    icon: "check",
    emoji: "✅",
    color: "green",
    comment: "Colis livré au client."
  },
  {
    date: "2025-06-17 15:46",
    label: "Livrés payés",
    city: "Bizerte",
    status: "paye",
    icon: "euro",
    emoji: "💶",
    color: "emerald",
    comment: "Paiement reçu."
  },
];

const colorMap = {
  yellow: "bg-yellow-400 text-yellow-700 border-yellow-400",
  blue: "bg-blue-400 text-blue-700 border-blue-400",
  purple: "bg-purple-400 text-purple-700 border-purple-400",
  orange: "bg-orange-400 text-orange-700 border-orange-400",
  green: "bg-green-400 text-green-700 border-green-400",
  emerald: "bg-emerald-400 text-emerald-700 border-emerald-400",
  red: "bg-red-400 text-red-700 border-red-400",
  pink: "bg-pink-400 text-pink-700 border-pink-400",
  gray: "bg-gray-400 text-gray-700 border-gray-400",
  indigo: "bg-indigo-400 text-indigo-700 border-indigo-400",
  cyan: "bg-cyan-400 text-cyan-700 border-cyan-400",
};

const icons = {
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"/></svg>
  ),
  box: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3v4M8 3v4"/></svg>
  ),
  truck: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a2 2 0 01-2 2h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  ),
  delivery: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a2 2 0 01-2 2h-1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
  ),
  euro: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
  ),
};

const handleExport = () => {
  window.print();
};

const ColisTimeline = ({ parcel, onClose }) => {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header du modal avec titre, bouton download et fermer (masqué à l'impression) */}
      <div className="flex justify-between items-center mb-2 print:hidden">
        <h2 className="text-xl font-bold">Historique du colis {parcel?.id || "Colis"}</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-white hover:bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-semibold shadow border border-blue-200 transition"
          >
            Télécharger la timeline
          </button>
          <button onClick={onClose} className="bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow border border-gray-200 transition">×</button>
        </div>
      </div>
      {/* Carte infos colis */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-wrap justify-between items-center gap-4">
        <div className="text-sm text-gray-700 min-w-[180px]">
          <div><b>Client:</b> {parcel?.shipper || "-"}</div>
          <div><b>Montant:</b> {parcel?.price || "-"}</div>
          <div><b>Téléphone:</b> 52 097 552</div>
        </div>
        <div className="text-sm text-gray-700 text-right min-w-[180px]">
          <div><b>Adresse:</b> {parcel?.destination || "-"}</div>
          <div><b>Désignation:</b> Colis</div>
          <div><b>Nombre des articles:</b> 1</div>
        </div>
      </div>
      {/* Timeline centrée premium */}
      <div className="flex justify-center">
        <div className="relative flex flex-col items-center w-full max-w-lg">
          {/* Ligne verticale premium */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-100 via-gray-200 to-green-100 z-0 rounded-full"></div>
          {timelineData.map((step, idx) => (
            <div key={idx} className="relative flex w-full min-h-[80px]">
              {/* Colonne gauche : date + icône + emoji */}
              <div className="flex flex-col items-end justify-center w-1/3 pr-4">
                <span className="text-xs text-gray-400 font-mono mb-1">{step.date}</span>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-4 border-white shadow-lg ${colorMap[step.color]} text-white text-base font-bold z-10`}>
                  <span className="mr-1">{step.emoji}</span>{icons[step.icon]}
                </div>
              </div>
              {/* Colonne droite : badge/statut/ville/commentaire */}
              <div className="flex-1 flex flex-col justify-center pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-opacity-20 border ${colorMap[step.color]} border-opacity-30`}>{step.label}</span>
                  <span className="text-xs text-gray-500 font-semibold">{step.city}</span>
                </div>
                <div className="text-xs text-gray-600 mb-1">{step.comment}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColisTimeline; 