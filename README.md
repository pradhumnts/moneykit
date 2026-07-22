# MoneyKit

A mobile-first household money allocation and expense-tracking app for a husband and wife. Built with Next.js (App Router), JavaScript, Tailwind CSS, and shadcn/ui. All data stays in the browser via a repository-backed localStorage layer.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What it does

1. Enter newly received money
2. Split it by fixed rules (Dharma, social ideas, daily expense top-ups, family, savings)
3. Track seven category balances
4. Record expenses mainly from daily and family accounts
5. Review chronological activity
6. Adjust balances when real cash/bank amounts differ

## Architecture

- **Presentation** — pages, forms, shadcn/ui components
- **Application** — `MoneyProvider`, services, validation orchestration
- **Domain** — pure allocation/money math (integer paise)
- **Data** — async repository interface with a localStorage implementation

Money is stored as integer paise. UI never talks to localStorage directly.

## Verify allocation math

```bash
node scripts/verify-allocation.mjs
```
