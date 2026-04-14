import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../store/authStore';
import {
  LayoutDashboard, Map, Trophy, Users, LogOut,
  Menu, X, Zap, User, Settings, ChevronDown,
  Crown, Flame,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/roadmap',     label: 'Roadmap',     icon: Map             },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy          },
  { to: '/mentors',     label: 'Mentors',     icon: Users           },
];

const LEVEL_NAMES = {
  1: 'Basics', 2: 'DSA', 3: 'Projects',
  4: 'Resume', 5: 'Interview Prep', 6: 'Job Apply',
};

export default function Navbar() {
  const { user, logout }              = useAuth();
  const location                      = useLocation();
  const navigate                      = useNavigate();
  const [scrolled, setScrolled]       = useState(false);
  const [open, setOpen]               = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef                    = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setProfileOpen(false); setOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background:   scrolled ? 'rgba(3,3,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(28px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(124,106,255,0.12)' : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">

        {/* ── Logo ── */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
          <motion.div whileHover={{ rotate: 20, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Zap size={26} className="text-accent" fill="#7c6aff"
              style={{ filter: 'drop-shadow(0 0 8px #7c6aff88)' }} />
          </motion.div>
          <span className="font-display font-extrabold text-2xl tracking-tight gradient-text"
            style={{ textShadow: '0 0 30px rgba(124,106,255,0.4)' }}>
            SparkX
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        {user && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: active ? '#a89bff' : '#8888aa' }}
                  >
                    <Icon size={15} />
                    <span>{label}</span>
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl"
                        style={{
                          background: 'rgba(124,106,255,0.15)',
                          border: '1px solid rgba(124,106,255,0.35)',
                          boxShadow: '0 0 20px rgba(124,106,255,0.1)',
                        }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {!active && (
                      <motion.div
                        className="absolute bottom-0.5 left-3 right-3 h-px bg-accent/40 rounded-full"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── Right Side ── */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* XP Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="hidden md:flex items-center gap-2 glass px-4 py-2 rounded-full border border-gold/20"
                style={{ boxShadow: '0 0 12px rgba(245,200,66,0.1)' }}
              >
                <Zap size={13} className="text-gold" fill="#f5c842" />
                <span className="font-mono text-sm text-gold font-semibold">
                  {user.xp?.toLocaleString()} XP
                </span>
              </motion.div>

              {/* ── Profile Dropdown ── */}
              <div className="relative" ref={profileRef}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setProfileOpen(p => !p)}
                  className="flex items-center gap-2 glass px-2 py-1.5 rounded-xl border transition-all"
                  style={{
                    borderColor: profileOpen ? 'rgba(124,106,255,0.45)' : 'rgba(30,30,58,1)',
                    boxShadow: profileOpen ? '0 0 20px rgba(124,106,255,0.12)' : 'none',
                  }}
                >
                  {/* Avatar */}
                  <motion.div
                    animate={{ boxShadow: profileOpen ? '0 0 16px rgba(124,106,255,0.45)' : '0 0 8px rgba(124,106,255,0.2)' }}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-jade flex items-center justify-center font-display font-bold text-sm text-white"
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </motion.div>

                  <span className="hidden md:block text-sm text-text-secondary max-w-[80px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>

                  {/* Chevron rotates on open */}
                  <motion.div
                    animate={{ rotate: profileOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="hidden md:block"
                  >
                    <ChevronDown size={13} className="text-text-muted" />
                  </motion.div>
                </motion.button>

                {/* ── Dropdown Panel ── */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0,  scale: 1    }}
                      exit={{    opacity: 0, y: 10, scale: 0.94 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-3 w-64 glass border border-border rounded-2xl overflow-hidden"
                      style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,106,255,0.1)' }}
                    >

                      {/* ── User header ── */}
                      <div
                        className="px-4 pt-4 pb-3"
                        style={{ borderBottom: '1px solid rgba(30,30,58,0.8)' }}
                      >
                        {/* Avatar + name row */}
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-jade flex items-center justify-center font-display font-bold text-lg text-white flex-shrink-0"
                            style={{ boxShadow: '0 0 20px rgba(124,106,255,0.35)' }}
                          >
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-text-primary truncate">{user.name}</p>
                            <p className="text-xs text-text-muted truncate">{user.email}</p>
                            {user.college_name && (
                              <p className="text-xs text-accent-soft truncate mt-0.5">{user.college_name}</p>
                            )}
                          </div>
                        </div>

                        {/* XP + Level + Streak stats row */}
                        <div className="grid grid-cols-3 gap-2">
                          <div
                            className="flex flex-col items-center gap-0.5 rounded-xl py-2 px-1"
                            style={{ background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.15)' }}
                          >
                            <Zap size={12} fill="#f5c842" style={{ color: '#f5c842' }} />
                            <span className="font-mono text-xs font-bold" style={{ color: '#f5c842' }}>
                              {user.xp?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-text-muted">XP</span>
                          </div>
                          <div
                            className="flex flex-col items-center gap-0.5 rounded-xl py-2 px-1"
                            style={{ background: 'rgba(124,106,255,0.08)', border: '1px solid rgba(124,106,255,0.15)' }}
                          >
                            <Crown size={12} style={{ color: '#a89bff' }} />
                            <span className="font-mono text-xs font-bold text-accent-soft">
                              {user.level}
                            </span>
                            <span className="text-[10px] text-text-muted">Level</span>
                          </div>
                          <div
                            className="flex flex-col items-center gap-0.5 rounded-xl py-2 px-1"
                            style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.15)' }}
                          >
                            <Flame size={12} fill="#ff6b35" style={{ color: '#ff6b35' }} />
                            <span className="font-mono text-xs font-bold" style={{ color: '#ff6b35' }}>
                              {user.streak ?? 0}
                            </span>
                            <span className="text-[10px] text-text-muted">Streak</span>
                          </div>
                        </div>
                      </div>

                      {/* ── Menu items ── */}
                      <div className="p-1.5">

                        {/* View Profile */}
                        <Link to="/profile" onClick={() => setProfileOpen(false)}>
                          <motion.div
                            whileHover={{ x: 4, backgroundColor: 'rgba(124,106,255,0.08)' }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(124,106,255,0.12)', border: '1px solid rgba(124,106,255,0.2)' }}
                            >
                              <User size={13} style={{ color: '#a89bff' }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">View Profile</p>
                              <p className="text-[11px] text-text-muted">See your stats</p>
                            </div>
                          </motion.div>
                        </Link>

                        {/* Edit Profile */}
                        <Link to="/profile" onClick={() => setProfileOpen(false)}>
                          <motion.div
                            whileHover={{ x: 4, backgroundColor: 'rgba(45,255,192,0.05)' }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: 'rgba(45,255,192,0.08)', border: '1px solid rgba(45,255,192,0.15)' }}
                            >
                              <Settings size={13} style={{ color: '#2dffc0' }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">Edit Profile</p>
                              <p className="text-[11px] text-text-muted">Update name & college</p>
                            </div>
                          </motion.div>
                        </Link>

                        {/* Divider */}
                        <div className="my-1.5 mx-2 h-px" style={{ background: 'rgba(30,30,58,0.8)' }} />

                        {/* Logout */}
                        <motion.div
                          whileHover={{ x: 4, backgroundColor: 'rgba(255,107,53,0.08)' }}
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer"
                          style={{ color: '#ff6b35' }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.2)' }}
                          >
                            <LogOut size={13} style={{ color: '#ff6b35' }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Logout</p>
                            <p className="text-[11px]" style={{ color: 'rgba(255,107,53,0.6)' }}>See you soon!</p>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu toggle */}
              <button className="md:hidden text-text-secondary p-1" onClick={() => setOpen(!open)}>
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  className="text-text-secondary hover:text-text-primary text-sm transition-colors px-2 py-1">
                  Login
                </motion.button>
              </Link>
              <Link to="/signup">
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  className="btn-glow text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
                  Get Started
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {open && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border px-6 py-4 flex flex-col gap-1"
          >
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-accent/20 text-accent-soft border border-accent/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}>
                  <Icon size={16} /> {label}
                </div>
              </Link>
            ))}

            {/* Mobile profile info */}
            <div
              className="mx-1 my-1 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(124,106,255,0.06)', border: '1px solid rgba(124,106,255,0.15)' }}
            >
              <p className="text-xs text-text-muted mb-2 font-mono uppercase tracking-wider">Signed in as</p>
              <p className="text-sm font-semibold text-text-primary">{user.name}</p>
              <p className="text-xs text-text-muted">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-mono" style={{ color: '#f5c842' }}>
                  {user.xp?.toLocaleString()} XP
                </span>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs font-mono text-accent-soft">
                  Level {user.level}
                </span>
                <span className="text-xs text-text-muted">·</span>
                <span className="text-xs font-mono" style={{ color: '#ff6b35' }}>
                  🔥 {user.streak ?? 0}
                </span>
              </div>
            </div>

            <div className="border-t border-border mt-1 pt-1 flex flex-col gap-1">
              <Link to="/profile" onClick={() => setOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all">
                  <User size={16} /> View / Edit Profile
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-ember/10 transition-all"
                style={{ color: '#ff6b35' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}