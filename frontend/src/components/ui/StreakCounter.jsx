import { motion } from 'framer-motion';

export default function StreakCounter({ streak = 0, size = 'md' }) {
  const isHot = streak >= 3;
  const isOnFire = streak >= 7;

  const sizes = {
    sm: { wrap: 'px-3 py-1.5', icon: 'text-lg', text: 'text-sm' },
    md: { wrap: 'px-4 py-2.5', icon: 'text-2xl', text: 'text-base' },
    lg: { wrap: 'px-6 py-4',   icon: 'text-4xl', text: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <div className={`glass inline-flex items-center gap-3 rounded-2xl ${s.wrap}`}>
      {/* Animated fire emoji */}
      <motion.span
        className={s.icon}
        animate={isOnFire
          ? { scale: [1, 1.15, 1], rotate: [-5, 5, -5] }
          : isHot
          ? { scale: [1, 1.08, 1] }
          : {}
        }
        transition={{ repeat: Infinity, duration: isOnFire ? 0.8 : 1.5, ease: 'easeInOut' }}
      >
        🔥
      </motion.span>

      <div>
        <motion.div
          key={streak}
          initial={{ scale: 1.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`font-display font-bold ${s.text} ${
            isOnFire ? 'gradient-text-gold' : isHot ? 'text-ember' : 'text-text-primary'
          }`}
        >
          {streak}
        </motion.div>
        <div className="text-xs text-text-secondary font-body">
          {streak === 1 ? 'day streak' : 'day streak'}
        </div>
      </div>

      {/* Status badge */}
      {isOnFire && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-1 bg-gold/20 border border-gold/40 rounded-full px-2 py-0.5 text-xs text-gold font-mono"
        >
          ON FIRE
        </motion.div>
      )}
    </div>
  );
}