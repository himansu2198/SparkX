import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Zap, ExternalLink } from 'lucide-react';

export default function TaskCard({ task, onComplete, delay = 0 }) {
  const [completing, setCompleting] = useState(false);
  const [justDone,   setJustDone]   = useState(false);
  const done = task.status === 'completed';

  const handleComplete = async () => {
    if (done || completing) return;
    setCompleting(true);
    setJustDone(true);
    try {
      await onComplete(task.id);
    } finally {
      setCompleting(false);
      setTimeout(() => setJustDone(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}

      // Scale pop on completion
      whileTap={!done ? { scale: 0.98 } : {}}

      // Hover lift only when not done
      whileHover={!done ? { y: -2 } : {}}

      className="flex items-start gap-4 transition-all duration-300 relative overflow-visible"
      style={{
        borderRadius: 14,
        padding: '1.25rem',
        // Done = green tinted card; pending = dimmed glass
        background: done
          ? 'rgba(45,255,192,0.04)'
          : 'rgba(13,13,26,0.55)',
        border: justDone
          ? '1px solid rgba(45,255,192,0.5)'
          : done
          ? '1px solid rgba(45,255,192,0.18)'
          : '1px solid rgba(30,30,58,0.85)',
        opacity: done ? 0.72 : 1,
        boxShadow: justDone
          ? '0 0 0 1px rgba(45,255,192,0.4), 0 0 32px rgba(45,255,192,0.15)'
          : done
          ? '0 0 12px rgba(45,255,192,0.06)'
          : 'none',
        transition: 'all 0.4s ease',
      }}
    >

      {/* ── Radial flash overlay on completion ── */}
      <AnimatePresence>
        {justDone && (
          <motion.div
            initial={{ opacity: 0.7, scale: 0.6 }}
            animate={{ opacity: 0,   scale: 2   }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 12% 50%, rgba(45,255,192,0.22) 0%, transparent 65%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Floating +XP chip ── */}
      <AnimatePresence>
        {justDone && (
          <motion.div
            key="xp-float"
            initial={{ opacity: 0, y: 0, x: -4, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -52, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-10 top-3 pointer-events-none z-20 flex items-center gap-1 px-2.5 py-1 rounded-full font-mono font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(45,255,192,0.25), rgba(124,106,255,0.2))',
              border: '1px solid rgba(45,255,192,0.5)',
              color: '#2dffc0',
              boxShadow: '0 0 16px rgba(45,255,192,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={12} fill="#2dffc0" style={{ color: '#2dffc0' }} />
            +{task.xp_reward} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Checkbox ── */}
      <motion.button
        onClick={handleComplete}
        disabled={done || completing}
        whileHover={!done ? { scale: 1.15 } : {}}
        whileTap={!done ? { scale: 0.8 } : {}}
        className="mt-0.5 flex-shrink-0 relative"
      >
        {/* Ring burst on completion */}
        <AnimatePresence>
          {justDone && (
            <motion.div
              key="ring"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: '2px solid rgba(45,255,192,0.7)' }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1,  rotate: 0   }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              <CheckCircle2
                size={24}
                className="text-jade"
                style={{ filter: 'drop-shadow(0 0 8px rgba(45,255,192,0.6))' }}
              />
            </motion.div>
          ) : completing ? (
            <motion.div
              key="loading"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.65, ease: 'linear' }}
            >
              <Circle size={24} className="text-accent" />
            </motion.div>
          ) : (
            <motion.div key="empty">
              <Circle size={24} className="text-text-muted hover:text-accent transition-colors" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">

          {/* Title — slides + fades on complete */}
          <motion.p
            animate={justDone ? { x: [0, 6, 0] } : {}}
            transition={{ duration: 0.35 }}
            className={`text-sm font-medium leading-relaxed transition-all duration-300 ${
              done ? 'line-through text-text-muted' : 'text-text-primary'
            }`}
          >
            {task.title}
          </motion.p>

          {/* XP badge — bounces on complete */}
          <motion.div
            animate={justDone
              ? { scale: [1, 1.45, 0.9, 1.15, 1], y: [0, -6, 0, -2, 0] }
              : {}
            }
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 border flex-shrink-0 ${
              done
                ? 'bg-jade/10 border-jade/25 text-jade'
                : 'bg-gold/10 border-gold/20 text-gold'
            }`}
          >
            <Zap
              size={11}
              fill={done ? '#2dffc0' : '#f5c842'}
              style={{ color: done ? '#2dffc0' : '#f5c842' }}
            />
            <span className="font-mono text-xs font-semibold">
              {done ? '' : '+'}{task.xp_reward}
            </span>
          </motion.div>
        </div>

        {task.description && (
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          {task.resource_url && (
            <a
              href={task.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-soft transition-colors"
            >
              <ExternalLink size={11} /> Resource
            </a>
          )}
          {done && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-jade/70 font-mono flex items-center gap-1"
            >
              <CheckCircle2 size={10} /> Completed
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}