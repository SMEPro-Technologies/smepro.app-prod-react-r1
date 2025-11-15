import React, { useState } from 'react';
import { SmeProLogo } from '../icons';

interface AdminLoginPageProps {
  onLogin: (success: boolean) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email === 'admin@smepro.app' && password === 'Reagan@90') {
      onLogin(true);
    } else {
      setError('Invalid credentials. Please try again.');
      onLogin(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 font-sans p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center items-center mb-6">
          <SmeProLogo className="w-16 h-16" />
        </div>
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Admin Console</h1>
          <p className="text-slate-400 text-center mb-6">Please sign in to continue.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;