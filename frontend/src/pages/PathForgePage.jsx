import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import {
  Zap, Sparkles, ChevronRight, Clock, Trophy,
  BookOpen, Code, Wrench, FileText, Video,
  RotateCcw, Save, History, X, ChevronDown,
  Target, Flame, Star
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const EXAMPLES = [
  "Become a Backend Developer",
  "Master Data Structures & Algorithms",
  "Learn Cloud Computing on AWS",
  "Build Full Stack Apps with React",
  "Get into Machine Learning",
  "Master System Design",
  "Learn DevOps & CI/CD",
  "Become a Competitive Programmer",
];

const RESOURCE_ICONS = {
  video:    { icon: Video,    color: '#ff6b35', label: 'Video' },
  article:  { icon: FileText, color: '#7c6aff', label: 'Article' },
  practice: { icon: Code,     color: '#2dffc0', label: 'Practice' },
  project:  { icon: Wrench,   color: '#f5c842', label: 'Project' },
  book:     { icon: BookOpen, color: '#a89bff', label: 'Book' },
};

const LEVEL_OPTIONS = [
  { value: 'beginner',     label: 'Beginner',     desc: 'Just starting out' },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Know the basics' },
  { value: 'advanced',     label: 'Advanced',      desc: 'Ready to go deep' },
];

// ── Animated typing placeholder ───────────────────────────────────────────────
function AnimatedPlaceholder({ active }) {
  const [idx, setIdx]      = useState(0);
  const [text, setText]    = useState('');
  const [deleting, setDel] = useState(false);

  useEffect(() => {
    if (!active) return;
    const target = EXAMPLES[idx];
    const speed  = deleting ? 30 : 55;

    const t = setTimeout(() => {
      if (!deleting) {
        if (text.length < target.length) {
          setText(target.slice(0, text.length + 1));
        } else {
          setTimeout(() => setDel(true), 2000);
        }
      } else {
        if (text.length > 0) {
          setText(text.slice(0, -1));
        } else {
          setDel(false);
          setIdx((idx + 1) % EXAMPLES.length);
        }
      }
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, idx, active]);

  return (
    <span className="text-text-muted pointer-events-none select-none">
      {text}<span className="animate-pulse">|</span>
    </span>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskItem({ task, index, color }) {
  const ResIcon = RESOURCE_ICONS[task.resource_type] || RESOURCE_ICONS.article;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="flex items-start gap-4 p-4 rounded-2xl border transition-all group hover:border-opacity-40"
      style={{
        background: `${color}06`,
        borderColor: `${color}18`,
      }}
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold mt-0.5"
        style={{ background: `${color}20`, color }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-sm font-semibold text-text-primary leading-snug">{task.title}</p>
          <div
            className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold"
            style={{ background: '#f5c84218', border: '1px solid #f5c84230', color: '#f5c842' }}
          >
            <Zap size={9} fill="#f5c842" />+{task.xp}
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed mb-2">{task.description}</p>

        {task.resource_hint && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: ResIcon.color }}>
            <ResIcon.icon size={11} />
            <span className="opacity-80">{task.resource_hint}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Level card ────────────────────────────────────────────────────────────────
function LevelCard({ level, index, totalLevels }) {
  const [open, setOpen] = useState(index === 0);
  const color           = level.color || '#7c6aff';
  const levelXP         = level.tasks?.reduce((s, t) => s + t.xp, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="relative"
    >
      {index < totalLevels - 1 && (
        <div
          className="absolute left-7 top-full w-px h-6 z-10"
          style={{ background: `linear-gradient(to bottom, ${color}60, transparent)` }}
        />
      )}

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          borderColor: open ? `${color}40` : `${color}18`,
          boxShadow:   open ? `0 0 40px ${color}12` : 'none',
          transition:  'all 0.3s ease',
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-4 p-5 text-left transition-all"
          style={{ background: open ? `${color}08` : 'rgba(13,13,26,0.6)' }}
        >
          <div
            className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
            style={{
              background:  `${color}20`,
              border:      `1px solid ${color}35`,
              boxShadow:   open ? `0 0 16px ${color}30` : 'none',
            }}
          >
            {level.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-mono uppercase tracking-wider" style={{ color }}>
                Level {level.id}
              </span>
              <span className="text-xs text-text-muted">·</span>
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Clock size={10} /> {level.duration_weeks}w
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-text-primary leading-tight">
              {level.title}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5 truncate">{level.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div
              className="hidden sm:flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full"
              style={{ background: '#f5c84212', border: '1px solid #f5c84225', color: '#f5c842' }}
            >
              <Zap size={10} fill="#f5c842" />{levelXP} XP
            </div>
            <div className="text-xs text-text-muted font-mono">
              {level.tasks?.length || 0} tasks
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={16} className="text-text-muted" />
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="p-4 pt-0 flex flex-col gap-2.5"
                style={{ borderTop: `1px solid ${color}18` }}
              >
                <div className="pt-4 flex flex-col gap-2.5">
                  {level.tasks?.map((task, i) => (
                    <TaskItem key={task.id || i} task={task} index={i} color={color} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── History sidebar ───────────────────────────────────────────────────────────
function HistoryPanel({ onSelect, onClose }) {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pathforge/history')
      .then(r => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-80 z-50 flex flex-col"
      style={{
        background:    'rgba(8,8,20,0.97)',
        backdropFilter: 'blur(24px)',
        borderLeft:    '1px solid rgba(124,106,255,0.15)',
      }}
    >
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div className="flex items-center gap-2">
          <History size={16} className="text-accent" />
          <span className="font-display font-bold text-text-primary">My Roadmaps</span>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <BookOpen size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No saved roadmaps yet.</p>
          </div>
        ) : items.map(item => (
          <motion.button
            key={item.id}
            whileHover={{ x: 4 }}
            onClick={() => { onSelect(item.id); onClose(); }}
            className="text-left p-4 rounded-xl border border-border hover:border-accent/30 transition-all"
            style={{ background: 'rgba(13,13,26,0.8)' }}
          >
            <p className="text-sm font-medium text-text-primary truncate mb-1">{item.goal}</p>
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Zap size={10} className="text-gold" fill="#f5c842" />
                {item.total_xp} XP
              </span>
              <span>{item.level_count} levels</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PathForgePage() {
  const [goal, setGoal]           = useState('');
  const [userLevel, setUserLevel] = useState('beginner');
  const [loading, setLoading]     = useState(false);
  const [roadmap, setRoadmap]     = useState(null);
  const [error, setError]         = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [loadingMsg, setLoadingMsg]   = useState(0);
  const inputRef = useRef(null);

  const LOADING_MSGS = [
    "Analyzing your goal...",
    "Consulting the learning matrix...",
    "Forging your personalized path...",
    "Structuring levels and tasks...",
    "Adding XP rewards...",
    "Almost ready — polishing the roadmap...",
  ];

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MSGS.length), 2200);
    return () => clearInterval(t);
  }, [loading]);

  // ── Generate roadmap ────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!goal.trim() || goal.trim().length < 3) {
      setError('Please enter a goal (at least 3 characters).');
      return;
    }

    setError('');
    setLoading(true);
    setRoadmap(null);
    setLoadingMsg(0);

    try {
      console.log('🚀 Sending request:', { goal: goal.trim(), user_level: userLevel });

      const { data } = await api.post('/pathforge/generate', {
        goal:       goal.trim(),
        user_level: userLevel,   // ✅ correctly sent to backend
        save:       true,
      });

      console.log('✅ API response:', data);
      console.log('📋 Roadmap levels:', data?.roadmap?.levels?.length);

      // ── Sanity check ──────────────────────────────────────────────────────
      if (!data?.roadmap?.levels?.length) {
        setError('AI returned an empty roadmap. Please try again with a different goal.');
        return;
      }

      setRoadmap(data.roadmap);

    } catch (err) {
      console.error('❌ PathForge error:', err);
      console.error('❌ Error response:', err.response?.data);

      // api/index.js interceptor sets err.userMessage for us
      const message = err.userMessage
        || err.response?.data?.detail
        || 'Generation failed. Please check your API key and try again.';

      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setLoading(false);
    }
  };

  // ── Load saved roadmap ──────────────────────────────────────────────────────
  const loadSaved = async (id) => {
    setLoading(true);
    setRoadmap(null);
    setError('');
    try {
      const { data } = await api.get(`/pathforge/${id}`);
      setGoal(data.goal);
      setRoadmap(data.roadmap);
    } catch (err) {
      setError(err.userMessage || 'Failed to load roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setRoadmap(null); setGoal(''); setError(''); };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative z-10 min-h-screen pt-24 pb-20 px-4 md:px-10">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
            style={{ background: 'rgba(124,106,255,0.08)', borderColor: 'rgba(124,106,255,0.25)' }}
          >
            <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              <Sparkles size={14} style={{ color: '#f5c842' }} />
            </motion.div>
            <span className="text-xs font-mono tracking-wider" style={{ color: '#a89bff' }}>
              PATHFORGE AI · POWERED BY GEMINI
            </span>
          </motion.div>

          <h1 className="font-display font-extrabold text-5xl md:text-6xl mb-4 leading-none">
            <span className="gradient-text">Forge</span>
            <span className="text-text-primary"> Your</span>
            <br />
            <span className="text-text-primary">Learning </span>
            <span className="gradient-text">Path</span>
          </h1>

          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Tell us your goal. Our AI builds a structured, level-by-level roadmap
            with real tasks, resources, and XP rewards — in seconds.
          </p>
        </motion.div>

        {/* ── Input section ── */}
        {!roadmap && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            {/* Goal input */}
            <div className="relative mb-4">
              <div
                className="relative rounded-2xl p-px"
                style={{ background: 'linear-gradient(135deg, rgba(124,106,255,0.4), rgba(45,255,192,0.2))' }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(8,8,20,0.95)' }}
                >
                  <Target size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-accent" />
                  <input
                    ref={inputRef}
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                    className="w-full bg-transparent px-5 py-5 text-lg text-text-primary outline-none"
                    style={{ paddingLeft: '3.25rem' }}
                    maxLength={300}
                  />
                  {!goal && (
                    <div className="absolute left-[3.25rem] top-1/2 -translate-y-1/2 text-lg pointer-events-none">
                      <AnimatedPlaceholder active={!goal} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Level selector — ✅ correctly updates userLevel state */}
            <div className="flex gap-3 mb-5">
              {LEVEL_OPTIONS.map(opt => (
                <motion.button
                  key={opt.value}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setUserLevel(opt.value)}
                  className="flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all"
                  style={userLevel === opt.value ? {
                    background:  'rgba(124,106,255,0.15)',
                    borderColor: 'rgba(124,106,255,0.5)',
                    color:       '#a89bff',
                    boxShadow:   '0 0 20px rgba(124,106,255,0.12)',
                  } : {
                    background:  'rgba(13,13,26,0.7)',
                    borderColor: '#1e1e3a',
                    color:       '#8888aa',
                  }}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                </motion.button>
              ))}
            </div>

            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
                  style={{
                    background: 'rgba(255,107,53,0.08)',
                    border:     '1px solid rgba(255,107,53,0.3)',
                    color:      '#ff6b35',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleGenerate}
                disabled={loading || !goal.trim()}
                whileHover={!loading ? { y: -2, boxShadow: '0 0 40px rgba(124,106,255,0.4)' } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                className="flex-1 py-4 rounded-2xl text-white font-display font-bold text-lg flex items-center justify-center gap-2.5 transition-all disabled:opacity-40"
                style={{
                  background: 'linear-gradient(135deg, #7c6aff, #5a4be0)',
                  boxShadow:  '0 0 30px rgba(124,106,255,0.25)',
                }}
              >
                <Sparkles size={20} />
                Forge My Path
              </motion.button>

              <motion.button
                onClick={() => setShowHistory(true)}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                className="px-5 py-4 rounded-2xl border text-text-secondary hover:text-text-primary transition-all"
                style={{ background: 'rgba(13,13,26,0.7)', borderColor: '#1e1e3a' }}
                title="View saved roadmaps"
              >
                <History size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Loading state ── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-20"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                {[...Array(3)].map((_, i) => (
                  <motion.div key={i}
                    className="absolute inset-0 rounded-full border-2"
                    style={{ borderColor: i === 0 ? '#7c6aff' : i === 1 ? '#2dffc0' : '#f5c842' }}
                    animate={{ scale: [1, 1.4 + i * 0.2, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.4 }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  >
                    <Sparkles size={32} style={{ color: '#7c6aff' }} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsg}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-display font-bold text-xl gradient-text mb-2"
                >
                  {LOADING_MSGS[loadingMsg]}
                </motion.p>
              </AnimatePresence>
              <p className="text-text-muted text-sm font-mono">This takes about 5–15 seconds</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Roadmap result ── */}
        <AnimatePresence>
          {roadmap && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Summary card */}
              <div
                className="glass p-7 rounded-3xl mb-6 relative overflow-hidden"
                style={{
                  border:     '1px solid rgba(124,106,255,0.2)',
                  boxShadow:  '0 0 60px rgba(124,106,255,0.08)',
                }}
              >
                <div
                  className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(124,106,255,0.1) 0%, transparent 70%)',
                    transform:  'translate(30%, -30%)',
                  }}
                />

                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Flame size={14} className="text-ember" />
                      <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
                        PathForge Result
                      </span>
                    </div>
                    <h2 className="font-display font-extrabold text-3xl text-text-primary mb-1">
                      {roadmap.goal}
                    </h2>
                    <p className="text-text-secondary text-sm">{roadmap.tagline}</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs text-text-muted hover:text-text-primary transition-all"
                    style={{ borderColor: '#1e1e3a' }}
                  >
                    <RotateCcw size={13} /> New Goal
                  </motion.button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total XP',  value: `${roadmap.total_xp?.toLocaleString()}`, icon: Zap,    color: '#f5c842' },
                    { label: 'Est. Time', value: `${roadmap.estimated_weeks}w`,            icon: Clock,  color: '#7c6aff' },
                    { label: 'Levels',    value: `${roadmap.levels?.length}`,              icon: Trophy, color: '#2dffc0' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className="rounded-2xl p-4 text-center"
                      style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}18` }}
                    >
                      <stat.icon size={16} className="mx-auto mb-1.5" style={{ color: stat.color }} fill={stat.color} />
                      <div className="font-display font-bold text-xl text-text-primary">{stat.value}</div>
                      <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Level cards */}
              <div className="flex flex-col gap-4 mb-8">
                {roadmap.levels?.map((level, i) => (
                  <LevelCard
                    key={level.id || i}
                    level={level}
                    index={i}
                    totalLevels={roadmap.levels.length}
                  />
                ))}
              </div>

              {/* CTA footer */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-center glass p-8 rounded-3xl"
                style={{ border: '1px solid rgba(45,255,192,0.15)' }}
              >
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-display font-bold text-xl text-text-primary mb-2">
                  Your path is forged. Start today.
                </h3>
                <p className="text-text-secondary text-sm mb-5">
                  This roadmap is saved to your account. Come back anytime.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <motion.button
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={handleReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm text-text-secondary hover:text-text-primary transition-all"
                    style={{ borderColor: '#1e1e3a' }}
                  >
                    <RotateCcw size={14} /> Generate Another
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                    style={{
                      background: 'rgba(124,106,255,0.15)',
                      border:     '1px solid rgba(124,106,255,0.3)',
                      color:      '#a89bff',
                    }}
                  >
                    <History size={14} /> View All Saved
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Example goals ── */}
        {!roadmap && !loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <p className="text-xs text-text-muted font-mono text-center mb-4 uppercase tracking-wider">
              Popular goals
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {EXAMPLES.slice(0, 6).map(ex => (
                <motion.button
                  key={ex}
                  whileHover={{ y: -2, borderColor: 'rgba(124,106,255,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setGoal(ex); inputRef.current?.focus(); }}
                  className="text-xs px-4 py-2 rounded-full border transition-all text-text-secondary hover:text-text-primary"
                  style={{ background: 'rgba(13,13,26,0.7)', borderColor: '#1e1e3a' }}
                >
                  {ex}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* ── History sidebar ── */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setShowHistory(false)}
            />
            <HistoryPanel onSelect={loadSaved} onClose={() => setShowHistory(false)} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}