import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mentorsAPI } from '../api';
import { Users, Star, X, ExternalLink, Search, Compass } from 'lucide-react';

const Github = ({ size, className, style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);
const Linkedin = ({ size, className, style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const LEVEL_NAMES = { 1:'Basics', 2:'DSA', 3:'Projects', 4:'Resume', 5:'Interview Prep', 6:'Job Apply' };
const EXPERTISE_COLORS = {
  Backend: '#7c6aff', DSA: '#2dffc0', Frontend: '#f5c842',
  DevOps: '#ff6b35', 'Machine Learning': '#a89bff', default: '#8888aa',
};
function getColor(expertise) {
  for (const [k, v] of Object.entries(EXPERTISE_COLORS))
    if (expertise?.includes(k)) return v;
  return EXPERTISE_COLORS.default;
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonMentorCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="glass overflow-hidden"
      style={{ borderRadius: 20 }}
    >
      {/* Color bar */}
      <div className="h-1 shimmer" style={{ background: 'rgba(124,106,255,0.2)' }} />

      <div className="p-7 flex flex-col gap-4">
        {/* Avatar + name row */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl shimmer flex-shrink-0"
            style={{ background: 'rgba(124,106,255,0.08)' }} />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div className="h-4 w-32 rounded-lg shimmer" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 w-24 rounded-lg shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>

        {/* Tags row */}
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-6 w-20 rounded-full shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <div className="h-6 w-14 rounded-full shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>

        {/* Advice lines */}
        <div className="flex flex-col gap-2">
          <div className="h-3 w-full rounded-lg shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-3 w-5/6 rounded-lg shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
          <div className="h-3 w-4/6 rounded-lg shimmer" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>

        {/* CTA */}
        <div className="h-3 w-28 rounded-lg shimmer mt-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    </motion.div>
  );
}

// ── Empty State: No mentors at all ────────────────────────────────────────────
function EmptyAllMentors() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-28 text-center max-w-sm mx-auto"
    >
      {/* Animated icon cluster */}
      <div className="relative w-28 h-28 mb-8">
        {/* Orbit rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{ border: '1px dashed rgba(45,255,192,0.2)' }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          className="absolute inset-3 rounded-full"
          style={{ border: '1px dashed rgba(124,106,255,0.2)' }}
        />
        {/* Center icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(45,255,192,0.15), rgba(124,106,255,0.1))',
              border: '1px solid rgba(45,255,192,0.25)',
              boxShadow: '0 0 32px rgba(45,255,192,0.12)',
            }}
          >
            <Users size={28} style={{ color: '#2dffc0', opacity: 0.8 }} />
          </div>
        </motion.div>
        {/* Orbiting dots */}
        {[0, 120, 240].map((deg, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6 + i * 2, ease: 'linear' }}
            className="absolute inset-0"
            style={{ transformOrigin: 'center' }}
          >
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i === 0 ? '#2dffc0' : i === 1 ? '#7c6aff' : '#f5c842',
                top: '4px', left: '50%', transform: 'translateX(-50%)',
                boxShadow: `0 0 6px ${i === 0 ? '#2dffc0' : i === 1 ? '#7c6aff' : '#f5c842'}`,
              }}
            />
          </motion.div>
        ))}
      </div>

      <h3 className="font-display font-bold text-2xl text-text-primary mb-3">
        No Mentors Yet
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-2">
        Senior mentors will appear here once they're added to the platform.
      </p>
      <p className="text-text-muted text-xs font-mono">
        Check back soon — the community is growing!
      </p>

      {/* Decorative pills */}
      <div className="flex gap-2 mt-6 flex-wrap justify-center">
        {['Backend', 'DSA', 'Frontend', 'DevOps'].map((tag, i) => (
          <motion.span
            key={tag}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.5 + i * 0.4, ease: 'easeInOut' }}
            className="text-xs px-3 py-1 rounded-full font-mono border"
            style={{
              color: Object.values(EXPERTISE_COLORS)[i],
              background: `${Object.values(EXPERTISE_COLORS)[i]}10`,
              borderColor: `${Object.values(EXPERTISE_COLORS)[i]}25`,
            }}
          >
            {tag}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// ── Empty State: Filter has no results ────────────────────────────────────────
function EmptyFilteredMentors({ filter, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center max-w-xs mx-auto"
    >
      <motion.div
        animate={{ rotate: [0, -10, 10, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: 'rgba(124,106,255,0.1)',
          border: '1px solid rgba(124,106,255,0.25)',
        }}
      >
        <Search size={26} style={{ color: '#7c6aff', opacity: 0.7 }} />
      </motion.div>

      <h3 className="font-display font-bold text-xl text-text-primary mb-2">
        No mentors here
      </h3>
      <p className="text-text-secondary text-sm leading-relaxed mb-6">
        No mentors are at the <span className="text-accent-soft font-medium">{LEVEL_NAMES[filter]}</span> level yet.
        Try a different filter.
      </p>

      <motion.button
        whileHover={{ y: -1, boxShadow: '0 0 20px rgba(124,106,255,0.2)' }}
        whileTap={{ scale: 0.97 }}
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all"
        style={{
          background: 'rgba(124,106,255,0.12)',
          borderColor: 'rgba(124,106,255,0.35)',
          color: '#a89bff',
        }}
      >
        <Compass size={14} />
        View All Mentors
      </motion.button>
    </motion.div>
  );
}

// ── Mentor Modal ──────────────────────────────────────────────────────────────
function MentorModal({ mentor, onClose, color }) {
  const tags = mentor.expertise.split(',').map(s => s.trim());

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(3,3,10,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="glass w-full max-w-lg relative overflow-hidden"
        style={{ borderRadius: 24, borderColor: `${color}30`, boxShadow: `0 0 80px ${color}20` }}
      >
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${color}, ${color}44)` }} />
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-text-muted hover:text-text-primary transition-colors z-10">
          <X size={16} />
        </button>
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl"
              style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                       border: `2px solid ${color}40`, color, boxShadow: `0 0 20px ${color}20` }}>
              {mentor.name[0]}
            </div>
            <div>
              <h2 className="font-display font-bold text-2xl text-text-primary">{mentor.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Star size={13} style={{ color }} fill={color} />
                <span className="text-sm text-text-secondary">
                  Level {mentor.current_level} — {LEVEL_NAMES[mentor.current_level]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map(tag => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-mono border"
                style={{ color, background: `${color}12`, borderColor: `${color}35` }}>
                {tag}
              </span>
            ))}
          </div>
          <div className="glass p-5 rounded-2xl mb-6" style={{ borderColor: `${color}20` }}>
            <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color }}>
              Their Advice
            </p>
            <p className="text-text-primary leading-relaxed text-sm">"{mentor.advice_text}"</p>
          </div>
          <div className="flex gap-3">
            {mentor.github_url && (
              <a href={mentor.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 glass justify-center py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary border border-border hover:border-accent/30 transition-all">
                <Github size={16} /> GitHub
              </a>
            )}
            {mentor.linkedin_url && (
              <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 glass justify-center py-3 rounded-xl text-sm text-text-secondary hover:text-accent-soft border border-border hover:border-accent/30 transition-all">
                <Linkedin size={16} /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Mentor Card ───────────────────────────────────────────────────────────────
function MentorCard({ mentor, index, onClick }) {
  const color = getColor(mentor.expertise);
  const tags  = mentor.expertise.split(',').map(s => s.trim());

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, boxShadow: `0 20px 60px ${color}15` }}
      onClick={() => onClick(mentor)}
      className="glass overflow-hidden cursor-pointer group transition-all duration-300"
      style={{ borderRadius: 20 }}
    >
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}99, ${color}22)` }} />
      <div className="p-7">
        <div className="flex items-start gap-4 mb-5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-2xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${color}35, ${color}12)`,
                     border: `1px solid ${color}40`, color }}
          >
            {mentor.name[0]}
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg text-text-primary group-hover:text-white transition-colors">
              {mentor.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={12} style={{ color }} fill={color} />
              <span className="text-xs text-text-secondary font-mono">
                Lv.{mentor.current_level} · {LEVEL_NAMES[mentor.current_level]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {tags.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-mono border"
              style={{ color, background: `${color}12`, borderColor: `${color}30` }}>
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
          "{mentor.advice_text}"
        </p>
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="mt-5 flex items-center gap-1.5 text-sm font-medium"
          style={{ color }}
        >
          <ExternalLink size={13} />
          View Full Advice →
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MentorsPage() {
  const [mentors,  setMentors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    mentorsAPI.getAll()
      .then(r => setMentors(r.data))
      .finally(() => setLoading(false));
  }, []);

  const uniqueLevels  = [...new Set(mentors.map(m => m.current_level))].sort();
  const filtered      = filter === 'all' ? mentors : mentors.filter(m => m.current_level === Number(filter));
  const selectedColor = selected ? getColor(selected.expertise) : '#7c6aff';

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <MentorModal mentor={selected} color={selectedColor} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(45,255,192,0.12)', border: '1px solid rgba(45,255,192,0.25)' }}>
            <Users size={20} className="text-jade" />
          </div>
          <h1 className="font-display font-bold text-4xl gradient-text">Senior Mentors</h1>
        </div>
        <p className="text-text-secondary">
          Learn from seniors who've walked this path. Click any card to read their advice.
        </p>
      </motion.div>

      {/* Filters — hide while loading */}
      {!loading && mentors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 flex-wrap mb-10"
        >
          <button
            onClick={() => setFilter('all')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all"
            style={filter === 'all' ? {
              background: 'rgba(45,255,192,0.12)', borderColor: 'rgba(45,255,192,0.4)', color: '#2dffc0',
            } : { background: 'rgba(13,13,26,0.6)', borderColor: '#1e1e3a', color: '#8888aa' }}
          >
            All ({mentors.length})
          </button>
          {uniqueLevels.map(lvl => (
            <button key={lvl} onClick={() => setFilter(String(lvl))}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all"
              style={filter === String(lvl) ? {
                background: 'rgba(124,106,255,0.15)', borderColor: 'rgba(124,106,255,0.45)', color: '#a89bff',
              } : { background: 'rgba(13,13,26,0.6)', borderColor: '#1e1e3a', color: '#8888aa' }}
            >
              {LEVEL_NAMES[lvl]}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Content ── */}
      {loading ? (
        // Skeleton grid — shaped like real cards
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonMentorCard key={i} index={i} />)}
        </div>

      ) : mentors.length === 0 ? (
        // No mentors at all
        <EmptyAllMentors />

      ) : filtered.length === 0 ? (
        // Filter returned nothing
        <EmptyFilteredMentors filter={Number(filter)} onReset={() => setFilter('all')} />

      ) : (
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((mentor, i) => (
              <MentorCard key={mentor.id} mentor={mentor} index={i} onClick={setSelected} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}