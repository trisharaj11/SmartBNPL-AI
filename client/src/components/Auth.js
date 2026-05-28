import React, { useState } from 'react';

const Auth = ({ darkMode, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email: formData.email, password: formData.password } : formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto mt-10 p-8 rounded-2xl shadow-xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {isLogin ? 'Log in to access your analysis tools' : 'Sign up to analyze your BNPL affordability'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none transition-colors ${
                darkMode 
                  ? 'bg-gray-900 border-gray-700 text-white' 
                  : 'bg-gray-50 border-gray-300'
              }`}
              placeholder="John Doe"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none transition-colors ${
              darkMode 
                ? 'bg-gray-900 border-gray-700 text-white' 
                : 'bg-gray-50 border-gray-300'
            }`}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-xl border focus:ring-2 focus:ring-purple-500 outline-none transition-colors ${
              darkMode 
                ? 'bg-gray-900 border-gray-700 text-white' 
                : 'bg-gray-50 border-gray-300'
            }`}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className={`text-sm font-medium hover:underline ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
