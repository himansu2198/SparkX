import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { levelsAPI, tasksAPI, progressAPI } from '../api';
import XPBar from '../components/ui/XPBar';
import StreakCounter from '../components/ui/StreakCounter';
import TaskCard from '../components/ui/TaskCard';
import FeedbackModal from '../components/FeedbackModal';
import {
  Zap, CheckCircle2, TrendingUp, ChevronRight, Trophy, Star, Target, PackageOpen,
  MessageSquareHeart
} from 'lucide-react';

const LEVEL_NAMES  = { 1:'Basics', 2:'DSA', 3:'Projects', 4:'Resume', 5:'Interview Prep', 6:'Job Apply' };
const LEVEL_EMOJIS = { 1:'📚', 2:'💻', 3:'🔨', 4:'📄', 5:'🎤', 6:'💼' };
const LEVEL_COLOR  = { 1:'#7c6aff', 2:'#2dffc0', 3:'#f5c842', 4:'#ff6b35', 5:'#a89bff', 6:'#2dffc0' };

// ── Shimmer block helper ──────────────────────────────────────────────────────
function Bone({ w = 'w-full', h = 'h-4', rounded = 'rounded-lg', className = '' }) {
  return (
    <div className={`shimmer ${w} ${h} ${rounded} ${className}`}
      style={{ background: 'rgba(255,255,255,0.05)' }} />
  );
}

// ── Skeleton: Hero card ───────────────────────────────────────────────────────
function SkeletonHero() {
  return (
    <div className="lg:col-span-2 glass p-8 relative overflow-hidden" style={{ borderRadius: 20 }}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-col gap-3 flex-1">
          <Bone w="w-28" h="h-3" />
          <Bone w="w-48" h="h-7" />
          <Bone w="w-36" h="h-6" rounded="rounded-full" />
        </div>
        <Bone w="w-16" h="h-16" rounded="rounded-2xl" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <Bone w="w-20" h="h-3" />
          <Bone w="w-16" h="h-3" />
        </div>
        <Bone w="w-full" h="h-2" rounded="rounded-full" />
      </div>
    </div>
  );
}

// ── Skeleton: Streak card ─────────────────────────────────────────────────────
function SkeletonStreak() {
  return (
    <div className="glass p-8 flex flex-col items-center justify-center gap-4" style={{ borderRadius: 20 }}>
      <Bone w="w-24" h="h-3" />
      <Bone w="w-20" h="h-20" rounded="rounded-2xl" />
      <Bone w="w-32" h="h-3" />
      <Bone w="w-28" h="h-3" />
    </div>
  );
}

// ── Skeleton: Stat card ───────────────────────────────────────────────────────
function SkeletonStatCard({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass p-6" style={{ borderRadius: 16 }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <Bone w="w-8" h="h-8" rounded="rounded-xl" />
        <Bone w="w-20" h="h-3" />
      </div>
      <Bone w="w-28" h="h-8" rounded="rounded-xl" />
    </motion.div>
  );
}

// ── Skeleton: Level sidebar item ──────────────────────────────────────────────
function SkeletonLevelItem({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <Bone w="w-8" h="h-8" rounded="rounded-xl" />
      <div className="flex-1 flex flex-col gap-2">
        <Bone w="w-24" h="h-3" />
        <Bone w="w-full" h="h-1" rounded="rounded-full" />
      </div>
    </motion.div>
  );
}

// ── Skeleton: Task card ───────────────────────────────────────────────────────
function SkeletonTaskCard({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="glass p-5 flex items-start gap-4"
      style={{ borderRadius: 14 }}
    >
      <Bone w="w-6" h="h-6" rounded="rounded-full" className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-3">
          <Bone w="w-3/4" h="h-4" />
          <Bone w="w-14" h="h-6" rounded="rounded-full" className="flex-shrink-0" />
        </div>
        <Bone w="w-full" h="h-3" />
        <Bone w="w-2/3" h="h-3" />
        <Bone w="w-16" h="h-3" />
      </div>
    </motion.div>
  );
}

// ── Skeleton: Panel header ────────────────────────────────────────────────────
function SkeletonPanelHeader() {
  return (
    <div className="glass p-6 mb-5 flex items-center justify-between" style={{ borderRadius: 18 }}>
      <div className="flex flex-col gap-3">
        <Bone w="w-40" h="h-7" />
        <Bone w="w-32" h="h-3" />
      </div>
      <Bone w="w-16" h="h-16" rounded="rounded-full" />
    </div>
  );
}

// ── Empty state: no tasks ─────────────────────────────────────────────────────
function EmptyTasks({ levelName, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-16 flex flex-col items-center text-center"
      style={{ borderRadius: 18 }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
        style={{
          background: `${color}12`,
          border: `1px solid ${color}30`,
          boxShadow: `0 0 32px ${color}15`,
        }}
      >
        <PackageOpen size={32} style={{ color, opacity: 0.8 }} />
        {['-top-1 -right-1', '-bottom-1 -left-1', 'top-2 -left-3'].map((pos, i) => (
          <motion.div
            key={i}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.6, ease: 'easeInOut' }}
            className={`absolute ${pos} w-2 h-2 rounded-full`}
            style={{ background: color }}
          />
        ))}
      </motion.div>

      <h3 className="font-display font-bold text-xl text-text-primary mb-2">
        No Tasks Yet
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
        Tasks for <span className="font-medium" style={{ color }}>{levelName}</span> haven't been added yet.
        Check back soon!
      </p>

      <div className="flex gap-2 mt-6">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.3 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: color }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ── Empty state: all tasks done ───────────────────────────────────────────────
function AllTasksDone({ levelName, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-16 flex flex-col items-center text-center"
      style={{ borderRadius: 18, borderColor: `${color}30`, boxShadow: `0 0 40px ${color}08` }}
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: `linear-gradient(135deg, ${color}25, ${color}08)`,
          border: `2px solid ${color}40`,
          boxShadow: `0 0 40px ${color}20`,
        }}
      >
        <Trophy size={32} style={{ color, filter: `drop-shadow(0 0 8px ${color}80)` }} />
      </motion.div>

      <h3 className="font-display font-bold text-2xl text-text-primary mb-2">
        Level Complete! 🎉
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
        You've finished all tasks in <span className="font-medium" style={{ color }}>{levelName}</span>.
        Move to the next level to keep grinding!
      </p>

      <div className="flex gap-2 mt-6">
        {['🌟', '⚡', '🏆'].map((emoji, i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -6, 0], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.4 }}
            className="text-2xl"
          >
            {emoji}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, unit, icon: Icon, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass p-6 relative overflow-hidden cursor-default"
      style={{ borderRadius: 16 }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                 transform: 'translate(30%, -30%)' }} />
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-xs text-text-muted font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-display font-bold text-3xl text-text-primary">
        {typeof value === 'number' ? value.toLocaleString() : value}
        <span className="text-base font-mono text-text-muted ml-2">{unit}</span>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, refreshUser } = useAuth();

  const [feedbackOpen,  setFeedbackOpen]  = useState(false);
  const [levels,        setLevels]        = useState([]);
  const [progress,      setProgress]      = useState([]);
  const [tasks,         setTasks]         = useState([]);
  const [activeLevel,   setActiveLevel]   = useState(user?.level || 1);
  const [loadingInit,   setLoadingInit]   = useState(true);
  const [loadingTasks,  setLoadingTasks]  = useState(false);
  const [notification,  setNotification]  = useState(null);

  // Initial load
  useEffect(() => {
    Promise.all([
      levelsAPI.getAll(),
      progressAPI.getAll(),
    ]).then(([lvlRes, progRes]) => {
      setLevels(lvlRes.data);
      setProgress(progRes.data);
    }).finally(() => setLoadingInit(false));
  }, []);

  // Task load on level switch
  useEffect(() => {
    setLoadingTasks(true);
    tasksAPI.getByLevel(activeLevel)
      .then(r => setTasks(r.data))
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));
  }, [activeLevel]);

  const handleComplete = async (taskId) => {
    try {
      const { data } = await tasksAPI.completeTask(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      await refreshUser();
      const fresh = await progressAPI.getAll();
      setProgress(fresh.data);
      setNotification({ xp: data.xp_earned, leveledUp: data.leveled_up, newLevel: data.new_level_name });
      setTimeout(() => setNotification(null), 3500);
    } catch (err) { console.error(err); }
  };

  const activeProgress  = progress.find(p => p.level_id === activeLevel);
  const completedTasks  = tasks.filter(t => t.status === 'completed').length;
  const totalTasks      = tasks.length;
  const allDone         = totalTasks > 0 && completedTasks === totalTasks;
  const color           = LEVEL_COLOR[activeLevel];

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">

      {/* ── XP Toast ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -80, x: '-50%' }}
            animate={{ opacity: 1, y: 0,   x: '-50%' }}
            exit={{   opacity: 0, y: -80,  x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 glass border border-gold/50 px-7 py-4 rounded-2xl flex items-center gap-4"
            style={{ boxShadow: '0 0 40px rgba(245,200,66,0.3)' }}
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}>
              <Zap size={22} className="text-gold" fill="#f5c842" />
            </motion.div>
            <div>
              <p className="font-display font-bold text-gold">+{notification.xp} XP earned!</p>
              {notification.leveledUp && (
                <p className="text-sm text-jade">🎉 Level Up! → {notification.newLevel}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO: User + XP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {loadingInit ? (
          <>
            <SkeletonHero />
            <SkeletonStreak />
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 glass p-8 relative overflow-hidden"
              style={{ borderRadius: 20 }}
            >
              <div className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(124,106,255,0.08) 0%, transparent 70%)' }} />
              <div className="flex items-start justify-between mb-6 relative">
                <div>
                  <p className="text-text-secondary text-sm mb-1">Welcome back 👋</p>
                  <h1 className="font-display font-bold text-3xl text-text-primary mb-2">{user?.name}</h1>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono"
                    style={{
                      background: `${LEVEL_COLOR[user?.level] || '#7c6aff'}18`,
                      border: `1px solid ${LEVEL_COLOR[user?.level] || '#7c6aff'}35`,
                      color: LEVEL_COLOR[user?.level] || '#7c6aff',
                    }}
                  >
                    <span>{LEVEL_EMOJIS[user?.level]}</span>
                    <span>Level {user?.level} — {LEVEL_NAMES[user?.level]}</span>
                  </motion.div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent via-accent to-jade flex items-center justify-center font-display font-bold text-2xl flex-shrink-0"
                  style={{ boxShadow: '0 0 30px rgba(124,106,255,0.4)' }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </motion.div>
              </div>
              <XPBar xp={user?.xp || 0} level={user?.level || 1} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-8 flex flex-col items-center justify-center relative overflow-hidden"
              style={{ borderRadius: 20 }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 40%, rgba(255,107,53,0.07) 0%, transparent 70%)' }} />
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Daily Streak</p>
              <StreakCounter streak={user?.streak || 0} size="lg" />
              <p className="text-xs text-text-muted mt-4 text-center leading-relaxed">
                Complete a task every day to keep your streak alive!
              </p>
            </motion.div>
          </>
        )}
      </div>

      {/* ── QUICK STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {loadingInit ? (
          [0, 0.06, 0.12, 0.18].map((d, i) => <SkeletonStatCard key={i} delay={d} />)
        ) : (
          <>
            <StatCard label="Total XP"      value={user?.xp || 0}     unit="XP"              icon={Zap}          color="#f5c842" delay={0.12} />
            <StatCard label="Current Level" value={user?.level || 1}  unit="/ 6"             icon={TrendingUp}   color="#7c6aff" delay={0.18} />
            <StatCard label="Tasks Done"    value={completedTasks}    unit={`/ ${totalTasks}`} icon={CheckCircle2} color="#2dffc0" delay={0.24} />
            <StatCard label="Day Streak"    value={user?.streak || 0} unit="days"             icon={Star}         color="#ff6b35" delay={0.30} />
          </>
        )}
      </div>

      {/* ── MAIN: Sidebar + Tasks ── */}
      <div className="grid md:grid-cols-[280px_1fr] gap-6">

        {/* Level sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-5 h-fit"
          style={{ borderRadius: 20 }}
        >
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4 px-1">
            Learning Levels
          </p>
          <div className="flex flex-col gap-1.5">
            {loadingInit
              ? [0, 0.05, 0.1, 0.15, 0.2, 0.25].map((d, i) => <SkeletonLevelItem key={i} delay={d} />)
              : levels.map((lvl) => {
                  const prog       = progress.find(p => p.level_id === lvl.id);
                  const pct        = prog?.percent_complete || 0;
                  const isActive   = lvl.id === activeLevel;
                  const isUnlocked = lvl.id <= (user?.level || 1);
                  const c          = LEVEL_COLOR[lvl.id];

                  return (
                    <motion.button
                      key={lvl.id}
                      onClick={() => isUnlocked && setActiveLevel(lvl.id)}
                      whileHover={isUnlocked ? { x: 4 } : {}}
                      whileTap={isUnlocked ? { scale: 0.97 } : {}}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all ${
                        isActive   ? 'border' :
                        isUnlocked ? 'hover:bg-white/5 border border-transparent' :
                                     'opacity-30 cursor-not-allowed border border-transparent'
                      }`}
                      style={isActive ? {
                        background: `${c}12`, borderColor: `${c}40`, boxShadow: `0 0 20px ${c}10`,
                      } : {}}
                    >
                      <span className="text-xl flex-shrink-0">{LEVEL_EMOJIS[lvl.id]}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}
                          style={isActive ? { color: c } : {}}>
                          {lvl.name}
                        </div>
                        <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: c }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, delay: 0.4 }}
                          />
                        </div>
                      </div>
                      {isActive   && <ChevronRight size={14} style={{ color: c }} className="flex-shrink-0" />}
                      {!isUnlocked && <span className="text-xs text-text-muted">🔒</span>}
                    </motion.button>
                  );
                })
            }
          </div>
        </motion.div>

        {/* Tasks panel */}
        <div>
          {loadingTasks && loadingInit ? (
            <SkeletonPanelHeader />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLevel}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass p-6 mb-5 flex items-center justify-between"
                style={{ borderRadius: 18 }}
              >
                <div>
                  <h2 className="font-display font-bold text-2xl text-text-primary flex items-center gap-3">
                    <span>{LEVEL_EMOJIS[activeLevel]}</span>
                    <span>{LEVEL_NAMES[activeLevel]}</span>
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {completedTasks} of {totalTasks} tasks completed
                  </p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="24" fill="none" stroke="#1e1e3a" strokeWidth="5" />
                    <motion.circle
                      cx="30" cy="30" r="24" fill="none"
                      stroke={color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - (activeProgress?.percent_complete || 0) / 100) }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono font-bold text-sm text-text-primary">
                      {Math.round(activeProgress?.percent_complete || 0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <div className="flex flex-col gap-3">
            {loadingTasks ? (
              [...Array(5)].map((_, i) => <SkeletonTaskCard key={i} delay={i * 0.05} />)
            ) : tasks.length === 0 ? (
              <EmptyTasks levelName={LEVEL_NAMES[activeLevel]} color={color} />
            ) : allDone ? (
              <AllTasksDone levelName={LEVEL_NAMES[activeLevel]} color={color} />
            ) : (
              <AnimatePresence>
                {tasks.map((task, i) => (
                  <TaskCard key={task.id} task={task} onComplete={handleComplete} delay={i * 0.04} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ── Feedback Floating Button ── */}
      <motion.button
        onClick={() => setFeedbackOpen(true)}
        whileHover={{ scale: 1.05, y: -3, boxShadow: '0 0 32px rgba(124,106,255,0.4)' }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 py-3 rounded-2xl font-display font-bold text-sm text-white"
        style={{
          background: 'linear-gradient(135deg, #7c6aff, #5a4be0)',
          boxShadow: '0 0 24px rgba(124,106,255,0.3)',
          border: '1px solid rgba(124,106,255,0.4)',
        }}
      >
        <MessageSquareHeart size={18} />
        Give Feedback
      </motion.button>

      {/* Feedback Modal */}
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}