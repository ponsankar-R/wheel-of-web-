'use client';

import { useState } from 'react';
import { User } from '@/lib/models';
import { Loader2, Crown, User as UserIcon, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegistrationFormProps {
  onSuccess: (user: Partial<User>) => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [name, setName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, regNumber }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('A royal decree could not be issued. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full max-w-md p-10 bg-[#0f172a]/80 backdrop-blur-2xl border border-amber-500/20 rounded-3xl shadow-[0_0_50px_rgba(217,119,6,0.15)] relative overflow-hidden"
    >
      {/* Premium Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-amber-500/10 blur-[60px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full flex items-center justify-center p-0.5 shadow-lg shadow-amber-500/30 mb-6">
          <div className="w-full h-full bg-[#0f172a] rounded-full flex items-center justify-center">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-center mb-2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent uppercase tracking-wider">
          Spin & Code
        </h2>
        <p className="text-amber-200/60 text-center mb-10 font-medium tracking-wide">
          Enter your credentials to enter
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-bold text-amber-500/80 uppercase tracking-widest ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-amber-400/50 group-focus-within:text-amber-400 transition-colors" />
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-white placeholder-white/20 outline-none transition-all duration-300"
                placeholder="name"
              />
            </div>
          </div>
          
          {/* Registration Number Input */}
          <div className="space-y-1.5">
            <label htmlFor="regNumber" className="block text-xs font-bold text-amber-500/80 uppercase tracking-widest ml-1">
              Registration Number
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-amber-400/50 group-focus-within:text-amber-400 transition-colors" />
              </div>
              <input
                id="regNumber"
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-white placeholder-white/20 outline-none transition-all duration-300 font-mono"
                placeholder="9225........"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg border border-red-400/20"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            className="w-full py-4 mt-4 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-slate-900 text-lg font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </span>
            ) : (
              'Enter Challenge'
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}