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

## Code Formatting

This project uses [Prettier](https://prettier.io/) for automatic code formatting.

### Format Code

Format all files in the project:

```bash
npm run format
```

### Check Formatting

Check if files are properly formatted without making changes:

```bash
npm run format:check
```

### Prettier Configuration

Prettier is configured with:
- 2-space indentation
- 100 character line width
- Single quotes for JS/TS
- Double quotes for JSX attributes
- Trailing commas (ES5 compatible)
- Semicolons enabled

See [.prettierrc](.prettierrc) for the full configuration.
