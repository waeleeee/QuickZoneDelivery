import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Administration" // Default role
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: "Administration", label: "Administration", description: "Accès complet à tous les modules" },
    { value: "Commercial", label: "Commercial", description: "Gestion des clients et ventes" },
    { value: "Finance", label: "Finance", description: "Gestion financière et comptabilité" },
    { value: "Chef d'agence", label: "Chef d'agence", description: "Gestion opérationnelle de l'agence" },
    { value: "Membre de l'agence", label: "Membre de l'agence", description: "Opérations quotidiennes" },
    { value: "Livreurs", label: "Livreurs", description: "Missions de livraison" },
    { value: "Expéditeur", label: "Expéditeur (Client)", description: "Suivi des colis et paiements" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create user object based on selected role
      const user = {
        id: Date.now(),
        name: `Utilisateur ${formData.role}`,
        email: formData.email || `user@${formData.role.toLowerCase().replace(' ', '')}.com`,
        role: formData.role,
        avatar: `https://ui-avatars.com/api/?name=${formData.role}&background=dc2626&color=fff`
      };

      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('isLoggedIn', 'true');

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setFormData(prev => ({
      ...prev,
      role,
      email: `user@${role.toLowerCase().replace(' ', '')}.com`
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/images/quickzonelogo.png" alt="QuickZone" className="h-16 w-auto" />
          </div>
          <p className="mt-2 text-gray-600">Système de Gestion</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Connexion</h3>
            <p className="text-gray-600 mt-1">Sélectionnez votre rôle pour tester l'application</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Sélectionner un rôle *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleChange(role.value)}
                    className={`p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                      formData.role === role.value
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{role.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="user@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.role}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading || !formData.role
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                `Se connecter en tant que ${formData.role}`
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Mode Démonstration</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Sélectionnez différents rôles pour tester les permissions d'accès dans le dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 QuickZone. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 