# GearUp 🏋️ — Sports & Outdoor Gear Rental API

Rent Sports & Outdoor Gear Instantly. A backend-only REST API where customers browse and rent gear, providers manage inventory and fulfill orders, and admins oversee the platform.

---

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Roles & permissions](#roles--permissions)
- [Rental order lifecycle](#rental-order-lifecycle)
- [Error response format](#error-response-format)
- [Deployment](#deployment)

---

## Tech stack

| Layer      | Technology                                          |
| ---------- | --------------------------------------------------- |
| Runtime    | Node.js (ESM)                                       |
| Framework  | Express 5                                           |
| Language   | TypeScript                                          |
| Database   | PostgreSQL                                          |
| ORM        | Prisma 7 (driver adapters via `@prisma/adapter-pg`) |
| Auth       | JWT (access + refresh tokens)                       |
| Payments   | SSLCommerz                                          |
| Build      | tsup                                                |
| Deployment | Vercel                                              |

---

## Features

### Public

- Browse gear with search, category, and price filters
- View gear details, provider info, and reviews

### Customer

- Register / log in
- Place rental orders for a date range and quantity
- Pay via SSLCommerz
- Track rental order status
- View payment history
- Leave a review after a rental is returned

### Provider

- Manage gear inventory (create, update, remove)
- View incoming rental orders
- Confirm orders and update their status through pickup and return

### Admin

- Manage users (suspend / activate)
- Manage gear categories
- Oversee all gear listings and rental orders

---

## Project structure

Modular pattern — each feature owns its own folder with a consistent file set:

```text
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.route.ts
│   │   └── auth.interface.ts
│   ├── category/
│   ├── gear/
│   ├── provider/        # aggregates provider-only gear + order routes
│   ├── rentalOrder/
│   ├── payment/
│   ├── review/
│   └── admin/
├── middleware/
│   ├── auth.ts               # JWT verification + role guard
│   ├── globalErrorHandler.ts # turns every thrown error into a consistent response
│   └── notFound.ts
├── utils/
│   ├── catchAsync.ts
│   ├── sendResponse.ts
│   ├── appError.ts
│   └── jwt.ts
├── config/
├── lib/prisma.ts        # PrismaClient + PrismaPg adapter
├── app.ts
└── server.ts

prisma/
├── schema/              # multi-file schema (one file per model + enums)
├── migrations/
└── seed.ts              # seeds the mandatory admin account + starter categories
```

---

## Getting started

```bash
git clone <your-repo-url>
cd GearUp
npm install
cp .env.example .env      # fill in your own values
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The API runs at `http://localhost:4000` (or whatever `PORT` you set).

### Scripts

| Command         | What it does                             |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Runs the API with hot reload via `tsx`   |
| `npm run build` | Bundles the API with `tsup` into `dist/` |
| `npm start`     | Runs the built output (`dist/server.js`) |

---

## Environment variables

| Variable                                              | Description                            |
| ----------------------------------------------------- | -------------------------------------- |
| `PORT`                                                | Port the server listens on             |
| `APP_URL`                                             | Frontend/client origin, used for CORS  |
| `DATABASE_URL`                                        | PostgreSQL connection string           |
| `BCRYPT_SALT_ROUNDS`                                  | Salt rounds for password hashing       |
| `JWT_ACCESS_SECRET` / `JWT_ACCESS_EXPIRES_IN`         | Access token secret + expiry           |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN`       | Refresh token secret + expiry          |
| `SSL_COMMERZ_STORE_ID` / `SSL_COMMERZ_STORE_PASSWORD` | SSLCommerz sandbox credentials         |
| `SSLCOMMERZ_INIT_URL`                                 | SSLCommerz payment initiation endpoint |
| `SSLCOMMERZ_VALIDATE_URL`                             | SSLCommerz payment validation endpoint |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD`                      | Seeded admin login credentials         |

> Get free SSLCommerz sandbox credentials at [developer.sslcommerz.com](https://developer.sslcommerz.com/registration/).

---

## API reference

Base URL: `/api`

### Auth — `/auth`

| Method | Endpoint         | Access        | Description                     |
| ------ | ---------------- | ------------- | ------------------------------- |
| POST   | `/auth/register` | Public        | Register a customer or provider |
| POST   | `/auth/login`    | Public        | Log in, receive access token    |
| GET    | `/auth/me`       | Authenticated | Get current user's profile      |

### Categories — `/categories`

| Method | Endpoint          | Access | Description         |
| ------ | ----------------- | ------ | ------------------- |
| GET    | `/categories`     | Public | List all categories |
| POST   | `/categories`     | Admin  | Create a category   |
| PATCH  | `/categories/:id` | Admin  | Update a category   |
| DELETE | `/categories/:id` | Admin  | Delete a category   |

### Gear — `/gear`

| Method | Endpoint    | Access | Description                              |
| ------ | ----------- | ------ | ---------------------------------------- |
| GET    | `/gear`     | Public | Browse gear with filters (see below)     |
| GET    | `/gear/:id` | Public | Get gear details, provider info, reviews |

**Query parameters for `GET /gear`:**

| Parameter    | Description                                |
| ------------ | ------------------------------------------ |
| `searchTerm` | Search by gear name, brand, or description |
| `categoryId` | Filter by category id                      |
| `minPrice`   | Minimum price per day                      |
| `maxPrice`   | Maximum price per day                      |
| `page`       | Pagination — page number                   |
| `limit`      | Pagination — items per page                |

### Provider — `/provider`

| Method | Endpoint                     | Access   | Description                    |
| ------ | ---------------------------- | -------- | ------------------------------ |
| POST   | `/provider/gear`             | Provider | Add gear to inventory          |
| GET    | `/provider/my-gear`          | Provider | List your own gear listings    |
| PATCH  | `/provider/gear/:id`         | Provider | Update a gear listing          |
| DELETE | `/provider/gear/:id`         | Provider | Remove a gear listing          |
| GET    | `/provider/rentalOrders`     | Provider | List incoming rental orders    |
| PATCH  | `/provider/rentalOrders/:id` | Provider | Update a rental order's status |

### Rental orders — `/rentals`

| Method | Endpoint              | Access        | Description                                          |
| ------ | --------------------- | ------------- | ---------------------------------------------------- |
| POST   | `/rentals`            | Customer      | Place a rental order                                 |
| GET    | `/rentals`            | Customer      | List your own rental orders                          |
| GET    | `/rentals/:id`        | Authenticated | Get rental order details (owner, provider, or admin) |
| PATCH  | `/rentals/cancel/:id` | Authenticated | Cancel a rental order                                |

### Payments — `/payments`

| Method | Endpoint             | Access              | Description                                               |
| ------ | -------------------- | ------------------- | --------------------------------------------------------- |
| POST   | `/payments/create`   | Customer            | Start an SSLCommerz payment session for a confirmed order |
| POST   | `/payments/confirm`  | SSLCommerz callback | Verifies and confirms a payment (idempotent)              |
| GET    | `/payments/customer` | Customer            | Your payment history                                      |
| GET    | `/payments/:id`      | Authenticated       | Get a single payment's details                            |

### Reviews — `/reviews`

| Method | Endpoint   | Access   | Description                          |
| ------ | ---------- | -------- | ------------------------------------ |
| POST   | `/reviews` | Customer | Leave a review for a returned rental |

### Admin — `/admin`

| Method | Endpoint              | Access | Description                |
| ------ | --------------------- | ------ | -------------------------- |
| GET    | `/admin/users`        | Admin  | List all users             |
| PATCH  | `/admin/users/:id`    | Admin  | Suspend or activate a user |
| GET    | `/admin/gear`         | Admin  | List all gear listings     |
| GET    | `/admin/rentalOrders` | Admin  | List all rental orders     |

---

## Roles & permissions

| Role       | Description                                       |
| ---------- | ------------------------------------------------- |
| `CUSTOMER` | Browses gear, places orders, pays, reviews        |
| `PROVIDER` | Manages gear inventory and fulfills orders        |
| `ADMIN`    | Manages users, categories, and platform oversight |

Role is chosen at registration (`CUSTOMER` or `PROVIDER`). Admin accounts are created via the seed script, not self-registration.

---

## Rental order lifecycle

```text
PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED
   ↓          ↓
CANCELLED  CANCELLED
```

- **PLACED** — customer submits the order
- **CONFIRMED** — provider confirms availability
- **PAID** — set automatically once SSLCommerz confirms payment (never set directly by a client)
- **PICKED_UP** / **RETURNED** — provider updates as the physical handoff happens
- **CANCELLED** — reachable only from `PLACED` or `CONFIRMED`, by the customer or an admin
- A review can only be submitted once an order reaches **RETURNED**

---

## Error response format

Every error, regardless of source (validation, Prisma, or a thrown business-logic error), returns the same shape:

```json
{
  "success": false,
  "message": "Human-readable message",
  "errorDetails": [{ "path": "", "message": "..." }]
}
```

---

## Deployment

Deployed to Vercel using `vercel.json` pointing at the `tsup`-bundled `dist/server.js` output. Before deploying:

1. Set every variable from [Environment variables](#environment-variables) in Vercel's dashboard (Production environment, not just Preview/Development).
2. Run `npx prisma migrate deploy` against your production database (not `migrate dev`).
3. Confirm `SSLCOMMERZ_INIT_URL` / `SSLCOMMERZ_VALIDATE_URL` point at SSLCommerz's **live** endpoints if this is a real deployment, not the sandbox.
