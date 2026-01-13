import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'glow';
  hover?: boolean;
  delay?: number;
}

export function GlassCard({ children, className, variant = 'default', hover = false, delay = 0 }: GlassCardProps) {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variantClasses = {
    default: 'glass',
    strong: 'glass-strong',
    glow: 'glass glow-primary',
  };

  const hoverClasses = hover ? 'hover:border-primary/30 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(baseClasses, variantClasses[variant], hoverClasses, className)}
    >
      {children}
    </motion.div>
  );
}
