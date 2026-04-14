import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose }) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [message, setMessage]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating'); return; }
    if (message.trim().length < 10) { setError('Message must be at least 10 characters'); return; }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/feedback/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: message.trim(), rating }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to submit feedback');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset after close animation
        setTimeout(() => {
          setRating(0);
          setMessage('');
          setSuccess(false);
          setError('');
        }, 300);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setRating(0);
      setMessage('');
      setSuccess(false);
      setError('');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(3,3,10,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md relative overflow-hidden"
            style={{
              background: 'rgba(8,8,20,0.95)',
              border: '1px solid rgba(30,30,58,0.9)',
              borderRadius: 24,
              boxShadow: '0 0 80px rgba(124,106,255,0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-7 pb-2">
              <div>
                <h2 className="font-display font-bold text-xl text-text-primary">
                  Share Your Feedback ✨
                </h2>
                <p className="text-xs text-text-muted mt-1">Help us make SparkX better</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-7 pb-7 pt-4">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 flex flex-col items-center text-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle size={48} style={{ color: '#2dffc0' }} />
                    </motion.div>
                    <h3 className="font-display font-bold text-lg text-text-primary mt-4">
                      Thank you! 🎉
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Your feedback means a lot to us.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                  >
                    {/* Star Rating */}
                    <div>
                      <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3 block">
                        Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(0)}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="transition-all"
                          >
                            <Star
                              size={28}
                              fill={(hovered || rating) >= star ? '#f5c842' : 'transparent'}
                              style={{
                                color: (hovered || rating) >= star ? '#f5c842' : '#44445a',
                                filter: (hovered || rating) >= star ? 'drop-shadow(0 0 6px rgba(245,200,66,0.4))' : 'none',
                                transition: 'all 0.15s ease',
                              }}
                            />
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3 block">
                        Your Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us about your experience with SparkX..."
                        rows={4}
                        autoComplete="off"
                        className="w-full rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder-text-muted outline-none resize-none transition-all"
                        style={{
                          background: 'rgba(13,13,26,0.7)',
                          border: '1px solid rgba(30,30,58,0.9)',
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'rgba(124,106,255,0.06)';
                          e.target.style.borderColor = 'rgba(124,106,255,0.5)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(124,106,255,0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'rgba(13,13,26,0.7)';
                          e.target.style.borderColor = 'rgba(30,30,58,0.9)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                      <p className="text-xs text-text-muted mt-1.5 text-right">
                        {message.length}/1000
                      </p>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm overflow-hidden"
                          style={{
                            background: 'rgba(255,107,53,0.08)',
                            border: '1px solid rgba(255,107,53,0.3)',
                            color: '#ff6b35',
                          }}
                        >
                          <AlertCircle size={14} />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { y: -2, boxShadow: '0 0 32px rgba(124,106,255,0.45)' } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                      className="text-white font-display font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                      style={{
                        background: loading
                          ? 'rgba(124,106,255,0.4)'
                          : 'linear-gradient(135deg, #7c6aff, #5a4be0)',
                        boxShadow: loading ? 'none' : '0 0 24px rgba(124,106,255,0.3)',
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
                            className="w-4 h-4 border-2 rounded-full inline-block"
                            style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit Feedback
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}