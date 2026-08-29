import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

const OtpVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'user@college.edu';
  const [otp, setOtp] = useState(['4', '8', '2', '9', '1', '0']);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    navigate('/reset-password');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="bg-[#4338CA] px-8 py-8 text-center text-white space-y-2">
          <div className="inline-flex p-3 bg-[#0D9488] rounded-xl mb-1 shadow-md">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">OTP Verification</h2>
          <p className="text-xs text-indigo-200">
            Enter the 6-digit verification code sent to <strong className="text-white">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="p-8 space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="w-12 h-12 text-center text-lg font-black text-[#4338CA] border-2 border-slate-300 rounded-xl focus:border-[#0D9488] focus:ring-2 focus:ring-teal-100 outline-hidden bg-slate-50"
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-[#0D9488] text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition shadow-md"
          >
            Verify Security Code
          </button>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={() => alert('A new 6-digit OTP code has been re-sent to your college email.')}
              className="text-[#0D9488] font-bold flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
            </button>

            <Link to="/login" className="text-[#4338CA] font-bold flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerificationPage;
