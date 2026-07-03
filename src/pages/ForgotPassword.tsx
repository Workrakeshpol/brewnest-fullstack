import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email'); return; }

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section padding="lg" className="pt-32">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-espresso-800 text-cream-50 dark:bg-caramel-500 dark:text-espresso-950">
              <Coffee className="h-6 w-6" />
            </span>
            <h1 className="mt-4 font-serif text-2xl font-bold text-text">Reset Password</h1>
            <p className="mt-1 text-sm text-text-muted">
              {sent ? 'Check your email for a reset link' : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-sage-600 dark:bg-sage-800/40 dark:text-sage-300">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm text-text-muted">
                We've sent a password reset link to <span className="font-medium text-text">{email}</span>.
                The link will expire in 1 hour.
              </p>
              <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/10">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="h-4 w-4" />}
                  autoComplete="email"
                />
                <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending link…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-text-muted">
                Remembered your password?{' '}
                <Link to="/login" className="font-medium text-accent hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </Section>
  );
}
