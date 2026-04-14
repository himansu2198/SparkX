import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import api from '../api';

export default function ResetPasswordPage() {
  const [params]  = useSearchParams();
  const navigate  = useNavigate();
  const token     = params.get('token') || '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (password !== confirm) {
      setError("Passwords don't match."); return;
    }
    if (!token) {
      setError('Invalid reset link. Please request a new one.'); return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.userMessage || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="glass p-10 rounded-2xl text-center max-w-sm">
          <AlertCircle size={36} className="text-ember mx-auto mb-4" />
          <h2 className="font-display font-bold text-xl text-text-primary mb-2">Invalid Link</h2>
          <p className="text-text-secondary text-sm mb-6">This reset link is missing or invalid.</p>
          <Link to="/forgot-password">
            <button className="btn-glow text-white px-6 py-2.5 rounded-xl text-sm font-medium">
              Request New Link
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(124,106,255,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Zap size={30} className="text-accent mx-auto mb-3" fill="#7c6aff" />
          <h1 className="font-display font-bold text-3xl gradient-text">LevelUp</h1>
        </div>

        <div className="glass p-8 rounded-2xl">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-jade/15 border border-jade/30 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 size={30} className="text-jade" />
                </motion.div>
                <h2 className="font-display font-bold text-xl text-text-primary mb-2">
                  Password Updated! 🎉
                </h2>
                <p className="text-text-secondary text-sm mb-1">
                  Redirecting to login in 3 seconds...
                </p>
                <Link to="/login">
                  <motion.button whileHover={{ y: -1 }}
                    className="mt-4 btn-glow text-white font-semibold px-8 py-3 rounded-xl text-sm">
                    Login Now →
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6">
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-1">
                    Set New Password
                  </h2>
                  <p className="text-text-secondary text-sm">Choose a strong password.</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 bg-ember/10 border border-ember/30 rounded-xl px-4 py-3 mb-4 text-sm text-ember"
                    >
                      <AlertCircle size={14} /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* New password */}
                  <div>
                    <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1.5 block">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        value={password} onChange={e => setPassword(e.target.value)}
                        required minLength={6}
                        className="w-full bg-surface border border-border hover:border-accent/30 focus:border-accent/60 rounded-xl px-4 py-3 pl-11 pr-11 text-sm text-text-primary placeholder-text-muted outline-none transition-all"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1.5 block">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Repeat password"
                        value={confirm} onChange={e => setConfirm(e.target.value)}
                        required
                        className={`w-full bg-surface border rounded-xl px-4 py-3 pl-11 text-sm text-text-primary placeholder-text-muted outline-none transition-all ${
                          confirm && password !== confirm
                            ? 'border-ember/60 focus:border-ember'
                            : 'border-border hover:border-accent/30 focus:border-accent/60'
                        }`}
                      />
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-xs text-ember mt-1 pl-1">Passwords don't match</p>
                    )}
                  </div>

                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={!loading ? { y: -1 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
                    className="btn-glow text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                  >
                    {loading ? (
                      <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Updating...</>
                    ) : 'Update Password →'}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}