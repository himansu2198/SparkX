import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import api from '../api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.userMessage || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(124,106,255,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Zap size={30} className="text-accent mx-auto mb-3" fill="#7c6aff" />
          <h1 className="font-display font-bold text-3xl gradient-text">LevelUp</h1>
        </div>

        <div className="glass p-8 rounded-2xl">
          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 rounded-full bg-jade/15 border border-jade/30 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 size={30} className="text-jade" />
                </motion.div>
                <h2 className="font-display font-bold text-xl text-text-primary mb-3">Check your inbox!</h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  If <span className="text-text-primary font-medium">{email}</span> is registered,
                  you'll receive a reset link within a minute.
                  <br/><br/>
                  The link expires in <span className="text-accent">30 minutes</span>.
                </p>
                <p className="text-xs text-text-muted">
                  Check spam folder if you don't see it.
                </p>
                <Link to="/login">
                  <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                    className="mt-6 btn-glow text-white font-semibold px-8 py-3 rounded-xl text-sm">
                    Back to Login
                  </motion.button>
                </Link>
              </motion.div>
            ) : (
              /* ── Form state ── */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-6">
                  <h2 className="font-display font-bold text-2xl text-text-primary mb-1">
                    Forgot Password?
                  </h2>
                  <p className="text-text-secondary text-sm">
                    Enter your email and we'll send a reset link.
                  </p>
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
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="email" required placeholder="your@email.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-surface border border-border hover:border-accent/30 focus:border-accent/60 rounded-xl px-4 py-3 pl-11 text-sm text-text-primary placeholder-text-muted outline-none transition-all"
                    />
                  </div>

                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={!loading ? { y: -1 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
                    className="btn-glow text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        Sending...</>
                    ) : 'Send Reset Link →'}
                  </motion.button>
                </form>

                <div className="text-center mt-5">
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors">
                    <ArrowLeft size={13} /> Back to Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}