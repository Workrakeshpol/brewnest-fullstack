# BrewNest Backend Architecture

A scalable, layered backend architecture for the BrewNest specialty cafe platform.

## Architecture Overview

```
server/
├── config/              Environment configuration & Supabase clients
│   ├── index.js         Centralized env var access with validation
│   └── supabase.js      Server-side Supabase clients (admin, anon, user-scoped)
│
├── middleware/          Reusable request middleware
│   ├── cors.js          CORS headers + preflight handling
│   ├── auth.js          JWT verification, optional auth, role-based access
│   ├── error.js         Central error handler (ApiError, Postgres, unexpected)
│   ├── validation.js    Schema-based request validation (body, query)
│   └── rateLimit.js     In-memory rate limiting per IP
│
├── models/              Database models (Supabase query builder wrappers)
│   ├── BaseModel.js     Abstract base with CRUD: findAll, findById, create, update, delete
│   ├── user.model.js    profiles table — has many orders, cart, reviews, wishlist
│   ├── product.model.js products table — has many reviews, order_items, cart_items
│   ├── order.model.js   orders table — belongs to user, has many order_items
│   ├── cart.model.js    cart_items table — belongs to user + product
│   ├── review.model.js  reviews table — belongs to product + user
│   ├── coupon.model.js  coupons table — standalone lookup
│   ├── wishlist.model.js wishlists table — belongs to user + product
│   └── index.js         Model registry + relationship graph
│
├── validators/          Request validation schemas
│   ├── auth.validator.js     signUp, signIn, forgotPassword, resetPassword, updateProfile
│   ├── menu.validator.js     createProduct, updateProduct, listProducts, createReview
│   ├── cart.validator.js     addToCart, updateCart, removeFromCart
│   └── order.validator.js    createOrder, applyCoupon
│
├── services/            Business logic layer (stubs — ready for implementation)
│   ├── auth.service.js       signUp, signIn, forgotPassword, resetPassword, profile
│   ├── menu.service.js       listProducts, getProduct, CRUD, reviews
│   ├── cart.service.js       getCart, addToCart, updateQuantity, clearCart
│   ├── order.service.js      createOrder, getUserOrders, validateCoupon
│   ├── user.service.js       profile, wishlist toggle
│   └── coupon.service.js     validate, create, markUsed
│
├── controllers/         HTTP layer — delegates to services, returns standardized responses
│   ├── auth.controller.js
│   ├── menu.controller.js
│   ├── cart.controller.js
│   ├── order.controller.js
│   └── user.controller.js
│
├── routes/              Route organization — maps HTTP methods to controllers
│   ├── auth.routes.js
│   ├── menu.routes.js
│   ├── cart.routes.js
│   ├── order.routes.js
│   ├── user.routes.js
│   └── index.js         Route registry + API manifest
│
└── utils/               Shared utilities
    ├── apiResponse.js   success(), paginated(), error(), created(), noContent()
    ├── ApiError.js      Custom error class with status codes + factories
    ├── asyncHandler.js  Wraps async handlers for error catching
    ├── logger.js        Structured logger (JSON in prod, pretty in dev)
    └── handler.js       createHandler() — Vercel serverless entry point factory
```

## Layered Architecture

```
Request → API Entry Point (api/*.js)
               ↓
         createHandler(routeMap)
               ↓
         Middleware Chain (CORS → Auth → Validation → RateLimit)
               ↓
         Controller (HTTP layer — request parsing, response formatting)
               ↓
         Service (Business logic — orchestration, rules, transactions)
               ↓
         Model (Data access — Supabase query builder)
               ↓
         Database (Supabase / Postgres)
```

## Key Design Decisions

### 1. Handler Factory Pattern
Each `api/*.js` file is a thin Vercel serverless entry point that delegates to `createHandler()`:
```js
import { createHandler } from '../server/utils/handler.js';
import { productRoutes } from '../server/routes/menu.routes.js';
export default createHandler(productRoutes);
```

### 2. Middleware Composition
Middleware is composed via `withMiddleware()`:
```js
{
  POST: withMiddleware(requireRole('admin'), validateBody(schema), controller.create)
}
```

### 3. Standardized API Responses
All controllers use `apiResponse` utilities — never call `res.json()` directly:
```js
success(res, 200, data)           // { success: true, data }
paginated(res, data, { page, limit, total })  // with pagination meta
error(res, 400, 'Message', details)           // { success: false, error: { message, details } }
created(res, data)                 // 201
```

### 4. Error Handling
- `ApiError` class for operational errors (badRequest, unauthorized, forbidden, notFound, conflict, tooMany)
- Central `errorHandler` catches ApiError, Postgres errors (by code), and unexpected errors
- In production, unexpected error details are hidden from clients

### 5. Model Layer
- `BaseModel` provides generic CRUD via Supabase query builder
- Each model defines `schema` (for documentation) and `relations` (for introspection)
- No ORM — direct Supabase client, keeping the stack lightweight

### 6. Validation
- Schema-based, zero-dependency validator
- Supports: string, email, integer, number, boolean, array, uuid, enum
- `validateBody(schema)` and `validateQuery(schema)` middleware factories
- Whitelists fields (strips unknown fields from body)

### 7. Authentication
- Supabase JWT verification via `authMiddleware`
- `optionalAuth` for endpoints that work with or without auth
- `requireRole('admin', 'barista')` for role-based access control
- Admin role always bypasses role checks

## Database Schema

| Table          | Primary Key | Key Relationships                          |
|----------------|-------------|--------------------------------------------|
| profiles       | uuid (id)   | has many: orders, cart_items, reviews, wishlists |
| user_roles     | uuid (user_id) | belongs to: profiles                    |
| products       | text (id)   | has many: reviews, order_items, cart_items, wishlists |
| cart_items     | serial (id) | belongs to: profiles, products             |
| wishlists      | serial (id) | belongs to: profiles, products             |
| orders         | serial (id) | belongs to: profiles; has many: order_items|
| order_items    | serial (id) | belongs to: orders, products               |
| reviews        | serial (id) | belongs to: products, profiles             |
| coupons        | serial (id) | standalone                                 |

## Frontend API Client

Located in `src/lib/api/` — ready to import from any frontend component:

```js
import { authApi, menuApi, cartApi } from '../lib/api';

// Auth
await authApi.signIn({ email, password });
await authApi.signUp({ email, password, name });

// Menu
const products = await menuApi.listProducts({ category: 'espresso', sort: 'rating' });
const product = await menuApi.getProduct('house-drip');

// Cart
await cartApi.addToCart('house-drip', 2);
await cartApi.updateQuantity('house-drip', 3);
await cartApi.removeFromCart('house-drip');
```

## Implementation Status

| Layer         | Status      | Notes                                    |
|---------------|-------------|------------------------------------------|
| Config        | ✅ Complete | Env validation, 3 Supabase client variants |
| Middleware    | ✅ Complete | CORS, auth, RBAC, error, validation, rate limit |
| Models        | ✅ Complete | 7 models + BaseModel + relationship graph  |
| Validators    | ✅ Complete | 4 validator files covering all schemas     |
| Services      | 📋 Stubs    | Method signatures ready, logic TODO        |
| Controllers   | 📋 Stubs    | 501 responses, ready to wire to services   |
| Routes        | ✅ Complete | 5 route files + registry + manifest        |
| Utils         | ✅ Complete | apiResponse, ApiError, asyncHandler, logger, handler |
| Frontend API  | ✅ Complete | 6 client modules + barrel export           |
