import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = false, delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, borderColor: 'rgba(124,106,255,0.4)' } : {}}
      onClick={onClick}
      className={`glass ${hover ? 'cursor-pointer' : ''} ${className}`}
      style={hover ? { transition: 'border-color 0.3s ease, box-shadow 0.3s ease' } : {}}
    >
      {children}
    </motion.div>
  );
}