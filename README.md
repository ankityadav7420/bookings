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
- Double-booking protection with MongoDB transactions and seat-level unique indexes
- Dummy Razorpay-style payment order, verify, fail, and refund flow
- Booking confirmation and cancellation
- Admin dashboard with total bookings, revenue, running movies, and active users
- Email and mobile notification service with console fallback

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set every required secret in `.env`; the project intentionally does not ship default secret values.

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
