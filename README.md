# Movie Ticket Booking Backend

Node.js + TypeScript + MongoDB backend for a BookMyShow-style movie ticket booking system.

## Features

- JWT authentication with user and admin roles
- Logout with JWT blacklist and forgot/reset password flow
- Movie listing and detail APIs
- Home API for trending, upcoming, recommended movies, search, and city selection
- Theater, screens, seats, and show management
- Seat availability and visual-layout-ready seat selection APIs
- Gold, Platinum, and Recliner seat categories
- Redis seat locks for fast concurrency control (MongoDB remains source of truth)
- Double-booking protection with MongoDB transactions and seat-level unique indexes
- Razorpay Checkout (create-order, verify, fail, webhook)
- Booking confirmation and cancellation
- Admin dashboard with total bookings, revenue, running movies, and active users
- Email and mobile notification service with console fallback

## Setup

```bash
npm install
cp .env.example .env
# Start Redis locally (e.g. docker run -p 6379:6379 redis:7-alpine)
npm run dev
```

Set `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `REDIS_URL` in `.env`.
For production, configure `RAZORPAY_WEBHOOK_SECRET` and point Razorpay webhooks to `POST /api/payments/webhook`.

Seed sample data:

```bash
npm run seed
```

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/home`
- `GET /api/movies`
- `GET /api/theaters`
- `GET /api/shows`
- `GET /api/shows/:id/seats`
- `POST /api/bookings/hold`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `GET /api/bookings/my`
- `GET /api/admin/dashboard`

Use `Authorization: Bearer <token>` for protected routes.
