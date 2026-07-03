/**
 * Route Registry
 * ─────────────────────────────────
 * Central export for all route maps.
 * API entry points (api/*.js) import from here.
 *
 * Each route map is a { [HTTP_METHOD]: handler } object
 * consumed by createHandler().
 */

import resolveAuthRoute from './auth.routes.js';
import { productRoutes, reviewRoutes } from './menu.routes.js';
import cartRoutes from './cart.routes.js';
import { orderRoutes, couponRoutes } from './order.routes.js';
import { userRoutes, wishlistRoutes } from './user.routes.js';

export const routes = {
  auth: resolveAuthRoute,
  products: productRoutes,
  reviews: reviewRoutes,
  cart: cartRoutes,
  orders: orderRoutes,
  coupons: couponRoutes,
  users: userRoutes,
  wishlist: wishlistRoutes,
};

/**
 * API route manifest — documents all available endpoints.
 * Used for health checks and API discovery.
 */
export const routeManifest = [
  { path: '/api/auth',           methods: ['GET', 'POST', 'PUT'],  description: 'Authentication (signup, signin, forgot/reset password, profile)' },
  { path: '/api/products',       methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Product catalog CRUD' },
  { path: '/api/reviews',        methods: ['GET', 'POST'],         description: 'Product reviews' },
  { path: '/api/cart',           methods: ['GET', 'POST', 'PUT', 'DELETE'], description: 'Shopping cart' },
  { path: '/api/orders',         methods: ['GET', 'POST'],         description: 'Order creation and history' },
  { path: '/api/coupons',       methods: ['POST'],                description: 'Coupon validation' },
  { path: '/api/users',          methods: ['GET', 'PUT'],          description: 'User profile management' },
  { path: '/api/wishlist',       methods: ['GET', 'POST'],         description: 'Wishlist management' },
];

export default routes;
