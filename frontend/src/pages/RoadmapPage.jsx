import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { roadmapAPI, levelsAPI } from '../api';
import { Map, Star, Clock, ExternalLink, ChevronDown, Lock } from 'lucide-react';

const LEVEL_EMOJIS = { 1:'📚', 2:'💻', 3:'🔨', 4:'📄', 5:'🎤', 6:'💼' };
const LEVEL_COLOR  = { 1:'#7c6aff', 2:'#2dffc0', 3:'#f5c842', 4:'#ff6b35', 5:'#a89bff', 6:'#2dffc0' };

function RoadmapStep({ step, index, isLast, color }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      viewport={{ once: true }}
      className="relative flex gap-6"
    >
      {/* Vertical connector line with animation */}
      {!isLast && (
        <div className="absolute left-[19px] top-12 bottom-0 w-px overflow-hidden">
          <motion.div
            className="w-full h-full"
            style={{ background: `linear-gradient(to bottom, ${color}60, ${color}10)` }}
            initial={{ scaleY: 0, transformOrigin: 'top' }}
            whileInView={{ scaleY: 1 }}
            transition={{ delay: index * 0.08 + 0.3, duration: 0.6 }}
            viewport={{ once: true }}
          />
        </div>
      )}

      {/* Step bubble */}
      <div className="relative flex-shrink-0 mt-1">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-sm font-bold border-2"
          style={step.is_milestone ? {
            background: `${color}20`,
            borderColor: color,
            color,
            boxShadow: `0 0 20px ${color}40`,
          } : {
            background: 'rgba(30,30,58,0.8)',
            borderColor: `${color}50`,
            color: `${color}cc`,
          }}
        >
          {index + 1}
        </motion.div>

        {/* Milestone pulse */}
        {step.is_milestone && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${color}`, pointerEvents: 'none' }}
          />
        )}
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ y: -2 }}
        className="flex-1 glass mb-5 overflow-hidden cursor-pointer"
        style={{
          borderRadius: 16,
          borderColor: expanded ? `${color}30` : undefined,
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="p-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {step.is_milestone && (
              <Star size={15} style={{ color }} fill={color} className="flex-shrink-0" />
            )}
            <span className="font-medium text-text-primary">{step.step_title}</span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {step.estimated_hours && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono bg-surface border border-border rounded-full px-2.5 py-1">
                <Clock size={11} />
                {step.estimated_hours}h
              </div>
            )}
            {step.is_milestone && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-full border"
                style={{ color, background: `${color}15`, borderColor: `${color}30` }}>
                MILESTONE
              </span>
            )}
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={16} className="text-text-muted" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 border-t border-border pt-4">
                <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                {step.resource_url && (
                  <a href={step.resource_url} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm text-accent hover:text-accent-soft transition-colors">
                    <ExternalLink size={13} /> View Resource
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function RoadmapPage() {
  const { user }    = useAuth();
  const [levels,  setLevels]  = useState([]);
  const [active,  setActive]  = useState(user?.level || 1);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { levelsAPI.getAll().then(r => setLevels(r.data)); }, []);

  useEffect(() => {
    setLoading(true); setRoadmap(null);
    roadmapAPI.getByLevel(active)
      .then(r => setRoadmap(r.data))
      .catch(() => setRoadmap(null))
      .finally(() => setLoading(false));
  }, [active]);

  const color = LEVEL_COLOR[active];

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-6 md:px-10 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,106,255,0.15)', border: '1px solid rgba(124,106,255,0.3)' }}>
            <Map size={20} className="text-accent" />
          </div>
          <h1 className="font-display font-bold text-4xl gradient-text">Roadmap</h1>
        </div>
        <p className="text-text-secondary">Step-by-step guide — always know exactly what to do next.</p>
      </motion.div>

      {/* Level tabs */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
        {levels.map((lvl) => {
          const locked  = lvl.id > (user?.level || 1);
          const isActive = lvl.id === active;
          const c = LEVEL_COLOR[lvl.id];
          return (
            <motion.button key={lvl.id}
              whileHover={!locked ? { y: -2 } : {}}
              whileTap={!locked ? { scale: 0.96 } : {}}
              onClick={() => !locked && setActive(lvl.id)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all"
              style={isActive ? {
                background: `${c}18`, borderColor: `${c}50`, color: c,
                boxShadow: `0 0 20px ${c}20`,
              } : locked ? {
                borderColor: 'rgba(30,30,58,1)', color: '#44445a', opacity: 0.5, cursor: 'not-allowed'
              } : {
                background: 'rgba(13,13,26,0.7)', borderColor: '#1e1e3a', color: '#8888aa'
              }}
            >
              <span>{LEVEL_EMOJIS[lvl.id]}</span>
              <span>{lvl.name}</span>
              {locked && <Lock size={11} />}
            </motion.button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-6 mb-5">
                <div className="w-10 h-10 rounded-full shimmer flex-shrink-0" />
                <div className="flex-1 glass h-16 shimmer" style={{ borderRadius: 16 }} />
              </div>
            ))}
          </motion.div>
        ) : roadmap ? (
          <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Level banner */}
            <div className="glass p-6 mb-8 border" style={{ borderRadius: 18, borderColor: `${color}25` }}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{LEVEL_EMOJIS[active]}</span>
                <div>
                  <h2 className="font-display font-bold text-2xl text-text-primary">{roadmap.level_name}</h2>
                  <p className="text-text-secondary text-sm mt-1">
                    {roadmap.steps.length} steps · {roadmap.steps.filter(s => s.is_milestone).length} milestones
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            {roadmap.steps.map((step, i) => (
              <RoadmapStep key={step.id} step={step} index={i}
                isLast={i === roadmap.steps.length - 1} color={color} />
            ))}

            {/* End card */}
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-center glass p-8 mt-4"
              style={{ borderRadius: 18, borderColor: `${color}20` }}
            >
              <div className="text-3xl mb-3">🎯</div>
              <p className="font-display font-semibold text-xl text-text-primary">Complete all steps</p>
              <p className="text-text-secondary mt-1">to unlock the next level</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}