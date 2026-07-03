import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Coffee, Lock, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../lib/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tokens come from the email link via URL hash/query
  const accessToken = params.get('access_token') || '';
  const refreshToken = params.get('refresh_token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!accessToken || !refreshToken) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      await authApi.resetPassword(accessToken, refreshToken, password);
      navigate('/login', { replace: true, state: { message: 'Password reset successfully. Please sign in.' } });
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
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
            <h1 className="mt-4 font-serif text-2xl font-bold text-text">New Password</h1>
            <p className="mt-1 text-sm text-text-muted">Choose a new password for your account</p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/10">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="New Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-9 text-text-muted hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
            />

            <div className="rounded-xl border border-border bg-surface-hover/50 p-3">
              <p className="mb-1.5 text-xs font-medium text-text-muted">Password must have:</p>
              <ul className="space-y-1 text-xs">
                <li className={`flex items-center gap-1.5 ${password.length >= 6 ? 'text-sage-600 dark:text-sage-400' : 'text-text-muted'}`}>
                  <Check className="h-3 w-3" /> At least 6 characters
                </li>
                <li className={`flex items-center gap-1.5 ${password === confirmPassword && password ? 'text-sage-600 dark:text-sage-400' : 'text-text-muted'}`}>
                  <Check className="h-3 w-3" /> Passwords match
                </li>
              </ul>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Updating password…
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-muted">
            <Link to="/login" className="font-medium text-accent hover:underline">
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </Section>
  );
}
