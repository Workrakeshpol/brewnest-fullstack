import supabase from './supabase';

/**
 * API client — wraps fetch with auth token injection.
 * Falls back to static data when the API is unavailable.
 */

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(path, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`;
    if (isJson) {
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      } catch {}
    }
    throw new Error(errorMessage);
  }

  if (!isJson) {
    throw new Error(`API endpoint ${path} did not return JSON (Content-Type: ${contentType || 'unknown'})`);
  }

  try {
    return await res.json();
  } catch (err) {
    throw new Error(`Failed to parse response from ${path} as JSON`);
  }
}

/* ── Auth API ────────────────────────────────────────────────── */
export const authApi = {
  signUp: (email: string, password: string, name: string) =>
    apiFetch('/api/auth?action=signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  signIn: (email: string, password: string) =>
    apiFetch('/api/auth?action=signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email: string) =>
    apiFetch('/api/auth?action=forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (access_token: string, refresh_token: string, new_password: string) =>
    apiFetch('/api/auth?action=reset-password', {
      method: 'POST',
      body: JSON.stringify({ access_token, refresh_token, new_password }),
    }),

  getCurrentUser: () => apiFetch('/api/auth', { method: 'GET' }),

  signOut: () =>
    apiFetch('/api/auth?action=signout', { method: 'POST' }),
};

/* ── Products API ───────────────────────────────────────────── */
export const productsApi = {
  list: (params?: { category?: string; search?: string; sort?: string; tags?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.tags) query.set('tags', params.tags);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiFetch(`/api/products?${query}`);
  },

  get: (id: string) => apiFetch(`/api/product?id=${id}`),

  create: (data: any) =>
    apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: any) =>
    apiFetch('/api/products', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),

  delete: (id: string) =>
    apiFetch('/api/products', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

/* ── Categories API ────────────────────────────────────────── */
export const categoriesApi = {
  list: () => apiFetch('/api/categories'),
  create: (data: any) =>
    apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch('/api/categories', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) =>
    apiFetch('/api/categories', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

/* ── Cart API ──────────────────────────────────────────────── */
export const cartApi = {
  list: () => apiFetch('/api/cart'),
  add: (product_id: string, quantity = 1) =>
    apiFetch('/api/cart', { method: 'POST', body: JSON.stringify({ product_id, quantity }) }),
  update: (product_id: string, quantity: number) =>
    apiFetch('/api/cart', { method: 'PUT', body: JSON.stringify({ product_id, quantity }) }),
  remove: (product_id: string) =>
    apiFetch('/api/cart', { method: 'DELETE', body: JSON.stringify({ product_id }) }),
};

/* ── Wishlist API ─────────────────────────────────────────── */
export const wishlistApi = {
  list: () => apiFetch('/api/wishlist'),
  add: (product_id: string) =>
    apiFetch('/api/wishlist', { method: 'POST', body: JSON.stringify({ product_id }) }),
  remove: (product_id: string) =>
    apiFetch('/api/wishlist', { method: 'DELETE', body: JSON.stringify({ product_id }) }),
};

/* ── Orders API ────────────────────────────────────────────── */
export const ordersApi = {
  list: () => apiFetch('/api/orders'),
  create: (data: any) =>
    apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
};

/* ── Reviews API ───────────────────────────────────────────── */
export const reviewsApi = {
  list: (product_id: string) => apiFetch(`/api/reviews?product_id=${product_id}`),
  create: (data: { product_id: string; rating: number; title: string; body: string }) =>
    apiFetch('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  approve: (id: string) =>
    apiFetch('/api/reviews', { method: 'PUT', body: JSON.stringify({ id, is_approved: true }) }),
  delete: (id: string) =>
    apiFetch('/api/reviews', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

/* ── Coupons API ───────────────────────────────────────────── */
export const couponsApi = {
  validate: (code: string) => apiFetch(`/api/coupons?code=${encodeURIComponent(code)}`),
  list: () => apiFetch('/api/coupons'),
  create: (data: any) =>
    apiFetch('/api/coupons', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiFetch('/api/coupons', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) =>
    apiFetch('/api/coupons', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

/* ── Reservations API ───────────────────────────────────────── */
export const reservationsApi = {
  list: (email: string) => apiFetch(`/api/reservations?email=${email}`),
  create: (data: any) =>
    apiFetch('/api/reservations', { method: 'POST', body: JSON.stringify(data) }),
  cancel: (id: string) =>
    apiFetch('/api/reservations', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

/* ── Contact API ───────────────────────────────────────────── */
export const contactApi = {
  submit: (data: { name: string; email: string; subject: string; message: string }) =>
    apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(data) }),
  list: () => apiFetch('/api/contact'),
  updateStatus: (id: string, status: string) =>
    apiFetch('/api/contact', { method: 'PUT', body: JSON.stringify({ id, status }) }),
};

/* ── Newsletter API ────────────────────────────────────────── */
export const newsletterApi = {
  subscribe: (email: string) =>
    apiFetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
  unsubscribe: (email: string) =>
    apiFetch('/api/newsletter', { method: 'DELETE', body: JSON.stringify({ email }) }),
  check: (email: string) => apiFetch(`/api/newsletter?email=${email}`),
};

/* ── Admin API ─────────────────────────────────────────────── */
export const adminApi = {
  stats: () => apiFetch('/api/admin?resource=stats'),
  orders: () => apiFetch('/api/admin?resource=orders'),
  reservations: () => apiFetch('/api/admin?resource=reservations'),
  messages: () => apiFetch('/api/admin?resource=messages'),
  reviews: () => apiFetch('/api/admin?resource=reviews'),
  updateOrderStatus: (id: string, status: string) =>
    apiFetch('/api/admin', { method: 'PUT', body: JSON.stringify({ resource: 'order', id, status }) }),
  updateReservationStatus: (id: string, status: string) =>
    apiFetch('/api/admin', { method: 'PUT', body: JSON.stringify({ resource: 'reservation', id, status }) }),
  updateMessageStatus: (id: string, status: string) =>
    apiFetch('/api/admin', { method: 'PUT', body: JSON.stringify({ resource: 'message', id, status }) }),
};

/* ── Inventory API ─────────────────────────────────────────── */
export const inventoryApi = {
  get: (productId: string) => apiFetch(`/api/inventory?product_id=${productId}`),
  list: () => apiFetch('/api/inventory'),
  upsert: (data: { product_id: string; stock_quantity?: number; low_stock_threshold?: number; is_available?: boolean }) =>
    apiFetch('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { stock_quantity?: number; low_stock_threshold?: number; is_available?: boolean; restock_date?: string }) =>
    apiFetch('/api/inventory', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: number) =>
    apiFetch('/api/inventory', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

/* ── Notifications API ─────────────────────────────────────── */
export const notificationsApi = {
  list: () => apiFetch('/api/notifications'),
  markRead: (id: string) =>
    apiFetch('/api/notifications', { method: 'PUT', body: JSON.stringify({ id }) }),
  markAllRead: () =>
    apiFetch('/api/notifications', { method: 'PUT', body: JSON.stringify({ mark_all: true }) }),
  delete: (id: string) =>
    apiFetch('/api/notifications', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

/* ── Addresses API ─────────────────────────────────────────── */
export const addressesApi = {
  list: () => apiFetch('/api/addresses'),
  create: (data: { label: string; address: string; city: string; zip: string; is_default?: boolean }) =>
    apiFetch('/api/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ label: string; address: string; city: string; zip: string; is_default: boolean }>) =>
    apiFetch('/api/addresses', { method: 'PUT', body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) =>
    apiFetch('/api/addresses', { method: 'DELETE', body: JSON.stringify({ id }) }),
};

/* ── Analytics API ─────────────────────────────────────────── */
export const analyticsApi = {
  overview: () => apiFetch('/api/analytics?type=overview'),
  revenue: () => apiFetch('/api/analytics?type=revenue'),
  categories: () => apiFetch('/api/analytics?type=categories'),
  topProducts: () => apiFetch('/api/analytics?type=top-products'),
  reports: () => apiFetch('/api/analytics?type=reports'),
};

/* ── Users API (admin) ─────────────────────────────────────── */
export const usersApi = {
  list: () => apiFetch('/api/users'),
  updateRole: (id: string, role: string) =>
    apiFetch('/api/users', { method: 'PUT', body: JSON.stringify({ id, role }) }),
  delete: (id: string) =>
    apiFetch('/api/users', { method: 'DELETE', body: JSON.stringify({ id }) }),
};
