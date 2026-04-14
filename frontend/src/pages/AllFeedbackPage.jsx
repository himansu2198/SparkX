import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function FeedbackCard({ feedback, index }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = feedback.message.length > 200;
  const display = expanded ? feedback.message : feedback.message.slice(0, 200);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className="glass p-6 transition-all"
      style={{ borderRadius: 18 }}
    >
      {/* Stars */}
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
        "{display}{isLong && !expanded ? '...' : ''}"
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs mt-2 font-semibold transition-colors"
          style={{ color: '#7c6aff' }}
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* User */}
      <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: '1px solid rgba(30,30,58,0.6)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c6aff, #2dffc0)' }}
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

export default function AllFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/feedback/all?limit=50`
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
    fetchAll();
  }, []);

  return (
    <div className="relative z-10 min-h-screen pt-28 pb-20 px-6 md:px-10 max-w-5xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-text-secondary transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <MessageSquare size={28} style={{ color: '#f5c842' }} />
          </motion.div>
          <h1 className="font-display font-bold text-4xl gradient-text-gold">
            All Feedback
          </h1>
        </div>
        <p className="text-text-secondary">What students are saying about SparkX.</p>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => (
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
            </div>
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 text-text-muted"
        >
          <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-lg mb-1">No feedback yet</p>
          <p className="text-sm">Be the first to share your experience!</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {feedbacks.map((fb, i) => (
            <FeedbackCard key={fb.id} feedback={fb} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}