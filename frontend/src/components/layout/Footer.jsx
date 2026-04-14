import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Zap, ExternalLink } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Dashboard',   to: '/dashboard'   },
  { label: 'Roadmap',     to: '/roadmap'     },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Mentors',     to: '/mentors'     },
];

// lucide-react doesn't export Github/Linkedin — using inline SVG instead
const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const SOCIAL_LINKS = [
  { icon: GithubIcon,   href: 'https://github.com/',   label: 'GitHub'   },
  { icon: LinkedinIcon, href: 'https://linkedin.com/', label: 'LinkedIn' },
];

export default function Footer() {
  const { pathname } = useLocation();

  const hidden = ['/', '/login', '/signup'].includes(pathname);
  if (hidden) return null;

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative z-10 mt-auto"
    >
      {/* Top glow line */}
      <div className="h-px w-full" style={{
        background: 'linear-gradient(90deg, transparent, rgba(124,106,255,0.4), rgba(45,255,192,0.3), transparent)',
      }} />

      <div className="px-6 md:px-10 py-10" style={{
        background: 'rgba(8,8,20,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(30,30,58,0.8)',
      }}>
        <div className="max-w-5xl mx-auto">

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand column */}
            <div className="flex flex-col gap-4">
              <Link to="/dashboard" className="flex items-center gap-2.5 w-fit">
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #7c6aff, #2dffc0)',
                    boxShadow: '0 0 20px rgba(124,106,255,0.35)',
                  }}
                >
                  <Zap size={18} fill="white" className="text-white" />
                </motion.div>
                <span className="font-display font-bold text-lg gradient-text">SparkX</span>
              </Link>

              <p className="text-sm text-text-secondary leading-relaxed max-w-[220px]">
                Gamified Learning Platform — Turn your coding grind into XP. Level up. Get hired.
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-3 mt-1">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <motion.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center border border-border text-text-muted transition-all"
                    style={{ background: 'rgba(13,13,26,0.8)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(124,106,255,0.5)';
                      e.currentTarget.style.color = '#a89bff';
                      e.currentTarget.style.boxShadow = '0 0 16px rgba(124,106,255,0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.color = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <Icon />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Navigation column */}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-text-muted mb-5">Navigate</p>
              <ul className="flex flex-col gap-3">
                {NAV_LINKS.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="flex items-center gap-2 text-sm text-text-secondary w-fit transition-colors"
                      onMouseEnter={e => e.currentTarget.style.color = '#a89bff'}
                      onMouseLeave={e => e.currentTarget.style.color = ''}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(124,106,255,0.4)' }} />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Built with column */}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-text-muted mb-5">Built With</p>
              <ul className="flex flex-col gap-3">
                {[
                  { label: 'FastAPI + Python', href: 'https://fastapi.tiangolo.com'  },
                  { label: 'React + Vite',     href: 'https://vitejs.dev'            },
                  { label: 'Tailwind CSS',     href: 'https://tailwindcss.com'       },
                  { label: 'Framer Motion',    href: 'https://www.framer.com/motion' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-text-secondary w-fit group transition-colors"
                      onMouseEnter={e => e.currentTarget.style.color = '#2dffc0'}
                      onMouseLeave={e => e.currentTarget.style.color = ''}
                    >
                      {label}
                      <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(30,30,58,0.8)' }}>
            <p className="text-xs text-text-muted font-mono">
              © {new Date().getFullYear()} SparkX · Gamified Learning Tracker
            </p>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full"
                style={{ background: '#2dffc0', boxShadow: '0 0 6px #2dffc0' }} />
              <span className="text-xs font-mono text-text-muted">All systems operational</span>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.footer>
  );
}