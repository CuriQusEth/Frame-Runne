import { useEffect } from 'react';
import { useGameEngine } from '../game/useRunner';
import { motion } from 'motion/react';

export function GameScreen({ onCrash }: { onCrash: (score: number, distance: number, combo: number) => void }) {
  const { canvasRef, startGame, stopGame, handleInput, score, combo, distance } = useGameEngine((s, d, c) => {
    stopGame();
    onCrash(s, d, c);
  });

  useEffect(() => {
    startGame();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') handleInput('jump');
      if (e.code === 'ArrowDown') handleInput('slide');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      stopGame();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div 
        className="fixed inset-0 bg-[#050505] overflow-hidden touch-none"
        onClick={() => handleInput('jump')}
        onContextMenu={(e) => { e.preventDefault(); handleInput('slide'); }} 
    >
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight} 
        className="block"
      />
      
      {/* HUD overlays match the design style */}
      <div className="absolute top-10 left-10 flex flex-col gap-1 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Distance</span>
        <span className="text-4xl font-mono font-bold text-white">{distance}<span className="text-sm">m</span></span>
      </div>

      <div className="absolute top-10 right-10 flex flex-col items-end gap-1 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Multiplier / Score</span>
        <div className="text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-white to-[#ff00ff]">
          x{combo} <span className="text-2xl text-[#e0e0e0] not-italic font-mono ml-2 inline-block text-right">{score}</span>
        </div>
      </div>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none">
        {combo > 0 && (
          <motion.div 
            key={combo}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-6 py-2 bg-[#00f3ff] text-black font-black italic text-2xl tracking-tighter"
          >
            FRAME PERFECT
          </motion.div>
        )}
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-end gap-8 pointer-events-none opacity-80">
        <div className="flex items-center gap-4 text-xs font-bold font-mono tracking-widest uppercase text-gray-500">
           <span className="px-3 py-1 border border-white/10 bg-black/50 rounded">TAP / SPACE: JUMP</span>
           <span className="px-3 py-1 border border-white/10 bg-black/50 rounded text-right">R_CLICK / DOWN: DASH</span>
        </div>
      </div>
    </div>
  );
}
