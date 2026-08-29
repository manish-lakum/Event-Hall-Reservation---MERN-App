import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      navigate('/verify-otp', { state: { email } });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-[#4338CA] px-8 py-8 text-center text-white space-y-2">
          <div className="inline-flex p-3 bg-[#0D9488] rounded-xl mb-1 shadow-md">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Forgot Password</h2>
          <p className="text-xs text-indigo-200">
            Enter your campus registered email to receive a verification OTP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@college.edu"
                required
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#0D9488] text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition shadow-md"
          >
            Send Reset Link / OTP
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
