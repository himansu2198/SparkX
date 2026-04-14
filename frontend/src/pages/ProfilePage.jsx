import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../api/index.js';

function Field({ icon: Icon, label, type = 'text', value, onChange, disabled }) {
  return (
    <div>
      <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2 block">{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type={type} value={value} onChange={onChange} disabled={disabled}
          className="w-full bg-surface border border-border hover:border-accent/30 focus:border-accent/60 rounded-xl px-4 py-3.5 pl-11 text-sm text-text-primary placeholder-text-muted outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    college_name: user?.college_name || '',
  });
  const [loading, setSaving] = useState(false);
  const [saved,   setSaved]  = useState(false);
  const [error,   setError]  = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.put('/auth/profile', form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.userMessage || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-6 md:px-10 max-w-xl mx-auto">

      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-3xl gradient-text mb-2">Edit Profile</h1>
        <p className="text-text-secondary text-sm mb-8">Update your name and college information.</p>

        {/* Avatar */}
        <div className="flex items-center gap-5 glass p-6 rounded-2xl mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-jade flex items-center justify-center font-display font-bold text-3xl"
            style={{ boxShadow: '0 0 30px rgba(124,106,255,0.35)' }}>
            {form.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-display font-bold text-xl text-text-primary">{form.name || 'Your Name'}</p>
            <p className="text-sm text-text-secondary mt-0.5">{user?.email}</p>
            <p className="text-xs font-mono text-accent mt-1">Level {user?.level} · {user?.xp} XP</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="glass p-7 rounded-2xl flex flex-col gap-5">
          <Field icon={User} label="Full Name" value={form.name} onChange={set('name')} />
          <Field icon={Mail} label="Email" type="email" value={user?.email || ''} disabled />
          <Field icon={Building2} label="College Name" value={form.college_name} onChange={set('college_name')} />

          {error && (
            <p className="text-sm text-ember bg-ember/10 border border-ember/30 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <motion.button
            type="submit" disabled={loading}
            whileHover={!loading ? { y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
            className="btn-glow text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saved ? (
              <><CheckCircle2 size={16} /> Saved!</>
            ) : loading ? (
              <><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}