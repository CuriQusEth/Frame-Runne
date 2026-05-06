import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = "px-6 py-3 font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded";

  
  const variants = {
    primary: "bg-[#00f3ff] text-black hover:bg-white shadow-[0_0_15px_rgba(0,243,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8)]",
    secondary: "bg-[#ff00ff] text-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,0,255,0.4)]",
    outline: "border-2 border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/10",
    ghost: "text-gray-400 hover:text-white hover:bg-white/10",
  };

  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </motion.button>
  );
}
