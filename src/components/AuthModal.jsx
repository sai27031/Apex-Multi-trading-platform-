import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ArrowRight, TrendingUp, Key, ShieldCheck, Sparkles, Play } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, defaultMode = 'signin' }) {
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Chief Wealth Advisor',
    firmName: 'Apex Capital Desk'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSignUp(defaultMode === 'signup');
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const initials = formData.name 
        ? formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : (formData.email ? formData.email.slice(0, 2).toUpperCase() : 'AP');

      const user = {
        name: isSignUp ? formData.name : (formData.name || formData.email.split('@')[0]),
        email: formData.email,
        role: formData.role || 'Chief Wealth Advisor',
        firmName: formData.firmName || 'Apex Capital Desk',
        avatar: initials || 'AP'
      };

      localStorage.setItem('apex_user', JSON.stringify(user));
      onLoginSuccess(user);
      setLoading(false);
      onClose();
    }, 400);
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Fund Manager',
      email: 'manager@apex.in',
      role: 'Chief Wealth Advisor',
      firmName: 'Apex Alpha Desk',
      avatar: 'AP'
    };
    localStorage.setItem('apex_user', JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="clean-card rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative border border-white/20">
        <button
          onClick={onClose}
          className="clean-btn absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-cyan-900/50 border border-white/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-200">
            APEX
          </h3>
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Create your APEX trading account' : 'Sign in to access your multi-client terminal'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-[#101728]/90 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`clean-btn py-2 rounded-lg font-bold transition ${
              !isSignUp ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`clean-btn py-2 rounded-lg font-bold transition ${
              isSignUp ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {isSignUp && (
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[#141d30] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="Enter your work email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#141d30] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#141d30] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-slate-300 mb-1 font-medium">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full bg-[#141d30] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
              >
                <option value="Chief Wealth Advisor">Chief Wealth Advisor (20+ Portfolios)</option>
                <option value="Fund Portfolio Manager">Fund Portfolio Manager</option>
                <option value="Quantitative Proprietary Trader">Quantitative Proprietary Trader</option>
                <option value="Independent Sub-Broker">Independent Sub-Broker</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="clean-btn w-full py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/50 border border-white/20 transition flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Authenticating...' : (isSignUp ? 'Create Account & Enter Terminal' : 'Sign In to Terminal')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guest Terminal Access */}
        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="clean-btn w-full py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Guest Terminal Access</span>
          </button>
        </div>
      </div>
    </div>
  );
}
