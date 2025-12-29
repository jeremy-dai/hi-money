import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className, onClick, hoverable = false, style }: CardProps) {
  const Component = onClick || hoverable ? motion.div : 'div';

  const motionProps = onClick || hoverable
    ? {
        whileHover: { scale: 1.02, y: -5 },
        whileTap: onClick ? { scale: 0.98 } : undefined,
      }
    : {};

  return (
    <Component
      className={clsx(
        'bg-white rounded-3xl p-6 shadow-lg',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      style={style}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
