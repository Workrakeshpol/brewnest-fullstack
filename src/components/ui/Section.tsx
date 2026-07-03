import type { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import Container from './Container';
import { cn } from '../../lib/utils';

type SectionVariant = 'default' | 'muted' | 'accent' | 'glass';
type SectionPadding = 'none' | 'sm' | 'md' | 'lg';

const variantMap: Record<SectionVariant, string> = {
  default: 'bg-bg',
  muted: 'bg-surface-hover/50',
  accent: 'bg-espresso-900 dark:bg-espresso-950',
  glass: 'glass-panel',
};

const paddingMap: Record<SectionPadding, string> = {
  none: '',
  sm: 'py-8',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-24',
};

interface SectionProps {
  children: ReactNode;
  variant?: SectionVariant;
  padding?: SectionPadding;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Section — semantic page section with background variant and padding.
 * Wraps children in a Container for consistent horizontal rhythm.
 */
export default function Section({
  children,
  variant = 'default',
  padding = 'lg',
  size = 'lg',
  className,
}: SectionProps) {
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(variantMap[variant], paddingMap[padding], className)}
    >
      <Container size={size}>{children}</Container>
    </motion.section>
  );
}
