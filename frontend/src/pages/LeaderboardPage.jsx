import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { leaderboardAPI } from '../api';
import { Trophy, Zap, Flame, Users, Star, Crown, Building2, Layers } from 'lucide-react';

const LEVEL_NAMES = {
  1: 'Basics', 2: 'DSA', 3: 'Projects',
  4: 'Resume', 5: 'Interview Prep', 6: 'Job Apply'
};

const RANK_META = {
  1: {
    bg: 'linear-gradient(135deg, rgba(245,200,66,0.18), rgba(245,200,66,0.06))',
    border: 'rgba(245,200,66,0.6)',
    text: '#f5c842',
    icon: '🥇',
    glow: '0 0 32px rgba(245,200,66,0.25), 0 0 64px rgba(245,200,66,0.08)',
    avatarBg: 'linear-gradient(135deg, #f5c842, #e6a817)',
    label: 'GOLD',
    labelColor: 'rgba(245,200,66,0.15)',
    labelBorder: 'rgba(245,200,66,0.4)',
    labelText: '#f5c842',
  },
  2: {
    bg: 'linear-gradient(135deg, rgba(200,200,220,0.12), rgba(200,200,220,0.04))',
    border: 'rgba(200,200,220,0.45)',
    text: '#d0d0e8',
    icon: '🥈',
    glow: '0 0 24px rgba(200,200,220,0.15)',
    avatarBg: 'linear-gradient(135deg, #c8c8dc, #9898b8)',
    label: 'SILVER',
    labelColor: 'rgba(200,200,220,0.12)',
    labelBorder: 'rgba(200,200,220,0.35)',
    labelText: '#c8c8dc',
  },
  3: {
    bg: 'linear-gradient(135deg, rgba(205,127,50,0.15), rgba(205,127,50,0.05))',
    border: 'rgba(205,127,50,0.5)',
    text: '#cd7f32',
    icon: '🥉',
    glow: '0 0 28px rgba(205,127,50,0.2)',
    avatarBg: 'linear-gradient(135deg, #cd7f32, #a0522d)',
    label: 'BRONZE',
    labelColor: 'rgba(205,127,50,0.12)',
    labelBorder: 'rgba(205,127,50,0.35)',
    labelText: '#cd7f32',
  },
};

const TABS = [
  { key: 'global',  label: 'Global',     icon: Trophy,    desc: 'All players worldwide' },
  { key: 'college', label: 'College',     icon: Building2, desc: 'Your college peers' },
  { key: 'level',   label: 'Same Level',  icon: Layers,    desc: 'Players at your level' },
];

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-border"
      style={{ background: 'rgba(13,13,26,0.6)' }}
    >
      <div className="w-10 h-6 rounded-lg bg-white/5 shimmer flex-shrink-0" />
      <div className="w-10 h-10 rounded-xl bg-white/5 shimmer flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-3.5 w-32 rounded-lg bg-white/5 shimmer" />
        <div className="h-2.5 w-24 rounded-lg bg-white/5 shimmer" />
      </div>
      <div className="hidden sm:block h-7 w-24 rounded-lg bg-white/5 shimmer" />
      <div className="h-5 w-14 rounded-lg bg-white/5 shimmer" />
    </motion.div>
  );
}

// ── Top-3 Podium Card ─────────────────────────────────────────────────────────
function PodiumCard({ entry, currentUserId }) {
  const meta = RANK_META[entry.rank];
  const isMe = entry.id === currentUserId;
  const heights = { 1: 'h-24', 2: 'h-16', 3: 'h-12' };
  const orders  = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: entry.rank * 0.1, type: 'spring', stiffness: 200 }}
      className={`flex flex-col items-center gap-2 flex-1 ${orders[entry.rank]}`}
    >
      <motion.span
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 + entry.rank * 0.3, ease: 'easeInOut' }}
        className="text-3xl"
      >
        {meta.icon}
      </motion.span>

      <motion.div
        whileHover={{ scale: 1.08, rotate: entry.rank === 1 ? [0, -5, 5, 0] : 0 }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-xl text-white flex-shrink-0 relative"
        style={{
          background: meta.avatarBg,
          boxShadow: meta.glow,
          border: `2px solid ${meta.border}`,
        }}
      >
        {entry.name?.[0]?.toUpperCase()}
        {isMe && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent border-2 border-surface flex items-center justify-center text-[9px] font-bold text-white">
            ★
          </span>
        )}
      </motion.div>

      <p className="text-xs font-semibold text-center truncate max-w-[80px]"
        style={{ color: meta.text }}>
        {entry.name?.split(' ')[0]}
      </p>

      <div className="flex items-center gap-1">
        <Zap size={11} style={{ color: meta.text }} fill={meta.text} />
        <span className="font-mono text-xs font-bold" style={{ color: meta.text }}>
          {entry.xp.toLocaleString()}
        </span>
      </div>

      <div
        className={`w-full ${heights[entry.rank]} rounded-t-xl flex items-center justify-center`}
        style={{
          background: meta.bg,
          border: `1px solid ${meta.border}`,
          borderBottom: 'none',
          boxShadow: meta.glow,
        }}
      >
        <span className="font-display font-black text-2xl" style={{ color: meta.text }}>
          #{entry.rank}
        </span>
      </div>
    </motion.div>
  );
}

// ── Leaderboard Row ───────────────────────────────────────────────────────────
function LeaderboardRow({ entry, currentUserId, index }) {
  const isMe     = entry.id === currentUserId;
  const topStyle = RANK_META[entry.rank];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 260, damping: 24 }}
      whileHover={{
        x: 6,
        scale: 1.008,
        transition: { duration: 0.15 }
      }}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-colors cursor-default relative overflow-hidden"
      style={
        isMe ? {
          background: 'rgba(124,106,255,0.1)',
          borderColor: 'rgba(124,106,255,0.6)',
          boxShadow: '0 0 0 1px rgba(124,106,255,0.2), 0 0 32px rgba(124,106,255,0.12)',
        } : topStyle ? {
          background: topStyle.bg,
          borderColor: topStyle.border,
          boxShadow: topStyle.glow,
        } : {
          background: 'rgba(13,13,26,0.6)',
          borderColor: 'rgba(30,30,58,1)',
        }
      }
    >
      {topStyle && (
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
          style={{ background: topStyle.text }}
        />
      )}

      {/* Rank */}
      <div className="w-10 text-center flex-shrink-0">
        {topStyle ? (
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 3 + entry.rank * 0.5, ease: 'easeInOut' }}
            className="text-2xl leading-none"
          >
            {topStyle.icon}
          </motion.span>
        ) : (
          <span className="font-mono text-sm font-bold text-text-muted">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <motion.div
        whileHover={{ scale: 1.12, rotate: 5 }}
        className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
        style={
          isMe ? {
            background: 'linear-gradient(135deg, #7c6aff, #2dffc0)',
            boxShadow: '0 0 16px rgba(124,106,255,0.45)',
            color: '#fff',
          } : topStyle ? {
            background: topStyle.avatarBg,
            color: '#fff',
            boxShadow: `0 0 12px ${topStyle.border}`,
          } : {
            background: '#1a1a32',
            border: '1px solid #1e1e3a',
            color: '#8888aa',
          }
        }
      >
        {entry.name?.[0]?.toUpperCase()}
      </motion.div>

      {/* Name + college */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${isMe ? 'text-accent-soft' : 'text-text-primary'}`}>
            {entry.name}
          </span>

          {isMe && (
            <span className="text-[10px] bg-accent/20 border border-accent/40 text-accent-soft px-2 py-0.5 rounded-full font-mono tracking-wide">
              YOU
            </span>
          )}

          {topStyle && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-widest"
              style={{
                background: topStyle.labelColor,
                border: `1px solid ${topStyle.labelBorder}`,
                color: topStyle.labelText,
              }}
            >
              {topStyle.label}
            </span>
          )}

          {entry.rank === 1 && (
            <Crown size={12} fill="#f5c842" style={{ color: '#f5c842' }} />
          )}
        </div>
        {entry.college_name && (
          <p className="text-xs text-text-muted truncate mt-0.5">{entry.college_name}</p>
        )}
      </div>

      {/* Level */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-secondary bg-surface/80 border border-border rounded-lg px-3 py-1.5 flex-shrink-0">
        <Star size={10} className="text-accent" />
        <span>{LEVEL_NAMES[entry.level] || `Lvl ${entry.level}`}</span>
      </div>

      {/* Streak */}
      <div
        className="hidden md:flex items-center gap-1.5 text-xs flex-shrink-0"
        style={{ color: entry.streak >= 7 ? '#f5c842' : entry.streak >= 3 ? '#ff6b35' : '#8888aa' }}
      >
        <Flame size={13} fill="currentColor" />
        <span className="font-mono font-semibold">{entry.streak}</span>
      </div>

      {/* XP */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Zap size={14} fill="#f5c842" style={{ color: '#f5c842' }} />
        <span
          className="font-mono font-bold text-sm"
          style={{ color: topStyle ? topStyle.text : isMe ? '#a89bff' : '#f5c842' }}
        >
          {entry.xp.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { user }              = useAuth();
  const [tab, setTab]         = useState('global');
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    leaderboardAPI.getGlobal(50)  // we'll override the URL below
      .then(() => {})              // dummy — we use custom fetch below
      .catch(() => {});

    // Use the unified endpoint with type param
    const token = localStorage.getItem('token');
    fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/leaderboard/?type=${tab}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
      .then(res => res.json())
      .then(json => setData(Array.isArray(json) ? json : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const myRank  = data.find(e => e.id === user?.id);
  const top3    = data.filter(e => e.rank <= 3);
  const rest    = data.filter(e => e.rank > 3);
  const activeTab = TABS.find(t => t.key === tab);

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-6 md:px-10 max-w-3xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <Trophy size={28} style={{ color: '#f5c842' }} />
          </motion.div>
          <h1 className="font-display font-bold text-4xl gradient-text-gold">Leaderboard</h1>
        </div>
        <p className="text-text-secondary">See who's winning the grind.</p>
      </motion.div>

      {/* My rank card */}
      <AnimatePresence>
        {myRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="glass p-5 mb-6 border border-accent/30 flex items-center gap-5"
            style={{
              borderRadius: 18,
              boxShadow: '0 0 40px rgba(124,106,255,0.1)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-jade flex items-center justify-center font-bold text-lg text-white"
              style={{ boxShadow: '0 0 20px rgba(124,106,255,0.35)' }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary">{user?.name}</p>
              <p className="text-xs text-text-secondary">{user?.college_name || 'Your rank'}</p>
            </div>
            <div className="text-right">
              <motion.p
                key={`${tab}-${myRank.rank}`}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display font-bold text-3xl gradient-text"
              >
                #{myRank.rank}
              </motion.p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <Zap size={12} fill="#f5c842" style={{ color: '#f5c842' }} />
                <span className="font-mono text-sm" style={{ color: '#f5c842' }}>
                  {myRank.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3 Filter Tabs ── */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all"
            style={tab === key ? {
              background: 'rgba(124,106,255,0.18)',
              borderColor: 'rgba(124,106,255,0.5)',
              color: '#a89bff',
              boxShadow: '0 0 20px rgba(124,106,255,0.1)',
            } : {
              background: 'rgba(13,13,26,0.6)',
              borderColor: '#1e1e3a',
              color: '#8888aa',
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={tab}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs font-mono text-text-muted mb-6 tracking-wide"
        >
          {activeTab?.desc}
          {tab === 'college' && !user?.college_name && (
            <span className="text-amber-400 ml-2">
              ⚠ You haven't set a college. Update your profile to see college rankings.
            </span>
          )}
        </motion.p>
      </AnimatePresence>

      {/* ── Top 3 Podium ── */}
      {!loading && top3.length === 3 && (
        <motion.div
          key={`podium-${tab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end gap-3 mb-8 px-4"
        >
          {top3.map(entry => (
            <PodiumCard key={entry.id} entry={entry} currentUserId={user?.id} />
          ))}
        </motion.div>
      )}

      {/* Column headers */}
      {!loading && rest.length > 0 && (
        <div className="flex items-center gap-4 px-5 mb-3 text-xs font-mono text-text-muted uppercase tracking-wider">
          <div className="w-10">Rank</div>
          <div className="w-10" />
          <div className="flex-1">Player</div>
          <div className="hidden sm:block w-28">Level</div>
          <div className="hidden md:block w-16">Streak</div>
          <div className="w-16 text-right">XP</div>
        </div>
      )}

      {/* ── List ── */}
      <div className="flex flex-col gap-2">
        {loading ? (
          [...Array(8)].map((_, i) => <SkeletonRow key={i} index={i} />)
        ) : data.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 text-text-muted"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <Trophy size={52} className="mx-auto mb-4 opacity-20" />
            </motion.div>
            <p className="font-semibold text-lg mb-1">
              {tab === 'college' && !user?.college_name
                ? 'No college set'
                : 'No players yet'}
            </p>
            <p className="text-sm">
              {tab === 'college' && !user?.college_name
                ? 'Update your profile with your college name to see rankings.'
                : 'Complete tasks to appear here!'}
            </p>
          </motion.div>
        ) : (
          <>
            <AnimatePresence>
              {rest.map((entry, i) => (
                <LeaderboardRow
                  key={entry.id}
                  entry={entry}
                  currentUserId={user?.id}
                  index={i}
                />
              ))}
            </AnimatePresence>

            {top3.length < 3 && top3.map((entry, i) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                currentUserId={user?.id}
                index={i}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}