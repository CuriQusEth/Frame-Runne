import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function TitleScreen({ onPlay }: { onPlay: () => void }) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-[#e0e0e0] p-4 relative overflow-hidden">
      {/* Background aesthetic */}
      <div className="absolute bottom-0 w-full h-[300px] opacity-30"
           style={{ backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', backgroundSize: '60px 60px', transform: 'perspective(500px) rotateX(60deg) translateY(50px)', backgroundPosition: 'center bottom' }}></div>
      
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 text-center"
      >
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white">
          FRAME <br/> RUNNER <span className="text-xs md:text-sm bg-[#00f3ff] text-black px-2 py-1 rounded ml-1 not-italic tracking-normal align-top leading-none">BETA</span>
        </h1>
        <p className="mt-4 text-[#00f3ff] font-mono text-sm uppercase tracking-widest font-bold">
          Precision. Timing. On-Chain.
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="mt-16 z-10 flex flex-col gap-4 items-center w-full max-w-xs"
      >
        <Button onClick={onPlay} className="w-full text-xl py-4">Run Now</Button>

        {isConnected ? (
          <div className="flex flex-col items-center gap-2 mt-4">
            <span className="text-xs text-gray-500 font-mono tracking-widest">CONNECTED: {address?.slice(0,6)}...{address?.slice(-4)}</span>
            <Button variant="ghost" onClick={() => disconnect()} className="text-[10px]">Disconnect Wallet</Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => connect({ connector: injected() })} className="w-full mt-4 text-sm">
            Connect Web3 Wallet
          </Button>
        )}
      </motion.div>
    </div>
  );
}
