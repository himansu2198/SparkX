import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { Zap, Mail, Lock, User, Building2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

// ── Border beam via CSS animation (no npm needed) ─────────────────────────────
const BEAM_STYLE = `
@keyframes beam-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.beam-wrapper {
  position: relative;
  border-radius: 24px;
  padding: 1.5px;
  overflow: hidden;
  background: transparent;
}
.beam-wrapper::before {
  content: '';
  position: absolute;
  inset: -120%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 200deg,
    rgba(124,106,255,0.9) 220deg,
    rgba(45,255,192,0.8) 240deg,
    rgba(124,106,255,0.9) 260deg,
    transparent 280deg,
    transparent 360deg
  );
  animation: beam-spin 3.5s linear infinite;
  border-radius: 0;
}
.beam-inner {
  position: relative;
  z-index: 1;
  border-radius: 22px;
  overflow: hidden;
}
`;

function InputField({ icon: Icon, type = 'text', placeholder, value, onChange, rightEl, autoComplete = 'off' }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <Icon
        size={15}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
        style={{ color: focused ? '#7c6aff' : '#666688' }}
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        name={`field-${placeholder}-${Math.random()}`}
        className="w-full rounded-xl px-4 py-3.5 pl-11 text-sm text-text-primary placeholder-text-muted outline-none transition-all"
        style={{
          background: focused ? 'rgba(124,106,255,0.06)' : 'rgba(13,13,26,0.7)',
          border: focused
            ? '1px solid rgba(124,106,255,0.5)'
            : '1px solid rgba(30,30,58,0.9)',
          boxShadow: focused ? '0 0 0 3px rgba(124,106,255,0.08)' : 'none',
        }}
      />
      {rightEl && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightEl}</div>}
    </div>
  );
}

// ── Default empty form state ──────────────────────────────────────────────────
const EMPTY_FORM = { name: '', email: '', password: '', college_name: '' };

export default function AuthPage() {
  const navigate          = useNavigate();
  const { login, signup, user } = useAuth();
  const [isLogin, setIsLogin]       = useState(true);
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState('');
  const [success, setSuccess]       = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [form, setForm]             = useState({ ...EMPTY_FORM });

  // ── If user is already logged in, redirect to dashboard ─────────────────
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // ── Reset form completely when switching tabs ────────────────────────────
  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setError('');
    setSuccess('');
    setShowPass(false);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isLogin) {
        // Login → go to dashboard
        await login(form.email, form.password);
        navigate('/dashboard');
      } else {
        // Signup → show success → switch to login tab
        await signup(form.name, form.email, form.password, form.college_name);
        setSuccess('Account created successfully! Please login.');
        resetForm();
        setIsLogin(true);
      }
    } catch (err) {
      setError(
        err.userMessage ||
        (Array.isArray(err?.response?.data?.detail)
          ? err.response.data.detail.map(e => e.msg).join(', ')
          : err?.response?.data?.detail) ||
        'Something went wrong. Try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <>
      <style>{BEAM_STYLE}</style>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20 pb-12">

        {/* Ambient glow blobs */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,106,255,0.07) 0%, transparent 65%)' }}
          />
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(45,255,192,0.04) 0%, transparent 70%)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* ── Logo ── */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(124,106,255,0.2), rgba(45,255,192,0.1))',
                border: '1px solid rgba(124,106,255,0.3)',
                boxShadow: '0 0 32px rgba(124,106,255,0.25)',
              }}
            >
              <Zap size={28} fill="#7c6aff" style={{ color: '#7c6aff' }} />
            </motion.div>
            <h1 className="font-display font-bold text-3xl gradient-text mb-1">SparkX</h1>
            <p className="text-text-secondary text-sm">Your gamified learning journey</p>
          </div>

          {/* ── Border beam card ── */}
          <div className="beam-wrapper">
            <div className="beam-inner">
              <div style={{
                background: 'rgba(8,8,20,0.92)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                padding: '2rem',
              }}>

                {/* Tab toggle */}
                <div className="flex mb-7 rounded-xl p-1 border"
                  style={{ background: 'rgba(13,13,26,0.8)', borderColor: 'rgba(30,30,58,0.9)' }}>
                  {['Login', 'Sign Up'].map((tab, i) => (
                    <motion.button
                      key={tab}
                      onClick={() => { if ((i === 0) !== isLogin) toggleMode(); }}
                      layout
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all relative"
                      style={(i === 0) === isLogin ? {
                        background: 'linear-gradient(135deg, rgba(124,106,255,0.9), rgba(100,85,220,0.9))',
                        color: '#fff',
                        boxShadow: '0 0 20px rgba(124,106,255,0.35)',
                      } : {
                        color: '#8888aa',
                      }}
                    >
                      {tab}
                    </motion.button>
                  ))}
                </div>

                {/* Success message */}
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{   opacity: 0, height: 0, marginBottom: 0 }}
                      className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm overflow-hidden"
                      style={{
                        background: 'rgba(45,255,192,0.08)',
                        border: '1px solid rgba(45,255,192,0.3)',
                        color: '#2dffc0',
                      }}
                    >
                      <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{   opacity: 0, height: 0, marginBottom: 0 }}
                      className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm overflow-hidden"
                      style={{
                        background: 'rgba(255,107,53,0.08)',
                        border: '1px solid rgba(255,107,53,0.3)',
                        color: '#ff6b35',
                      }}
                    >
                      <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} autoComplete="off" className="flex flex-col gap-3.5">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        key="signup-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{   opacity: 0, height: 0 }}
                        className="flex flex-col gap-3.5 overflow-hidden"
                      >
                        <InputField icon={User} placeholder="Full name"
                          value={form.name} onChange={set('name')} autoComplete="new-name" />
                        <InputField icon={Building2} placeholder="College name (optional)"
                          value={form.college_name} onChange={set('college_name')} autoComplete="new-college" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <InputField icon={Mail} type="email" placeholder="Email address"
                    value={form.email} onChange={set('email')} autoComplete="new-email" />

                  <InputField
                    icon={Lock}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="new-password"
                    rightEl={
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="text-text-muted hover:text-text-secondary transition-colors">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />

                  {/* ── Forgot password link — only shows on Login tab ── */}
                  <AnimatePresence>
                    {isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex justify-end overflow-hidden"
                        style={{ marginTop: -4 }}
                      >
                        <Link
                          to="/forgot-password"
                          className="text-xs transition-all"
                          style={{ color: '#7c6aff' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#2dffc0'}
                          onMouseLeave={e => e.currentTarget.style.color = '#7c6aff'}
                        >
                          Forgot password?
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { y: -2, boxShadow: '0 0 32px rgba(124,106,255,0.45)' } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="relative mt-1 text-white font-display font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 overflow-hidden transition-all"
                    style={{
                      background: loading
                        ? 'rgba(124,106,255,0.4)'
                        : 'linear-gradient(135deg, #7c6aff, #5a4be0)',
                      boxShadow: loading ? 'none' : '0 0 24px rgba(124,106,255,0.3)',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {!loading && (
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                          width: '60%',
                        }}
                      />
                    )}
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                          className="w-4 h-4 border-2 rounded-full inline-block"
                          style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                        />
                        {isLogin ? 'Logging in...' : 'Creating account...'}
                      </>
                    ) : (
                      isLogin ? 'Login →' : 'Create Account →'
                    )}
                  </motion.button>
                </form>

                {/* Toggle link */}
                <div className="text-center mt-5 pt-4"
                  style={{ borderTop: '1px solid rgba(30,30,58,0.6)' }}>
                  <span className="text-xs text-text-muted">
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  </span>
                  <button
                    onClick={toggleMode}
                    className="text-xs font-semibold transition-all"
                    style={{ color: '#a89bff' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#2dffc0'}
                    onMouseLeave={e => e.currentTarget.style.color = '#a89bff'}
                  >
                    {isLogin ? 'Sign up free →' : 'Login →'}
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom trust badge */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center mt-6 flex items-center justify-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2dffc0', boxShadow: '0 0 6px #2dffc0' }} />
            <span className="text-xs text-text-muted font-mono">Free forever · No credit card</span>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}