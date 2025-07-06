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
