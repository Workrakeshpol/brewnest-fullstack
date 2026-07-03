import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface Step {
  id: string;
  label: string;
  icon: typeof Check;
}

interface CheckoutStepperProps {
  steps: readonly Step[];
  currentStep: number;
  className?: string;
}

/**
 * CheckoutStepper — horizontal progress indicator for multi-step checkout.
 * Shows completed (check), active (filled), and upcoming (muted) states.
 */
export default function CheckoutStepper({
  steps,
  currentStep,
  className,
}: CheckoutStepperProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, i) => {
        const isComplete = i < currentStep;
        const isActive = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.id} className={cn('flex items-center', !isLast && 'flex-1')}>
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-300',
                  isComplete
                    ? 'border-sage-500 bg-sage-500 text-white dark:border-sage-400 dark:bg-sage-400 dark:text-espresso-950'
                    : isActive
                      ? 'border-accent bg-accent text-white'
                      : 'border-border bg-surface text-text-muted',
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </motion.div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300',
                  isActive ? 'text-text' : 'text-text-muted',
                  isComplete && 'text-sage-600 dark:text-sage-400',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-border sm:mx-3">
                <motion.div
                  initial={false}
                  animate={{ width: isComplete ? '100%' : '0%' }}
                  transition={{ duration: 0.4 }}
                  className="h-full rounded-full bg-sage-500 dark:bg-sage-400"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
