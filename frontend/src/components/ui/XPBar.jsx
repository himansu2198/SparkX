import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';

const LEVEL_XP    = { 1: 0, 2: 200, 3: 500, 4: 900, 5: 1200, 6: 1600 };
const LEVEL_NAMES = { 1: 'Basics', 2: 'DSA', 3: 'Projects', 4: 'Resume', 5: 'Interview Prep', 6: 'Job Apply' };
const LEVEL_COLOR = { 1: '#7c6aff', 2: '#2dffc0', 3: '#f5c842', 4: '#ff6b35', 5: '#a89bff', 6: '#2dffc0' };

export default function XPBar({ xp = 0, level = 1 }) {
  const currentThreshold = LEVEL_XP[level]     || 0;
  const nextThreshold    = LEVEL_XP[level + 1] || currentThreshold + 400;
  const isMaxLevel       = level >= 6;
  const xpInLevel        = xp - currentThreshold;
  const xpNeeded         = nextThreshold - currentThreshold;
  const percent          = isMaxLevel ? 100 : Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));
  const color            = LEVEL_COLOR[level];

  return (
    <div className="w-full">
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <TrendingUp size={14} style={{ color }} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-mono">Level {level}</p>
            <p className="text-sm font-semibold text-text-primary">{LEVEL_NAMES[level]}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end">
            <Zap size={14} className="text-gold" fill="#f5c842" />
            <span className="font-mono font-bold text-lg text-gold">{xp.toLocaleString()}</span>
            <span className="text-xs text-text-muted font-mono">XP</span>
          </div>
          {!isMaxLevel && (
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {(nextThreshold - xp).toLocaleString()} to next level
            </p>
          )}
        </div>
      </div>

      {/* Bar track with glow */}
      <div className="relative">
        {/* Glow behind bar */}
        <div className="absolute inset-0 rounded-full blur-md opacity-40"
          style={{ background: `linear-gradient(90deg, ${color}44, transparent)`,
                   transform: `scaleX(${percent / 100})`, transformOrigin: 'left' }} />

        <div className="relative w-full h-3 bg-surface rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full rounded-full relative overflow-hidden"
            style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          >
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', delay: 1.5 }}
            />
          </motion.div>
        </div>
      </div>

      {/* Milestone dots */}
      {!isMaxLevel && (
        <div className="flex items-center justify-between mt-2 px-0.5">
          <span className="text-xs text-text-muted font-mono">{currentThreshold.toLocaleString()}</span>
          <span className="text-xs font-mono" style={{ color: `${color}99` }}>
            {Math.round(percent)}% complete
          </span>
          <span className="text-xs text-text-muted font-mono">{nextThreshold.toLocaleString()}</span>
        </div>
      )}

      {isMaxLevel && (
        <p className="text-center text-xs text-jade font-mono mt-2">
          🎉 Maximum level reached — You're job ready!
        </p>
      )}
    </div>
  );
}