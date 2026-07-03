import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

/* ── Types ──────────────────────────────────────────────────── */
type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'cta';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface ButtonAsButton
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  to?: undefined;
}

interface ButtonAsLink extends BaseProps {
  to: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

/* ── Style maps ─────────────────────────────────────────────── */
const variantMap: Record<Variant, string> = {
  primary:
    'bg-espresso-800 text-cream-50 hover:bg-espresso-700 dark:bg-caramel-500 dark:text-espresso-950 dark:hover:bg-caramel-400',
  accent:
    'bg-caramel-500 text-white hover:bg-caramel-600 dark:bg-caramel-400 dark:text-espresso-950 dark:hover:bg-caramel-300',
  outline:
    'border border-border bg-transparent text-text hover:bg-surface-hover',
  ghost:
    'bg-transparent text-text-muted hover:bg-surface-hover hover:text-text',
  cta:
    'bg-gradient-to-r from-espresso-800 to-caramel-500 text-cream-50 hover:from-espresso-700 hover:to-caramel-400',
};

const sizeMap: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-7 text-base gap-2.5',
};

/* ── Component ──────────────────────────────────────────────── */
export default function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    className,
  } = props;

  const classes = cn(
    'inline-flex items-center justify-center rounded-full font-medium',
    'transition-colors duration-200 outline-none',
    'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    variantMap[variant],
    sizeMap[size],
    fullWidth && 'w-full',
    className,
  );

  const content = (
    <>
      {leftIcon}
      {children}
      {rightIcon}
    </>
  );

  // Render as link
  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={classes}>
        {content}
      </Link>
    );
  }

  // Destructure button-specific props
  const { to: _to, variant: _v, size: _s, fullWidth: _f, leftIcon: _li, rightIcon: _ri, children: _c, className: _cn, ...buttonProps } =
    props as ButtonAsButton;

  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
