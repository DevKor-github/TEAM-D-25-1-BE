# Groo

## Prerequisites

- Node.js (>= 22)
- PostgreSQL
- pnpm
- [AutoEnv](https://github.com/hyperupcall/autoenv) (Highly recommend)

## Setup

1. Clone the repository
2. Install dependencies

```bash
pnpm install
```

3. Create `.env` file, following `.env.example`
4. Run following commands to initialize the database schema to your local database

```bash
npx prisma generate
npx prisma db push
```

5. Run following command to start the development server.

```bash
pnpm start:dev
```
