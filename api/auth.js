import supabase from './db-client.js';
import {
  setCORS, requireAuth, requireRole, getUser, getUserRole,
  rateLimit, sanitize, isValidEmail, validatePassword,
  handleError, ok, created, badRequest, unauthorized,
} from './_helpers.js';

export default async function handler(req, res) {
  if (setCORS(req, res)) return;

  try {
    if (req.method === 'POST') {
      const { action } = req.query;
      const body = req.body || {};

      // ── Sign Up ──────────────────────────────────────────
      if (action === 'signup') {
        if (!rateLimit(req, res, { max: 5, windowMs: 60_000 })) return;

        const email = sanitize(body.email).toLowerCase();
        const password = body.password;
        const name = sanitize(body.name).slice(0, 100);

        if (!email || !password) {
          return badRequest(res, 'Email and password are required');
        }
        if (!isValidEmail(email)) {
          return badRequest(res, 'Invalid email format');
        }
        const pwError = validatePassword(password);
        if (pwError) return badRequest(res, pwError);

        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name: name || email.split('@')[0] },
        });

        if (error) {
          if (error.message?.includes('already')) {
            return res.status(409).json({ error: 'An account with this email already exists' });
          }
          return handleError(error, res, 'Auth signup');
        }

        // Assign default 'customer' role + create profile
        await Promise.all([
          supabase.from('user_roles').insert({ user_id: data.user.id, role: 'customer' }),
          supabase.from('profiles').insert({
            id: data.user.id,
            email,
            name: name || email.split('@')[0],
          }),
        ]);

        return created(res, {
          message: 'Account created successfully',
          user: { id: data.user.id, email: data.user.email },
        });
      }

      // ── Sign In ──────────────────────────────────────────
      if (action === 'signin') {
        if (!rateLimit(req, res, { max: 10, windowMs: 60_000 })) return;

        const email = sanitize(body.email).toLowerCase();
        const password = body.password;

        if (!email || !password) {
          return badRequest(res, 'Email and password are required');
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          return unauthorized(res, 'Invalid email or password');
        }

        const role = await getUserRole(data.user.id);

        return ok(res, {
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0],
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          },
          role,
        });
      }

      // ── Forgot Password ──────────────────────────────────
      if (action === 'forgot-password') {
        if (!rateLimit(req, res, { max: 3, windowMs: 60_000 })) return;

        const email = sanitize(body.email).toLowerCase();
        if (!email || !isValidEmail(email)) {
          return badRequest(res, 'Valid email is required');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          // Don't reveal whether email exists
          return ok(res, { message: 'If an account exists, a reset link has been sent.' });
        }

        return ok(res, { message: 'If an account exists, a reset link has been sent.' });
      }

      // ── Reset Password ────────────────────────────────────
      if (action === 'reset-password') {
        if (!rateLimit(req, res, { max: 5, windowMs: 60_000 })) return;

        const { access_token, refresh_token, new_password } = body;

        if (!access_token || !refresh_token || !new_password) {
          return badRequest(res, 'Token and new password are required');
        }
        const pwError = validatePassword(new_password);
        if (pwError) return badRequest(res, pwError);

        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) {
          return unauthorized(res, 'Invalid or expired reset token');
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: new_password,
        });

        if (updateError) {
          return handleError(updateError, res, 'Auth reset-password');
        }

        return ok(res, { message: 'Password updated successfully' });
      }

      // ── Sign Out ──────────────────────────────────────────
      if (action === 'signout') {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) {
          // Sign out using the user's own token via a scoped client
          const { createClient } = await import('@supabase/supabase-js');
          const userClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            { global: { headers: { Authorization: `Bearer ${token}` } } },
          );
          await userClient.auth.signOut();
        }
        return ok(res, { message: 'Signed out successfully' });
      }

      return badRequest(res, 'Unknown action. Use ?action=signup|signin|forgot-password|reset-password|signout');
    }

    // ── GET: Current user ────────────────────────────────────
    if (req.method === 'GET') {
      const user = await getUser(req);
      if (!user) return unauthorized(res, 'Not authenticated');

      const [roleData, profile] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', user.id).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ]);

      return ok(res, {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || profile?.data?.name || user.email?.split('@')[0],
          avatar_url: profile?.data?.avatar_url || null,
          phone: profile?.data?.phone || null,
        },
        role: roleData?.data?.role || 'customer',
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    handleError(err, res, 'Auth');
  }
}
