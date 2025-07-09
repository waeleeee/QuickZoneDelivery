import React, { useState } from "react";
import DataTable from "./common/DataTable";
import Modal from "./common/Modal";

const initialChefs = [
  {
    id: "CHEF001",
    name: "Amine Gharbi",
    email: "amine.gharbi@quickzone.tn",
    phone: "+216 20 123 456",
    address: "Rue de la République, Tunis",
    agence: "Tunis",
  },
  {
    id: "CHEF002",
    name: "Sonia Ben Salah",
    email: "sonia.bensalah@quickzone.tn",
    phone: "+216 98 654 321",
    address: "Avenue de la Liberté, Sousse",
    agence: "Sousse",
  },
];

const agenceOptions = [
  { value: "Tunis", label: "Tunis" },
  { value: "Sousse", label: "Sousse" },
  { value: "Sfax", label: "Sfax" },
];

const mockMembers = [
  { id: 1, name: "Pierre Dubois", email: "pierre.membre@email.com", phone: "+33 1 23 45 67 89", role: "Responsable d'agence", agence: "Tunis" },
  { id: 2, name: "Sarah Ahmed", email: "sarah.membre@email.com", phone: "+33 1 98 76 54 32", role: "Agent d'accueil", agence: "Tunis" },
  { id: 3, name: "Mohamed Ali", email: "mohamed.membre@email.com", phone: "+33 1 11 22 33 44", role: "Gestionnaire de stock", agence: "Sousse" },
  { id: 4, name: "Emma Rousseau", email: "emma.membre@email.com", phone: "+33 6 99 88 77 66", role: "Livreur", agence: "Sousse" },
  { id: 5, name: "Fatima Benali", email: "fatima.membre@email.com", phone: "+33 6 77 66 55 44", role: "Agent de tri", agence: "Sfax" },
];

const ChefAgence = () => {
  const [chefs, setChefs] = useState(initialChefs);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editChef, setEditChef] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedChef, setSelectedChef] = useState(null);
  const [members, setMembers] = useState(mockMembers);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', phone: '', address: '', role: '', agence: '' });
  const [addingMember, setAddingMember] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState('add'); // 'add' or 'edit'
  const [searchMember, setSearchMember] = useState("");

  const handleAddChef = () => {
    setEditChef({
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      agence: 'Tunis',
    });
    setShowEditModal(true);
  };

  const handleEditChef = (chef) => {
    setEditChef({ ...chef });
    setShowEditModal(true);
  };

  const handleSaveChef = (e) => {
    e.preventDefault();
    if (editChef.id && chefs.some(c => c.id === editChef.id)) {
      setChefs(chefs.map(c => c.id === editChef.id ? editChef : c));
    } else {
      setChefs([
        ...chefs,
        { ...editChef, id: `CHEF${chefs.length + 1}` }
      ]);
    }
    setShowEditModal(false);
    setEditChef(null);
  };

  const handleDeleteChef = (chef) => {
    setChefs(chefs.filter(c => c.id !== chef.id));
  };

  const handleViewEmployees = (chef) => {
    setSelectedChef(chef);
    setShowMembersModal(true);
  };

  const handleAddMember = () => {
    setMemberForm({ name: '', email: '', phone: '', address: '', role: '', agence: selectedChef.agence });
    setMemberModalMode('add');
    setShowMemberModal(true);
  };
  const handleEditMember = (member) => {
    setMemberForm(member);
    setMemberModalMode('edit');
    setShowMemberModal(true);
  };
  const handleSaveMember = (e) => {
    e.preventDefault();
    if (memberModalMode === 'edit') {
      setMembers(members.map(m => m.id === memberForm.id ? { ...memberForm } : m));
    } else {
      setMembers([...members, { ...memberForm, id: Date.now(), agence: selectedChef.agence }]);
    }
    setShowMemberModal(false);
    setMemberForm({ name: '', email: '', phone: '', address: '', role: '', agence: '' });
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nom et prénom" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Téléphone" },
    { key: "address", header: "Adresse" },
    { key: "agence", header: "Agence" },
    {
      key: "actions",
      header: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewEmployees(row)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
            title="Voir les employés de chaque agence"
          >
            {/* Eye SVG from Commercial.jsx */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleEditChef(row)}
            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
            title="Modifier"
          >
            {/* Edit SVG from Commercial.jsx */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteChef(row)}
            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            {/* Delete SVG from Commercial.jsx */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const filteredChefs = chefs.filter(c =>
    Object.values(c).some(value => String(value).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des chefs d’agence</h1>
        <button
          onClick={handleAddChef}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          Ajouter chefs d’agence
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border">
        <DataTable
          data={filteredChefs}
          columns={columns}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showActions={false}
        />
      </div>
      {/* Modal for Add/Edit Chef d'agence */}
      {showEditModal && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="md">
          <form onSubmit={handleSaveChef} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-left">Nom et prénom</label>
              <input type="text" className="border rounded px-2 py-1 w-full" value={editChef.name || ''} onChange={e => setEditChef({ ...editChef, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Email</label>
              <input type="email" className="border rounded px-2 py-1 w-full" value={editChef.email || ''} onChange={e => setEditChef({ ...editChef, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Téléphone</label>
              <input type="text" className="border rounded px-2 py-1 w-full" value={editChef.phone || ''} onChange={e => setEditChef({ ...editChef, phone: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Adresse</label>
              <input type="text" className="border rounded px-2 py-1 w-full" value={editChef.address || ''} onChange={e => setEditChef({ ...editChef, address: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-left">Agence</label>
              <select className="border rounded px-2 py-1 w-full" value={editChef.agence || 'Tunis'} onChange={e => setEditChef({ ...editChef, agence: e.target.value })} required>
                {agenceOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowEditModal(false)}>Annuler</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Enregistrer</button>
            </div>
          </form>
        </Modal>
      )}
      {/* Modal for Members of Agency */}
      {showMembersModal && selectedChef && (
        <Modal isOpen={showMembersModal} onClose={() => { setShowMembersModal(false); setEditingMemberId(null); setAddingMember(false); }} size="xxl">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-blue-800">Membres de l'agence {selectedChef.agence}</h2>
              <span className="text-lg text-gray-600">{members.filter(m => m.agence === selectedChef.agence).length} membre(s)</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                placeholder="Rechercher par nom, email ou rôle..."
                value={searchMember}
                onChange={e => setSearchMember(e.target.value)}
                className="w-1/2 px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-800"
              />
              <button
                onClick={handleAddMember}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded shadow-md text-sm"
              >
                Ajouter un membre
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-blue-100 bg-blue-50">
              <table className="min-w-full divide-y divide-blue-200">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Nom et prénom</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Téléphone</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Agence</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Rôle</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {members.filter(m => m.agence === selectedChef.agence && (
                    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
                    m.email.toLowerCase().includes(searchMember.toLowerCase()) ||
                    m.role.toLowerCase().includes(searchMember.toLowerCase())
                  )).length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-blue-400 text-lg">Aucun membre trouvé pour cette agence.</td></tr>
                  ) : null}
                  {members.filter(m => m.agence === selectedChef.agence && (
                    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
                    m.email.toLowerCase().includes(searchMember.toLowerCase()) ||
                    m.role.toLowerCase().includes(searchMember.toLowerCase())
                  )).map(member => (
                    <tr key={member.id} className="hover:bg-blue-50">
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 text-left">{member.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-gray-900 text-left">{member.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 text-left">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 text-left">{member.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 text-left">{member.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 text-left">{member.agence}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 text-left">{member.role}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditMember(member)}
                          className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                          title="Modifier"
                        >
                          {/* Edit SVG */}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button
                          onClick={() => setMembers(members.filter(m => m.id !== member.id))}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          {/* Delete SVG */}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Modal for Add/Edit Member */}
          {showMemberModal && (
            <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} size="xxl">
              <form onSubmit={handleSaveMember} className="space-y-6 bg-white rounded-2xl shadow-2xl p-8 border-t-8 border-blue-600">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-blue-700 mb-2">{memberModalMode === 'edit' ? 'Modifier le membre d\'agence' : 'Ajouter membres d\'agence'}</h2>
                  <p className="text-gray-500">Veuillez remplir les informations du membre d'agence.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1 text-left">Nom et prénom</label>
                    <input type="text" className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition" value={memberForm.name || ''} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1 text-left">Email</label>
                    <input type="email" className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition" value={memberForm.email || ''} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1 text-left">Téléphone</label>
                    <input type="text" className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition" value={memberForm.phone || ''} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1 text-left">Adresse</label>
                    <input type="text" className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition" value={memberForm.address || ''} onChange={e => setMemberForm({ ...memberForm, address: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1 text-left">Agence</label>
                    <select className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition" value={memberForm.agence || 'Tunis'} onChange={e => setMemberForm({ ...memberForm, agence: e.target.value })} required>
                      <option value="Tunis">Tunis</option>
                      <option value="Sousse">Sousse</option>
                      <option value="Sfax">Sfax</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-1 text-left">Rôle</label>
                    <input type="text" className="border-2 border-blue-200 rounded-lg px-4 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition" value={memberForm.role || ''} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} required />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-8">
                  <button type="button" className="px-6 py-2 border-2 border-blue-500 text-blue-600 font-semibold rounded-lg bg-white hover:bg-blue-50 transition" onClick={() => setShowMemberModal(false)}>Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold rounded-lg shadow hover:scale-105 transition-transform">Enregistrer</button>
                </div>
              </form>
            </Modal>
          )}
        </Modal>
      )}
    </div>
  );
};

export default ChefAgence; 