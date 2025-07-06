# Service Booking App

A comprehensive service booking system built with Node.js, Express, TypeScript, and Prisma.

## Features

- User authentication and authorization
- Service booking with specialists
- Multiple address support
- Payment integration with Stripe
- Email notifications
- Redis caching for OTP and sessions

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Payment**: Stripe
- **Email**: Nodemailer
- **Deployment**: Fly.io

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis server
- Stripe account

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your environment variables
4. Generate Prisma client: `npm run prisma:generate`
5. Run database migrations: `npm run prisma:migrate`
6. Start the development server: `npm run dev`

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/service_booking"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="24h"

# Redis
REDIS_URL="redis://localhost:6379"
# OR use separate host/port
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
AUTH_MAIL_USER="your-email@gmail.com"
AUTH_MAIL_PASS="your-app-password"
DEFAULT_FROM_EMAIL="support@yourdomain.com"
```

## Deployment to Fly.io

### 1. Install Fly.io CLI

```bash
# Windows (using PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Or download from https://fly.io/docs/hands-on/install-flyctl/
```

### 2. Login to Fly.io

```bash
fly auth login
```

### 3. Create a Fly.io App

```bash
fly apps create service-booking-app
```

### 4. Set up PostgreSQL Database

```bash
# Create a PostgreSQL database
fly postgres create service-booking-db

# Attach it to your app
fly postgres attach service-booking-db --app service-booking-app
```

### 5. Set up Redis

You have several options for Redis:

#### Option A: Use Fly.io Redis (Recommended)
```bash
# Create a Redis database
fly redis create service-booking-redis

# Attach it to your app
fly redis attach service-booking-redis --app service-booking-app
```

#### Option B: Use External Redis Service
```bash
# Set Redis URL (e.g., from Upstash, Redis Cloud, etc.)
fly secrets set REDIS_URL="redis://username:password@host:port"
```

### 6. Set Environment Variables

```bash
# Set required secrets
fly secrets set JWT_SECRET="your-super-secret-jwt-key"
fly secrets set STRIPE_SECRET_KEY="sk_live_..."
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
fly secrets set MAIL_HOST="smtp.gmail.com"
fly secrets set MAIL_PORT="587"
fly secrets set AUTH_MAIL_USER="your-email@gmail.com"
fly secrets set AUTH_MAIL_PASS="your-app-password"
fly secrets set DEFAULT_FROM_EMAIL="support@yourdomain.com"
```

### 7. Deploy the Application

```bash
fly deploy
```

### 8. Set up Stripe Webhook

After deployment, configure your Stripe webhook to point to:
```
https://service-booking-app.fly.dev/webhook/stripe
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password

### Addresses
- `GET /api/v1/addresses` - Get user addresses
- `POST /api/v1/addresses` - Create new address
- `PUT /api/v1/addresses/:id` - Update address
- `DELETE /api/v1/addresses/:id` - Delete address

### Appointments
- `POST /api/v1/appointments/personal` - Book personal appointment
- `POST /api/v1/appointments/group` - Book group appointment
- `GET /api/v1/appointments` - Get user appointments
- `GET /api/v1/appointments/:id` - Get specific appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

## Development

```bash
# Start development server
npm run dev

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Open Prisma Studio
npx prisma studio
```

## License

This project is licensed under the [MIT License](LICENSE).
