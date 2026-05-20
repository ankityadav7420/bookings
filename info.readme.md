# Movie Ticket Booking Backend Flow

This backend is a BookMyShow-style Node.js, TypeScript, MongoDB application. It is organized around routes, controllers, services, models, middlewares, and utilities.

## Architecture

Request flow:

```text
Client
  -> route
  -> validation middleware
  -> auth/role middleware when required
  -> controller
  -> service
  -> Mongoose model / database
  -> standard response helper
  -> client
```

Controllers stay thin. Business rules, database queries, payment simulation, booking protection, and dashboard aggregation live inside services.

## Standard API Response

All success responses use:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "meta": {}
}
```

All error responses use the global error handler:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "details": {},
  "requestId": "trace-id"
}
```

The global handler normalizes app errors, validation errors, duplicate-key errors, invalid Mongo ids, expired JWTs, and invalid JWTs.

## Authentication Flow

1. User signs up using `POST /api/auth/register`.
2. User logs in using `POST /api/auth/login`.
3. Server returns a JWT with user id and role.
4. Client sends `Authorization: Bearer <token>` on protected APIs.
5. Logout uses `POST /api/auth/logout`, which blacklists the token until expiry.
6. Forgot password uses `POST /api/auth/forgot-password`.
7. Reset password uses `POST /api/auth/reset-password` with the emailed reset token.

Admin users are created through seed data or direct operational provisioning, not public registration.

## Home Page Flow

`GET /api/home?city=Mumbai&q=metro`

Returns:

- selected city
- available cities
- trending movies
- upcoming movies
- recommended movies
- matching theater ids for the city

This supports the frontend home page sections, search bar, and city selection.

## Movie Flow

Public users can:

- list movies with filters
- search by title, description, genre, cast, and crew
- view full movie details

Admins can:

- create movies
- edit movies
- delete movies

Movie details include title, poster, banner, description, genre, language, duration, release date, cast, crew, trailer URL, rating, and status.

## Theater Flow

Public users can:

- list theaters
- filter theaters by city
- view theater details

Admins can:

- add theaters
- update theater location, facilities, screens, and seats
- deactivate theaters

Theater screens contain seat layouts. Seat categories come from one central enum:

```ts
SEAT_CATEGORIES = ["gold", "platinum", "recliner"]
```

## Show Flow

Public users can:

- list shows by city, movie, theater, status, or date
- view a show
- view a visual-layout-ready seat map

Admins can:

- create shows
- update timings and prices
- cancel shows

Show prices are configured by seat category, so Gold, Platinum, and Recliner can have different pricing.

## Seat Selection And Locking

Seat map endpoint:

```http
GET /api/shows/:id/seats
```

Each seat returns:

- seat number
- row
- category
- active state
- status: `available`, `held`, `booked`, or `blocked`

Seat hold endpoint:

```http
POST /api/bookings/hold
```

The service:

1. Normalizes selected seat numbers.
2. Validates that seats exist on the screen.
3. Calculates total amount from show price tiers.
4. Starts a MongoDB transaction.
5. Deletes expired holds for that show.
6. Creates a seat hold with expiry.
7. Inserts one reservation per selected seat.
8. Creates a pending booking.

Double booking is prevented by a unique MongoDB index on:

```text
show + seat
```

If two users try to hold the same seat at the same time, only one insert succeeds.

## Booking And Payment Flow

Booking path:

1. Select city.
2. Select movie.
3. Select theater.
4. Select show timing.
5. Select seats.
6. Hold seats.
7. Create dummy Razorpay order.
8. Verify dummy payment.
9. Confirm booking.
10. Send email/mobile notification.

Payment endpoints:

```http
POST /api/payments/create-order
POST /api/payments/verify
```

The dummy Razorpay service returns a checkout object and a test success payload. In real Razorpay integration, the same service boundary can call Razorpay SDK APIs and verify real signatures.

On successful payment:

- payment is marked paid
- booking is marked confirmed
- held seats become booked
- hold expiry is removed
- confirmation notification is sent

On failed or expired payment:

- booking is marked failed
- held seats are released

## Admin Panel APIs

Dashboard:

```http
GET /api/admin/dashboard
```

Returns:

- total confirmed bookings
- total paid revenue
- running movie count
- active user count
- recent bookings

Other admin APIs:

- `GET /api/admin/bookings`
- `GET /api/admin/users`
- movie CRUD
- theater CRUD
- show CRUD and cancellation

## Production Notes

- Do not keep secrets in source code.
- `.env.example` intentionally leaves secret values blank.
- Use strong `JWT_SECRET`.
- Use HTTPS in production.
- Use MongoDB replica set for transaction support.
- Use centralized logs and include `x-request-id`.
- Replace dummy Razorpay with the real provider in `payment.service.ts`.
- Replace console SMS with a provider such as Twilio, MSG91, or AWS SNS.
- Configure SMTP or transactional email such as SES, SendGrid, or Mailgun.
- Keep indexes in place for bookings, payments, shows, and seat reservations.
- Run `npm run build` in CI before deploy.

## Important Files

- `src/app.ts`: Express app and middleware registration
- `src/routes`: route declarations and validation
- `src/controllers`: HTTP-only layer
- `src/services`: business logic
- `src/models`: Mongoose schemas and indexes
- `src/middlewares/error.middleware.ts`: global error handler
- `src/utils/response.ts`: standard success response helper
- `src/constants/enums.ts`: shared domain enums
