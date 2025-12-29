import { motion } from 'framer-motion';
import clsx from 'clsx';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export function PageContainer({ children, className, gradient = true }: PageContainerProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className={clsx(
        'min-h-screen p-4 md:p-8',
        gradient && 'bg-gradient-to-br from-purple-600 to-purple-800',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
