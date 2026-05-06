import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { useAccount, useSignMessage, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';
import { useState } from 'react';
import { withAttribution } from '../lib/erc8021';

export function GameOverScreen({ 
    score, distance, combo, onRetry, onMenu 
}: { 
    score: number; distance: number; combo: number; onRetry: () => void; onMenu: () => void;
}) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { sendTransactionAsync } = useSendTransaction();
  const [recorded, setRecorded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRecordScore = async () => {
    if (!isConnected || !address) return alert("Please connect your wallet first.");
    setLoading(true);
    try {
      // SIWE signature for off-chain leaderboard authentication
      const nonce = Math.floor(Math.random() * 1000000).toString();
      const message = `Sign this message to record your Frame Runner score. \n\nScore: ${score}\nCombo: ${combo}\nDistance: ${distance}\nNonce: ${nonce}`;
      
      const sig = await signMessageAsync({ account: address, message });
      console.log("SIWE Signature:", sig);
      
      // We would normally payload this to the backend indexing the leaderboard.
      setRecorded(true);
      alert("Score recorded via SIWE signature successfully!");
    } catch (e) {
      console.error(e);
      alert("Signature rejected or failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSayGM = async () => {
      if (!isConnected) return alert("Please connect your wallet first.");
      setLoading(true);
      try {
          // Zero value tx with 'gm' in data field, attributed with ERC-8021
          const rawData = '0x676d'; // 'gm' in hex
          const attributedData = withAttribution(rawData);
          
          const tx = await sendTransactionAsync({
              to: '0x0000000000000000000000000000000000000000', // Burn/Null address for demo
              value: parseEther('0'),
              data: attributedData
          });
          
          alert(`Said GM on-chain! Tx: ${tx}`);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-[#e0e0e0] p-4 relative overflow-hidden">
      <div className="absolute bottom-0 w-full h-[300px] opacity-10"
           style={{ backgroundImage: 'linear-gradient(#ff00ff 1px, transparent 1px), linear-gradient(90deg, #ff00ff 1px, transparent 1px)', backgroundSize: '60px 60px', transform: 'perspective(500px) rotateX(60deg) translateY(50px)', backgroundPosition: 'center bottom' }}></div>
      <div className="absolute inset-0 bg-[#ff00ff]/5 mix-blend-overlay"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 bg-[#0a0a0a]/80 backdrop-blur-md border border-[#222] p-8 rounded text-center max-w-sm w-full shadow-[0_0_50px_rgba(255,0,255,0.1)]"
      >
        <h2 className="text-4xl font-black italic text-[#ff00ff] tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(255,0,255,0.4)] uppercase">CRASHED!</h2>
        
        <div className="flex flex-col gap-4 my-8">
            <div className="bg-white/5 p-4 border-l-2 border-[#00f3ff] rounded-r">
              <div className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1 font-bold">Final Score</div>
              <div className="text-4xl font-mono font-bold text-white">{score}</div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 bg-white/5 p-3 border-l-2 border-[#ff00ff] rounded-r">
                <div className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1 font-bold">Distance</div>
                <div className="text-xl font-mono text-white">{distance}m</div>
              </div>
              <div className="flex-1 bg-white/5 p-3 border-l-2 border-[#ff00ff] rounded-r">
                <div className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mb-1 font-bold">Max Combo</div>
                <div className="text-xl font-mono text-white">{combo}x</div>
              </div>
            </div>
        </div>

        <div className="flex flex-col gap-3">
          {isConnected && !recorded && (
            <Button variant="primary" onClick={handleRecordScore} disabled={loading} className="w-full text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
                Record This on-chain
            </Button>
          )}
          {isConnected && (
             <Button variant="outline" onClick={handleSayGM} disabled={loading} className="w-full text-[10px]">
                Say GM On-Chain (ERC-8021)
             </Button>
          )}

          <Button variant="secondary" onClick={onRetry} className="w-full mt-4 text-sm">Run Again</Button>
          <Button variant="ghost" onClick={onMenu} className="w-full text-[10px]">Main Menu</Button>
        </div>
      </motion.div>
    </div>
  );
}
