
import React, { useState, FormEvent, useCallback, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { AuthMode } from '../App';

interface AuthModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzfPwTDzc5SJoftFcYo6OZk8w-GvLcF2EpFvPQk3HoYn-VU3Ey5Les6UC0EPfWqxv3c/exec';

const SignInForm: React.FC<{ onSwitchMode: (mode: AuthMode) => void; onClose: () => void; }> = ({ onSwitchMode, onClose }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append('action', 'signIn');
    params.append('email', identifier);
    params.append('password', password);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });
      const result = await response.json();
      
      if (result.status === "success") {
        localStorage.setItem('userEmail', result.email);
        localStorage.setItem('user', JSON.stringify({ name: result.userName }));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user_credit', result.credit);
        window.dispatchEvent(new Event('authSuccess'));
        onClose();
      } else {
        throw new Error(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Welcome Back!</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-500" htmlFor="signin-email">Email or Username</label>
          <input id="signin-email" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="mt-1 w-full p-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-colors" />
        </div>
        <div>
          <label className="text-sm font-bold text-slate-500" htmlFor="signin-password">Password</label>
          <input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full p-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-colors" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-[#1e5aa0] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center disabled:bg-slate-400">
          {isLoading ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
        </button>
        {error && <p className="text-xs text-red-500 text-center font-semibold mt-2">{error}</p>}
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{' '}
        <button onClick={() => onSwitchMode('signup')} className="font-bold text-[#1e5aa0] hover:underline">Sign Up</button>
      </p>
    </div>
  );
};

const SignUpForm: React.FC<{ onSwitchMode: (mode: AuthMode) => void; onClose: () => void; }> = ({ onSwitchMode, onClose }) => {
  const [formStep, setFormStep] = useState<'details' | 'otp'>('details');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    gender: null as 'male' | 'female' | null,
  });
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const key = id.replace('signup-', '');
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGenderSelect = useCallback((gender: 'male' | 'female') => {
    setFormData(prev => ({ ...prev, gender }));
  }, []);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.username || !formData.gender || !formData.password) {
      setError('Please fill in all details.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append('action', 'sendOtp');
    params.append('email', formData.email);
    params.append('name', formData.username);

    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      const result = await response.json();

      if (result.status === "success") {
        setFormStep('otp');
        setResendCooldown(60);
      } else {
        throw new Error(result.message || 'Failed to send OTP.');
      }
    } catch (error: any) {
      setError(error.message || 'Could not send verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const referrer = sessionStorage.getItem('pending_referrer');

    const params = new URLSearchParams();
    params.append('action', 'verifyAndSignUp');
    params.append('name', formData.username);
    params.append('email', formData.email);
    params.append('password', formData.password);
    params.append('gender', formData.gender!);
    params.append('otp', otp);
    if (referrer) {
      params.append('referrer', referrer);
    }
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        });

        const result = await response.json();
        
        if (result.status === "success") {
            localStorage.setItem('userEmail', formData.email);
            localStorage.setItem('user', JSON.stringify({ name: result.userName || formData.username }));
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user_credit', result.credit);
            if (referrer) {
                sessionStorage.removeItem('pending_referrer');
            }
            window.dispatchEvent(new Event('authSuccess'));
            onClose();
        } else {
            throw new Error(result.message || 'An unknown error occurred.');
        }

    } catch (error: any) {
        setError(error.message || 'Verification failed. The code may be incorrect or expired.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {formStep === 'details' ? (
        <div className="transition-all duration-300">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Create Your Account</h2>
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-500" htmlFor="signup-username">Username</label>
              <input id="signup-username" type="text" required onChange={handleChange} className="mt-1 w-full p-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-colors" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-500" htmlFor="signup-email">Email</label>
              <input id="signup-email" type="email" required onChange={handleChange} className="mt-1 w-full p-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-colors" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-500" htmlFor="signup-password">Password</label>
              <input id="signup-password" type="password" required onChange={handleChange} className="mt-1 w-full p-3 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-colors" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-500">Gender</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handleGenderSelect('male')} className={`py-3 rounded-xl font-bold border-2 transition-colors ${formData.gender === 'male' ? 'bg-sky-100 text-sky-700 border-sky-300' : 'bg-slate-50 border-slate-200'}`}>
                  Male
                </button>
                <button type="button" onClick={() => handleGenderSelect('female')} className={`py-3 rounded-xl font-bold border-2 transition-colors ${formData.gender === 'female' ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-slate-50 border-slate-200'}`}>
                  Female
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-[#1e5aa0] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center disabled:bg-slate-400">
              {isLoading ? <Loader className="animate-spin" size={20} /> : 'Sign Up'}
            </button>
            {error && <p className="text-xs text-red-500 text-center font-semibold mt-2">{error}</p>}
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <button onClick={() => onSwitchMode('signin')} className="font-bold text-[#1e5aa0] hover:underline">Sign In</button>
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Email Verification</h2>
          <p className="text-center text-sm text-slate-500 mb-6">
            Enter the 6-digit code sent to <br/><span className="font-bold">{formData.email}</span>.
          </p>
          <form onSubmit={handleVerifyAndSignUp} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-500 sr-only" htmlFor="otp-input">Verification Code</label>
              <input 
                id="otp-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                maxLength={6}
                required 
                className="pointer-events-auto mt-1 w-full p-4 bg-slate-900 text-cyan-300 border-2 border-cyan-700 rounded-xl focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-center text-4xl font-black tracking-[0.5em] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),0_0_15px_rgba(0,255,255,0.2)]" 
              />
            </div>
             <button type="submit" disabled={isLoading} className="w-full bg-[#ff8a65] text-white py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors flex items-center justify-center disabled:bg-slate-400">
              {isLoading ? <Loader className="animate-spin" size={20} /> : 'Verify & Create Account'}
            </button>
            {error && <p className="text-xs text-red-500 text-center font-semibold mt-2">{error}</p>}
          </form>
           <div className="text-center mt-6">
            <button 
              onClick={handleSendOtp} 
              disabled={resendCooldown > 0 || isLoading}
              className="font-bold text-[#1e5aa0] hover:underline text-sm disabled:text-slate-400 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, mode, onClose, onSwitchMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className="relative bg-white w-full max-w-md p-8 rounded-3xl shadow-xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
          <X size={20} />
        </button>
        {mode === 'signin' ? <SignInForm onSwitchMode={onSwitchMode} onClose={onClose} /> : <SignUpForm onSwitchMode={onSwitchMode} onClose={onClose} />}
      </div>
    </div>
  );
};
