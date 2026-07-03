import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/* Input                                                              */
/* ------------------------------------------------------------------ */
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
  leftIcon?: ReactNode;
}

export function Input({
  label,
  hint,
  error,
  className,
  containerClassName,
  leftIcon,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'h-11 w-full rounded-lg border bg-surface px-4 text-sm text-text',
            'placeholder:text-text-muted/60',
            'border-border focus:border-accent focus:ring-1 focus:ring-accent',
            'transition-colors duration-200 outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10' : '',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-400',
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Textarea                                                           */
/* ------------------------------------------------------------------ */
interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  containerClassName?: string;
}

export function Textarea({
  label,
  hint,
  error,
  className,
  containerClassName,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full rounded-lg border bg-surface px-4 py-3 text-sm text-text',
          'placeholder:text-text-muted/60',
          'border-border focus:border-accent focus:ring-1 focus:ring-accent',
          'transition-colors duration-200 outline-none resize-y min-h-[120px]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export default Input;
