import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Zap, ArrowRight, Trophy, Map, Users, Star } from 'lucide-react';
import FeedbackSection from '../components/FeedbackSection';

const FEATURES = [
  { icon: Zap,    title: 'XP & Level System',  desc: 'Earn XP on every task. Level up from Basics to Job Ready.' },
  { icon: Map,    title: 'Guided Roadmap',      desc: 'Step-by-step learning path — always know what to do next.' },
  { icon: Trophy, title: 'Live Leaderboard',    desc: "Compete with peers at your college. See who's ahead." },
  { icon: Users,  title: 'Senior Mentors',      desc: "Learn from seniors who've already landed the job." },
];

const LEVELS = [
  { n: '01', name: 'Basics',         color: '#7c6aff', glow: 'rgba(124,106,255,0.25)' },
  { n: '02', name: 'DSA',            color: '#2dffc0', glow: 'rgba(45,255,192,0.2)'   },
  { n: '03', name: 'Projects',       color: '#f5c842', glow: 'rgba(245,200,66,0.2)'   },
  { n: '04', name: 'Resume',         color: '#ff6b35', glow: 'rgba(255,107,53,0.2)'   },
  { n: '05', name: 'Interview Prep', color: '#a89bff', glow: 'rgba(168,155,255,0.2)'  },
  { n: '06', name: 'Job Apply',      color: '#2dffc0', glow: 'rgba(45,255,192,0.2)'   },
];

export default function LandingPage() {
  const heroRef     = useRef(null);
  const titleRef    = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef      = useRef(null);
  const badgeRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(badgeRef.current,
          { opacity: 0, y: -20, scale: 0.8 },
          { opacity: 1, y: 0,   scale: 1,   duration: 0.7 })
        .fromTo(titleRef.current.children,
          { opacity: 0, y: 60, skewY: 3 },
          { opacity: 1, y: 0,  skewY: 0, duration: 0.9, stagger: 0.12 }, '-=0.3')
        .fromTo(subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0,  duration: 0.7 }, '-=0.4')
        .fromTo(ctaRef.current.children,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0,  scale: 1,   duration: 0.6, stagger: 0.1 }, '-=0.3');
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="relative z-10 min-h-screen">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,106,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(45,255,192,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative pt-36 pb-24 px-6 text-center max-w-5xl mx-auto">

        {/* Badge */}
        <div ref={badgeRef}
          className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 border border-accent/20">
          <Star size={12} className="text-gold" fill="#f5c842" />
          <span className="text-xs font-mono text-text-secondary tracking-widest uppercase">
            Your Learning Journey Starts Here
          </span>
        </div>

        {/* Title */}
        <div ref={titleRef} className="overflow-hidden">
          <div className="font-display font-bold text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-2">
            <span className="gradient-text">Level Up</span>
          </div>
          <div className="font-display font-bold text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight text-text-primary">
            Your Career
          </div>
        </div>

        {/* Subtitle */}
        <p ref={subtitleRef} className="mt-8 text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          From Python basics to your first job offer —{' '}
          <span className="text-text-primary">guided, gamified and ranked.</span>{' '}
          Earn XP, beat streaks and compete with your peers.
        </p>

        {/* ── CTA Buttons ── */}
        <div ref={ctaRef} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.04, y: -3, boxShadow: '0 0 40px rgba(124,106,255,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden text-white font-display font-bold px-9 py-4 rounded-xl text-base flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7c6aff, #5a4be0)',
                boxShadow: '0 0 24px rgba(124,106,255,0.35)',
              }}
            >
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.5 }}
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', width: '60%' }}
              />
              Start for Free <ArrowRight size={18} />
            </motion.button>
          </Link>

          <Link to="/login">
            <motion.button
              whileHover={{
                y: -3,
                borderColor: 'rgba(124,106,255,0.6)',
                boxShadow: '0 0 24px rgba(124,106,255,0.2)',
                color: '#a89bff',
              }}
              whileTap={{ scale: 0.97 }}
              className="glass px-9 py-4 rounded-xl text-base font-semibold transition-all"
              style={{
                border: '1.5px solid rgba(124,106,255,0.35)',
                color: '#c8c4f0',
                boxShadow: '0 0 0px transparent',
              }}
            >
              Already have an account →
            </motion.button>
          </Link>
        </div>

        {/* ── XP Pill ── */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="mt-16 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full relative"
          style={{
            background: 'rgba(245,200,66,0.08)',
            border: '1px solid rgba(245,200,66,0.35)',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ border: '1px solid rgba(245,200,66,0.4)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <Zap size={15} fill="#f5c842" style={{ color: '#f5c842', filter: 'drop-shadow(0 0 6px #f5c842)' }} />
          </motion.div>
          <span className="text-sm font-mono font-semibold" style={{ color: '#f5c842' }}>
            +1600 XP to land a job
          </span>
        </motion.div>
      </section>

      {/* ── LEVEL ROADMAP STRIP ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="text-center text-xs font-mono text-text-muted tracking-widest uppercase mb-10"
          >
            Your path — 6 levels — one destination
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {LEVELS.map((lvl, i) => (
              <motion.div
                key={lvl.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -6,
                  scale: 1.04,
                  boxShadow: `0 0 28px ${lvl.glow}`,
                  borderColor: `${lvl.color}60`,
                }}
                className="glass p-5 text-center cursor-default transition-all"
                style={{ borderRadius: 14 }}
              >
                <motion.div
                  className="font-mono text-xs font-bold mb-2"
                  style={{ color: lvl.color }}
                  whileHover={{ scale: 1.1 }}
                >
                  {lvl.n}
                </motion.div>

                <motion.div
                  className="w-1.5 h-1.5 rounded-full mx-auto mb-2"
                  style={{ background: lvl.color, boxShadow: `0 0 6px ${lvl.color}` }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: 'easeInOut' }}
                />

                <div className="font-display text-sm font-semibold text-text-primary leading-tight">
                  {lvl.name}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            viewport={{ once: true }}
            className="hidden lg:block h-px mt-4 origin-left"
            style={{ background: 'linear-gradient(90deg, #7c6aff44, #2dffc044, #f5c84244, #ff6b3544, #a89bff44, #2dffc044)' }}
          />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-4xl text-center mb-4 text-text-primary"
          >
            Everything you need to <span className="gradient-text">get hired</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-text-secondary mb-14 max-w-xl mx-auto"
          >
            Built for students who are serious about landing their first tech job.
          </motion.p>
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: '0 16px 48px rgba(124,106,255,0.1)' }}
                className="glass p-6 group hover:border-accent/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/25 transition-all group-hover:border-accent/40"
                  style={{ boxShadow: '0 0 0 transparent', transition: 'all 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 16px rgba(124,106,255,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 transparent'}
                >
                  <Icon size={18} className="text-accent-soft" />
                </div>
                <h3 className="font-display font-semibold text-text-primary mb-2">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEEDBACK / TESTIMONIALS ── */}
      <FeedbackSection />

      {/* ── CTA FOOTER ── */}
      <section className="py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto glass p-12 rounded-3xl"
          style={{
            border: '1px solid rgba(124,106,255,0.25)',
            boxShadow: '0 0 80px rgba(124,106,255,0.08)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            className="text-4xl mb-4 inline-block"
          >
            🚀
          </motion.div>
          <h2 className="font-display font-bold text-3xl text-text-primary mb-3">
            Ready to start leveling up?
          </h2>
          <p className="text-text-secondary mb-8">Join students who are already on their journey.</p>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.04, y: -2, boxShadow: '0 0 40px rgba(124,106,255,0.45)' }}
              whileTap={{ scale: 0.97 }}
              className="relative overflow-hidden text-white font-display font-bold px-10 py-4 rounded-xl text-base"
              style={{
                background: 'linear-gradient(135deg, #7c6aff, #5a4be0)',
                boxShadow: '0 0 24px rgba(124,106,255,0.3)',
              }}
            >
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', repeatDelay: 1.5 }}
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', width: '60%' }}
              />
              Create Free Account →
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}