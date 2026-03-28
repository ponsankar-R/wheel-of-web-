'use client';

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { questions } from '@/lib/questions';
import { Loader2, Sparkles, Target } from 'lucide-react';

interface SpinWheelProps {
  regNumber: string;
  onSpinEnd: (question: typeof questions[0]) => void;
}

export default function SpinWheel({ regNumber, onSpinEnd }: SpinWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [showWinnerGlow, setShowWinnerGlow] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<typeof questions>([]);
  const controls = useAnimation();

  useEffect(() => {
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    const selectedSet = isMorning ? questions.slice(0, 7) : questions.slice(7, 14);
    setCurrentQuestions(selectedSet);
  }, []);

  const spin = async () => {
    if (spinning || currentQuestions.length === 0) return;

    setSpinning(true);
    setShowWinnerGlow(false);

    const randomIndex = Math.floor(Math.random() * currentQuestions.length);
    const selectedQuestion = currentQuestions[randomIndex];

    const rotations = 8; 
    const degreesPerSegment = 360 / currentQuestions.length;
    
    // Land organically inside the segment
    const randomOffset = degreesPerSegment * (0.15 + Math.random() * 0.7);
    
    const targetDegree = 
      (360 * rotations) + 
      (360 - (randomIndex * degreesPerSegment)) - 
      randomOffset + 
      90;

    await controls.start({
      rotate: targetDegree,
      transition: { 
        duration: 7.5, 
        ease: [0.15, 0.95, 0.1, 1] // Super smooth friction curve
      }
    });

    setShowWinnerGlow(true);

    try {
      const response = await fetch('/api/assign-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regNumber, questionId: selectedQuestion.id.toString() }),
      });

      if (response.ok) {
        setTimeout(() => {
          onSpinEnd(selectedQuestion);
        }, 1500);
      } else {
        alert('Failed to save question. Please try again.');
        setSpinning(false);
        setShowWinnerGlow(false);
      }
    } catch (error) {
      console.error('Error saving question:', error);
      setSpinning(false);
      setShowWinnerGlow(false);
    }
  };

  if (currentQuestions.length === 0) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
      </div>
    );
  }

  // Premium, rich jewel-tone palette
  const premiumColors = [
    '#E11D48', // Ruby Red
    '#2563EB', // Sapphire Blue
    '#D97706', // Topaz Amber
    '#059669', // Emerald Green
    '#7C3AED', // Amethyst Purple
    '#EA580C', // Burnt Orange
    '#0891B2', // Deep Cyan
    '#9333EA', // Royal Purple
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center w-full relative z-10"
    >
      {/* Floating Wheel Container */}
      <motion.div 
        animate={spinning ? {} : { y: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] mb-12 flex items-center justify-center"
      >
        
        {/* Ambient Gold Aura */}
        <div className={`absolute inset-0 bg-amber-500/20 blur-[70px] rounded-full -z-10 transition-all duration-1000 ${showWinnerGlow ? 'bg-amber-400/50 blur-[100px] scale-110' : ''}`} />

        {/* 3D Pointer/Flapper */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_8px_8px_rgba(0,0,0,0.6)]">
          <svg width="45" height="55" viewBox="0 0 100 120">
            <defs>
              <linearGradient id="pointerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <path d="M 20 10 L 80 10 L 50 110 Z" fill="url(#pointerGrad)" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 50 15 L 70 15 L 50 90 Z" fill="#FEF3C7" opacity="0.6" />
          </svg>
        </div>

        {/* The Wheel Assembly */}
        <div className={`w-full h-full p-3 rounded-full bg-slate-900/60 backdrop-blur-xl border-2 border-amber-500/20 z-10 relative transition-all duration-500 ${showWinnerGlow ? 'shadow-[0_0_80px_rgba(245,158,11,0.5)]' : 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]'}`}>
          <motion.div
            animate={controls}
            initial={{ rotate: 0 }}
            className="w-full h-full rounded-full overflow-hidden relative"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
              <defs>
                {/* Metallic Gold Gradient for the Rim & Hub */}
                <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="20%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#FEF3C7" />
                  <stop offset="80%" stopColor="#B45309" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>

                {/* 3D Glossy Sphere Overlay */}
                <linearGradient id="glassReflection" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                  <stop offset="40%" stopColor="#ffffff" stopOpacity="0.0" />
                  <stop offset="80%" stopColor="#000000" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
                </linearGradient>

                {/* Drop shadow for text to pop against colors */}
                <filter id="textShadow">
                  <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.7" />
                </filter>

                {/* SVG Filter for Center Hub Shadow */}
                <filter id="hubShadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Slices */}
              {currentQuestions.map((q, i) => {
                const angle = 360 / currentQuestions.length;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;
                
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                return (
                  <g key={q.id}>
                    {/* The Segment */}
                    <path
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={premiumColors[i % premiumColors.length]}
                      stroke="#ffffff"
                      strokeWidth="0.2"
                      strokeOpacity="0.3"
                    />
                    
                    {/* The Text */}
                    <text
                      x="56" 
                      y="50"
                      transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                      fill="#ffffff"
                      fontSize="2.8"
                      fontWeight="800"
                      textAnchor="start"
                      alignmentBaseline="middle"
                      filter="url(#textShadow)"
                      className="tracking-wider"
                    >
                      {q.title.length > 18 ? `${q.title.substring(0, 16)}...` : q.title}
                    </text>
                  </g>
                );
              })}
              
              {/* Glossy 3D Overlay (Makes it look like a physical glass dome) */}
              <circle cx="50" cy="50" r="50" fill="url(#glassReflection)" pointerEvents="none" />

              {/* Thick Metallic Gold Outer Rim */}
              <circle cx="50" cy="50" r="48.5" fill="none" stroke="url(#goldMetal)" strokeWidth="3" />
              
              {/* Inner Rim Details */}
              <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.4" />
              
              {/* Stunning Center Hub - FIXED: Removed invalid shadow attribute */}
              <circle cx="50" cy="50" r="10" fill="#0f172a" stroke="url(#goldMetal)" strokeWidth="2" filter="url(#hubShadow)" />
              <circle cx="50" cy="50" r="8" fill="url(#goldMetal)" />
              <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.8" />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Vibrant Premium Button */}
      <motion.button
        onClick={spin}
        disabled={spinning || showWinnerGlow}
        whileHover={!(spinning || showWinnerGlow) ? { scale: 1.05, y: -2 } : {}}
        whileTap={!(spinning || showWinnerGlow) ? { scale: 0.95 } : {}}
        className={`relative overflow-hidden px-14 py-5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-900 text-2xl font-black rounded-full shadow-[0_10px_30px_rgba(245,158,11,0.4)] tracking-widest uppercase disabled:opacity-70 disabled:cursor-not-allowed transition-all`}
      >
        {spinning ? (
          <span className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            Spinning...
          </span>
        ) : showWinnerGlow ? (
          <span className="flex items-center gap-3 text-white drop-shadow-md">
            <Sparkles className="w-6 h-6 text-amber-200" />
            Winner!
          </span>
        ) : (
          <span className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            Spin the Wheel
          </span>
        )}

        {/* Shine Animation overlay on the button */}
        {!(spinning || showWinnerGlow) && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear", delay: 1 }}
            className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />
        )}
      </motion.button>
    </motion.div>
  );
}