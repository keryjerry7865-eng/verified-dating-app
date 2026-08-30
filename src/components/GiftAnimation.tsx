import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

type GiftAnimationProps = {
  gift: { name: string; emoji: string } | null;
  onClose: () => void;
};

export default function GiftAnimation({ gift, onClose }: GiftAnimationProps) {
  return (
    <AnimatePresence>
      {gift && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-black/60 p-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button type="button" onClick={onClose} aria-label="Close gift animation" className="absolute right-5 top-5 rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
            <X className="h-5 w-5" />
          </button>
          <motion.div className="pointer-events-none absolute left-0 text-7xl" initial={{ x: '-20vw', rotateY: 0 }} animate={{ x: '120vw', rotateY: 360 }} transition={{ duration: 2.2, ease: 'easeInOut' }}>
            {gift.name === 'Car' || gift.name === 'Bike' ? gift.emoji : ''}
          </motion.div>
          <motion.div className="relative text-center" initial={{ scale: 0.2, rotate: -12, y: 80 }} animate={{ scale: [0.2, 1.25, 1], rotate: [ -12, 8, 0 ], y: 0 }} transition={{ duration: 0.8, type: 'spring', bounce: 0.45 }}>
            <div className="text-9xl drop-shadow-[0_12px_12px_rgba(0,0,0,0.35)]">{gift.emoji}</div>
            <p className="mt-4 text-2xl font-black text-white">{gift.name} sent!</p>
          </motion.div>
          {Array.from({ length: 14 }).map((_, index) => (
            <motion.span key={index} className="pointer-events-none absolute text-3xl" initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }} animate={{ x: Math.cos(index) * (120 + index * 10), y: Math.sin(index) * (100 + index * 9), opacity: 0, scale: 1.4 }} transition={{ duration: 1.2, delay: index * 0.025 }}>
              {index % 2 ? '✨' : gift.emoji}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
