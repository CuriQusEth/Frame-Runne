import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/web3/config';
import { TitleScreen } from './screens/TitleScreen';
import { GameScreen } from './screens/GameScreen';
import { GameOverScreen } from './screens/GameOverScreen';

const queryClient = new QueryClient();

export default function App() {
  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'CRASHED'>('MENU');
  
  const [runStats, setRunStats] = useState({ score: 0, distance: 0, combo: 0 });

  const handleCrash = (score: number, distance: number, combo: number) => {
    setRunStats({ score, distance, combo });
    setGameState('CRASHED');
  };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="bg-[#050505] min-h-screen text-[#e0e0e0] font-sans selection:bg-[#00f3ff]/30">
          {gameState === 'MENU' && (
            <TitleScreen onPlay={() => setGameState('PLAYING')} />
          )}
          
          {gameState === 'PLAYING' && (
            <GameScreen onCrash={handleCrash} />
          )}
          
          {gameState === 'CRASHED' && (
            <GameOverScreen 
              score={runStats.score} 
              distance={runStats.distance} 
              combo={runStats.combo}
              onRetry={() => setGameState('PLAYING')}
              onMenu={() => setGameState('MENU')}
            />
          )}
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

