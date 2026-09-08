import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff } from 'lucide-react';

const AdminLoginPage = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@svgu.edu.in');
  const [password, setPassword] = useState('AdminPass@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        if (res.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          setError('Access Denied: This portal is reserved for Estate Administrators only.');
        }
      } else {
        setError(res.message || 'Admin authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.message || 'Server error during admin authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminDemo = async () => {
    try {
      setLoading(true);
      setError('');
      const demoEmail = 'admin@svgu.edu.in';
      const demoPass = 'AdminPass@123';
      setEmail(demoEmail);
      setPassword(demoPass);

      const res = await login(demoEmail, demoPass);
      if (res.success && res.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        setError(res.message || 'Admin demo login failed.');
      }
    } catch (err) {
      setError(err.message || 'Admin demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 px-8 py-8 text-center text-white space-y-2 border-b border-indigo-900/60">
          <div className="inline-flex p-3 bg-[#0D9488] rounded-xl mb-1 shadow-lg border border-teal-400/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>Admin Control Portal</span>
          </h2>
          <p className="text-xs text-teal-300 font-medium">
            Estate & Campus Facility Governance Panel
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8 space-y-6">
          {/* Quick Demo Login Preset Button */}
          <div className="p-3 bg-slate-900/80 border border-indigo-900/80 rounded-xl space-y-2">
            <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider text-center">
              ⚡ 1-Click Admin Demo Access
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleQuickAdminDemo}
              className="w-full py-2.5 px-3 text-xs font-bold bg-indigo-950 text-teal-300 border border-indigo-700 hover:bg-indigo-900 hover:border-teal-400 rounded-lg transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              Quick Fill Admin Demo Credentials
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@svgu.edu.in"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-hidden font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#0D9488] focus:ring-teal-400"
                />
                <span>Remember Session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D9488] text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-600 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating Admin...' : 'Sign In as Administrator'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
