import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<ContainerSize, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
};

interface ContainerProps {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}

/**
 * Container — centers content and applies max-width.
 * Use `size` to control the content width.
 */
export default function Container({
  children,
  size = 'lg',
  className,
}: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeMap[size], className)}>
      {children}
    </div>
  );
}
