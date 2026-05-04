# Link Shortener API

A URL shortener service built with Node.js, Express, TypeScript, Supabase, and Redis.

## Features

- Shorten URLs with optional expiration dates
- Fast redirection using Redis caching
- Click tracking and analytics
- IP and rate limiting

## Tech Stack

- Node.js
- Express
- TypeScript
- Supabase (PostgreSQL)
- Upstash Redis

## Setup

1. Clone the repository
2. Install dependencies using npm install
3. Configure environment variables in .env:
   - PORT
   - BASE_URL
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
   - FALLBACK_URL
4. Run development server: npm run dev
5. Build for production: npm run build
6. Start production server: npm start
