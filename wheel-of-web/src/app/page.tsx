'use client';

import { useState, useEffect } from 'react';
import { User } from '@/lib/models';
import { questions } from '@/lib/questions';
import RegistrationForm from '@/components/RegistrationForm';
import SpinWheel from '@/components/SpinWheel';
import FolderUploader from '@/components/FolderUploader';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, CheckCircle2, Trophy, Loader2, Sparkles, ChevronRight, Code2 } from 'lucide-react';

export default function MainPage() {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [currentStep, setCurrentStep] = useState<'register' | 'spin' | 'question' | 'upload' | 'complete'>('register');
  const [assignedQuestion, setAssignedQuestion] = useState<typeof questions[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedRegNumber = localStorage.getItem('regNumber');
    if (savedRegNumber) {
      checkUserStatus(savedRegNumber);
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkUserStatus = async (regNumber: string) => {
    try {
      const res = await fetch(`/api/user-status?regNumber=${regNumber}`);
      const data = await res.json();
      
      if (data.exists) {
        setUser(data.user);
        // Safe property access with nullish coalescing
        const hasUploaded = data.user.hasUploaded ?? false;
        const assignedQuestionId = data.user.assignedQuestion ?? null;
        
        if (hasUploaded) {
          setCurrentStep('complete');
        } else if (assignedQuestionId) {
          const question = questions.find(q => q.id.toString() === assignedQuestionId);
          setAssignedQuestion(question || null);
          setCurrentStep('upload');
        } else {
          setCurrentStep('spin');
        }
      } else {
        localStorage.removeItem('regNumber');
        setCurrentStep('register');
      }
    } catch (err) {
      console.error('Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSuccess = (newUser: Partial<User>) => {
    setUser(newUser);
    if (newUser.regNumber) {
      localStorage.setItem('regNumber', newUser.regNumber);
      
      // SMART LOGIN LOGIC: Safe property access with type guards
      const hasUploaded = 'hasUploaded' in newUser ? newUser.hasUploaded : false;
      const assignedQuestionId = 'assignedQuestion' in newUser ? newUser.assignedQuestion : null;
      
      if (hasUploaded) {
        setCurrentStep('complete');
      } else if (assignedQuestionId) {
        const question = questions.find(q => q.id.toString() === assignedQuestionId);
        setAssignedQuestion(question || null);
        setCurrentStep('upload');
      } else {
        setCurrentStep('spin');
      }
    } else {
      setCurrentStep('spin');
    }
  };

  const handleSpinEnd = (question: typeof questions[0]) => {
    setAssignedQuestion(question);
    setTimeout(() => setCurrentStep('question'), 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('regNumber');
    setUser(null);
    setCurrentStep('register');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
        <p className="text-amber-500/50 uppercase tracking-widest text-sm font-bold">Verifying Credentials...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white px-4 py-8 overflow-hidden relative selection:bg-amber-500/30">
      {/* Premium Ambient Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Royal Header */}
        <header className="flex justify-between items-center mb-16 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 hidden sm:flex">
              <Code2 className="w-7 h-7 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-widest bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent uppercase">
                SPIN & CODE
              </h1>
              {user && (
                <p className="text-amber-200/50 font-medium tracking-wide text-sm mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Challenger: {user.name}
                </p>
              )}
            </div>
          </div>

          {user && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white/70 hover:text-white"
            >
              <span className="text-sm font-semibold hidden sm:block">Disconnect</span>
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </header>

        <AnimatePresence mode="wait">
          {currentStep === 'register' && (
            <motion.div key="register" exit={{ opacity: 0, y: -20 }} className="flex justify-center">
              <RegistrationForm onSuccess={handleRegisterSuccess} />
            </motion.div>
          )}

          {currentStep === 'spin' && (
            <motion.div key="spin" exit={{ opacity: 0, scale: 1.1 }} className="flex flex-col items-center pt-8">
              <h2 className="text-3xl md:text-4xl font-black mb-12 text-center text-white/90 tracking-wide">
                DESTINY AWAITS
              </h2>
              <SpinWheel regNumber={user?.regNumber || ''} onSpinEnd={handleSpinEnd} />
            </motion.div>
          )}

          {currentStep === 'question' && assignedQuestion && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-[#0f172a]/80 backdrop-blur-2xl border border-amber-500/20 p-10 md:p-14 rounded-3xl shadow-[0_0_50px_rgba(217,119,6,0.1)] text-center max-w-2xl mx-auto relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0" />
              
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-amber-500/20">
                 <Sparkles className="w-12 h-12 text-slate-900" />
              </div>
              
              <h2 className="text-xs font-black text-amber-500 uppercase tracking-[0.3em] mb-4">Your Assigned Decree</h2>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">{assignedQuestion.title}</h3>
              <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-12 font-light">
                {assignedQuestion.description}
              </p>
              
              <button
                onClick={() => setCurrentStep('upload')}
                className="group px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 text-lg font-black uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform active:scale-95 flex items-center justify-center mx-auto gap-3"
              >
                Accept Challenge
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {currentStep === 'upload' && assignedQuestion && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="bg-[#0f172a]/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Current Challenge</h2>
                <h3 className="text-2xl font-bold mb-3 text-white">{assignedQuestion.title}</h3>
                <p className="text-slate-400 leading-relaxed">{assignedQuestion.description}</p>
              </div>
              
              <div className="bg-[#0f172a]/80 backdrop-blur-xl p-8 rounded-2xl border border-amber-500/20 shadow-[0_0_30px_rgba(217,119,6,0.05)]">
                <FolderUploader 
                  regNumber={user?.regNumber || ''} 
                  onUploadSuccess={() => setCurrentStep('complete')} 
                />
              </div>
            </motion.div>
          )}

          {currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-[#0f172a]/40 backdrop-blur-xl rounded-3xl border border-white/5 max-w-2xl mx-auto"
            >
              <div className="relative inline-block mb-10">
                <div className="absolute inset-0 bg-amber-500 blur-[60px] opacity-30 rounded-full" />
                <Trophy className="w-32 h-32 text-amber-400 relative z-10 drop-shadow-2xl" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center border-4 border-[#020617] z-20"
                >
                  <CheckCircle2 className="w-6 h-6 text-slate-900" />
                </motion.div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                VICTORY!
              </h2>
              <p className="text-xl text-slate-300 max-w-md mx-auto mb-12 font-light leading-relaxed">
                Your submission for <strong className="text-white font-bold">"{assignedQuestion?.title || 'the challenge'}"</strong> has been successfully archived in the royal vault.
              </p>
              
              <button
                onClick={handleLogout}
                className="px-10 py-4 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold uppercase tracking-widest rounded-full transition-all"
              >
                Return to Kingdom
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}