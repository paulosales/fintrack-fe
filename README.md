# Fintrack FE

Frontend app for the Fintrack account-service transaction API.

## Setup

```bash
cd fintrack-fe
npm install
```

## Run

```bash
npm run dev
```

Open http://localhost:5173.

## API

- Fetch transactions: `GET /api/transactions`
- Fetch transactions by account: `GET /api/transactions?account_id=123`

> The proxy in `vite.config.ts` forwards `/api` to `http://localhost:3000`.

## Test

```bash
npm run test
```
