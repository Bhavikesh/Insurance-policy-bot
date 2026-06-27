import React, { useState, useEffect } from 'react';
import { Key, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { storage } from '../utils/storage';

const Header = () => {
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(storage.hasToken());
    
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setIsTokenModalOpen(true);
    };
    
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const handleSaveToken = () => {
    if (token.trim()) {
      storage.setToken(token.trim());
      setIsAuthenticated(true);
      setIsTokenModalOpen(false);
      setToken('');
    }
  };

  const handleLogout = () => {
    storage.removeToken();
    setIsAuthenticated(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">📄</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Intelligent Document Assistant
                </h1>
                <p className="text-sm text-gray-500">
                  AI-Powered Policy Analysis
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700">Authenticated</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsTokenModalOpen(true)}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <Key className="w-4 h-4" />
                  <span>Authorize</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Enter Bearer Token
              </h2>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Enter your API bearer token to access the document processing features.
              </p>
              
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveToken()}
                placeholder="Bearer token..."
                className="input"
                autoFocus
              />
              
              <div className="mt-2 flex items-start space-x-2 text-xs text-gray-500">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Find your token in the <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code> file
                  (BEARER_TOKEN variable)
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToken}
                disabled={!token.trim()}
                className="btn-primary flex-1"
              >
                Save Token
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;