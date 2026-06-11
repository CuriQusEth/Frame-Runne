import { useAccount } from 'wagmi';
import { sendGMTransaction } from '../lib/web3/transactions';
import { Sun } from 'lucide-react';

export function GlobalActions() {
  const { isConnected } = useAccount();

  if (!isConnected) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <button 
        onClick={() => sendGMTransaction()}
        className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold"
      >
        <Sun size={14} />
        Say GM
      </button>
    </div>
  );
}
