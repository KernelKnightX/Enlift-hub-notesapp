import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';

export default function SplashLoader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: .5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--color-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column'
      }}
      data-testid="splash-loader"
    >
      <motion.div
        initial={{ scale: .9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: .6, ease: [.2,.7,.2,1] }}
        className="flex flex-col items-center gap-6"
      >
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'var(--color-primary)', color: 'var(--color-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 40px -18px rgba(27,59,43,0.4)'
        }}>
          <Coffee size={30} strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <div className="font-serif" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>Notes Cafe</div>
          <div className="mt-2 text-[10.5px] font-mono" style={{ color: 'var(--color-ink-muted)', letterSpacing: '0.24em' }}>
            THE EDITORIAL UPSC PLATFORM
          </div>
        </div>
        <div style={{
          width: 180, height: 2, background: 'var(--color-border)', overflow: 'hidden', borderRadius: 999
        }}>
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
            style={{ width: '60%', height: '100%', background: 'var(--color-accent)' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
