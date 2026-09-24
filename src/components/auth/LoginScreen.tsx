import React, { useState } from 'react';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  CheckCircle2,
  Building,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AirwinLogo } from '../../utils/logoSvg';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();

  const [identifier, setIdentifier] = useState<string>('rajesh@airwinpipes.com');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberLogin, setRememberLogin] = useState<boolean>(true);
  const [role, setRole] = useState<'executive' | 'admin'>('executive');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [resetSent, setResetSent] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your mobile number or email');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    const success = await login(identifier, password, role);
    setLoading(false);

    if (!success) {
      setError('Invalid login credentials. Please try again.');
    }
  };

  const handleQuickDemoLogin = async (selectedRole: 'executive' | 'admin') => {
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setIdentifier('admin@airwinpipes.com');
      await login('admin@airwinpipes.com', 'admin123', 'admin');
    } else {
      setIdentifier('rajesh@airwinpipes.com');
      await login('rajesh@airwinpipes.com', 'password123', 'executive');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-red-950 p-4 text-white flex flex-col justify-between select-none">
      {/* Top Brand Banner */}
      <div className="pt-4 text-center space-y-2">
        <div className="flex justify-center">
          <AirwinLogo size="lg" />
        </div>
        <div>
          <span className="text-[11px] font-bold tracking-widest text-red-400 uppercase">
            AGARSEN PIPES AND FITTINGS PVT. LTD.
          </span>
          <h2 className="text-xl font-black tracking-tight text-white mt-0.5">AIRWIN SALES REPORT</h2>
          <p className="text-xs text-slate-400 mt-1">Field Sales & Expense Reporting System</p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="my-auto py-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-5 shadow-2xl space-y-4">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 p-1 bg-black/30 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRole('executive');
                setIdentifier('rajesh@airwinpipes.com');
              }}
              className={`py-2 rounded-xl transition-all ${
                role === 'executive'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sales Executive
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('admin');
                setIdentifier('admin@airwinpipes.com');
              }}
              className={`py-2 rounded-xl transition-all ${
                role === 'admin'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin / Manager
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Mobile / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9825012345 or email"
                  className="w-full pl-10 pr-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-red-300 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Login */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
              />
              <label htmlFor="remember" className="text-xs text-slate-300 cursor-pointer font-medium">
                Remember Login on this device
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'SECURE LOGIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block text-center font-bold">
              Quick One-Tap Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('executive')}
                className="py-2 px-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-[11px] font-bold text-white transition-colors text-center"
              >
                Login as Executive
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="py-2 px-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl text-[11px] font-bold text-white transition-colors text-center"
              >
                Login as Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pb-2 text-center text-[10px] text-slate-400">
        <p>Agarsen Pipes and Fittings Pvt. Ltd. · All Rights Reserved</p>
        <p className="text-slate-500 mt-0.5">Firebase Cloud Firestore Secured · Offline-First PWA</p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-xs w-full space-y-3.5 shadow-2xl text-left">
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>

            <div>
              <h4 className="text-sm font-black text-white">Reset Password</h4>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered mobile or email to receive password reset OTP.
              </p>
            </div>

            {resetSent ? (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 space-y-2">
                <p>Password reset instructions have been sent to your registered contact!</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetSent(false);
                  }}
                  className="w-full py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter email or mobile"
                  className="w-full px-3 py-2 bg-black/40 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-red-500"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl text-xs"
                  >
                    Send OTP
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
