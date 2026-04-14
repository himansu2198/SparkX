import { motion } from 'framer-motion';

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  loading = false,
}) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variants = {
    primary: 'btn-glow text-white font-medium',
    secondary: 'glass border border-border hover:border-accent/40 text-text-primary hover:text-accent-soft transition-all',
    ghost: 'text-text-secondary hover:text-text-primary transition-colors',
    danger: 'bg-ember/20 border border-ember/40 text-ember hover:bg-ember/30 transition-all',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-body
        ${sizes[size]} ${variants[variant]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
          Loading...
        </>
      ) : children}
    </motion.button>
  );
}