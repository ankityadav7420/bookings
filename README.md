# Movie Ticket Booking Backend

Node.js + TypeScript + MongoDB backend for a BookMyShow-style movie ticket booking system.

## Features

- JWT authentication with user and admin roles
- Movie listing and detail APIs
- Theater, screens, seats, and show management
- Seat availability and seat selection APIs
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

Seed sample data:

```bash
npm run seed
```

## Main Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
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
