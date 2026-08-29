import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Building2, Eye, EyeOff, Lock, Mail, ShieldCheck, User } from 'lucide-react';

const LoginPage = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rahul.verma@student.college.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    const res = login(email, password);
    if (res.success) {
      if (res.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleQuickLogin = (roleType) => {
    if (roleType === 'Admin') {
      setEmail('admin@college.edu');
      setPassword('admin123');
      login('admin@college.edu', 'admin123');
      navigate('/admin/dashboard');
    } else {
      setEmail('rahul.verma@student.college.edu');
      setPassword('password123');
      login('rahul.verma@student.college.edu', 'password123');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header Banner */}
        <div className="bg-[#4338CA] px-8 py-8 text-center text-white space-y-2">
          <div className="inline-flex p-3 bg-[#0D9488] rounded-xl mb-1 shadow-md">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Campus Portal Sign In</h2>
          <p className="text-xs text-indigo-200">
            Event Hall Reservation System • Authorized Members Only
          </p>
        </div>

        {/* Form Container */}
        <div className="p-8 space-y-6">
          {/* Quick Demo Login Preset Buttons */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
              ⚡ 1-Click Demo Login
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('User')}
                className="py-2 px-3 text-xs font-bold bg-white border border-slate-300 text-[#4338CA] hover:border-[#4338CA] rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#0D9488]" />
                User Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Admin')}
                className="py-2 px-3 text-xs font-bold bg-indigo-900 text-teal-300 hover:bg-indigo-950 rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                Admin Demo
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@college.edu or faculty@college.edu"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] focus:border-transparent outline-hidden font-medium text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
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
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] focus:border-transparent outline-hidden font-medium text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#4338CA] focus:ring-[#4338CA]"
                />
                <span>Remember Me</span>
              </label>

              <Link to="/forgot-password" className="font-bold text-[#0D9488] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#0D9488] text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition shadow-md"
            >
              Sign In to Portal
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
