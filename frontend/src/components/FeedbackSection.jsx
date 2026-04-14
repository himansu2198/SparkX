import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, MessageSquare } from 'lucide-react';

function FeedbackCard({ feedback, index }) {
  const truncated = feedback.message.length > 150
    ? feedback.message.slice(0, 150) + '...'
    : feedback.message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, boxShadow: '0 16px 48px rgba(124,106,255,0.1)' }}
      className="glass p-6 flex flex-col justify-between transition-all"
      style={{ borderRadius: 18, minHeight: 200 }}
    >
      {/* Stars */}
      <div>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              fill={star <= feedback.rating ? '#f5c842' : 'transparent'}
              style={{
                color: star <= feedback.rating ? '#f5c842' : '#44445a',
                filter: star <= feedback.rating ? 'drop-shadow(0 0 4px rgba(245,200,66,0.3))' : 'none',
              }}
            />
          ))}
        </div>

        {/* Message */}
        <p className="text-sm text-text-secondary leading-relaxed">
          "{truncated}"
        </p>
      </div>

      {/* User */}
      <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid rgba(30,30,58,0.6)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #7c6aff, #2dffc0)',
          }}
        >
          {feedback.user_name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{feedback.user_name}</p>
          {feedback.created_at && (
            <p className="text-xs text-text-muted">
              {new Date(feedback.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function FeedbackSection() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/feedback/?limit=6`
        );
        if (res.ok) {
          const data = await res.json();
          setFeedbacks(data);
        }
      } catch (err) {
        console.error('Failed to load feedback:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Don't render section if no feedback
  if (!loading && feedbacks.length === 0) return null;

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 border border-gold/20">
            <Star size={12} fill="#f5c842" style={{ color: '#f5c842' }} />
            <span className="text-xs font-mono text-text-secondary tracking-widest uppercase">
              Testimonials
            </span>
          </div>
          <h2 className="font-display font-bold text-4xl text-text-primary mb-4">
            What our users <span className="gradient-text-gold">say</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Real feedback from students using SparkX to level up their careers.
          </p>
        </motion.div>

        {/* Feedback Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="glass p-6 animate-pulse"
                style={{ borderRadius: 18, minHeight: 200 }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-3.5 h-3.5 rounded bg-white/5" />
                  ))}
                </div>
                <div className="h-3 w-full bg-white/5 rounded mb-2" />
                <div className="h-3 w-4/5 bg-white/5 rounded mb-2" />
                <div className="h-3 w-3/5 bg-white/5 rounded" />
                <div className="flex items-center gap-3 mt-8">
                  <div className="w-8 h-8 rounded-lg bg-white/5" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedbacks.map((fb, i) => (
              <FeedbackCard key={fb.id} feedback={fb} index={i} />
            ))}
          </div>
        )}

        {/* View All Button */}
        {feedbacks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link to="/feedback">
              <motion.button
                whileHover={{
                  y: -3,
                  borderColor: 'rgba(124,106,255,0.6)',
                  boxShadow: '0 0 24px rgba(124,106,255,0.2)',
                }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 glass px-7 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  border: '1.5px solid rgba(124,106,255,0.35)',
                  color: '#a89bff',
                }}
              >
                <MessageSquare size={16} />
                View All Feedback
                <ArrowRight size={14} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}