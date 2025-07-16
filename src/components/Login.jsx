import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use mock API login
      const loginData = await apiService.login({
        email: formData.email,
        password: formData.password
      });

      // Check if login was successful
      if (loginData && loginData.success) {
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        setError('Erreur de connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(""); // Clear error when user types
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
            <p className="text-gray-600 mt-1">Connectez-vous à votre compte QuickZone</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="admin@quickzone.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
                loading || !formData.email || !formData.password
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
                'Se connecter'
              )}
            </button>
          </form>

          {/* Login Info */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">Connexion Sécurisée</h4>
                <p className="text-sm text-green-700 mt-1">
                  Utilisez vos identifiants pour accéder au système de gestion QuickZone.
                </p>
              </div>
            </div>
          </div>

          {/* Test Credentials for Development */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">Comptes de Test</h4>
                <div className="text-xs text-blue-700 mt-1 space-y-1">
                  <div><strong>Admin:</strong> admin@quickzone.tn / admin123</div>
                  <div><strong>Commercial:</strong> pierre@quickzone.tn / pierre123</div>
                  <div><strong>Finance:</strong> claude@quickzone.tn / claude123</div>
                  <div><strong>Chef d'agence:</strong> francois@quickzone.tn / francois123</div>
                  <div><strong>Membre agence:</strong> thomas@quickzone.tn / thomas123</div>
                  <div><strong>Livreur:</strong> marc@quickzone.tn / marc123</div>
                  <div><strong>Expéditeur:</strong> expediteur1@quickzone.tn / expediteur123</div>
                </div>
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