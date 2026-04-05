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

> The proxy in `vite.config.ts` forwards `/api` to `http://localhost:3001`.

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

## Linting

This project uses [ESLint](https://eslint.org/) to maintain code quality and identify potential issues.

### Run Linter

Check for linting issues:

```bash
npm run lint
```

### Fix Linting Issues

Automatically fix issues that ESLint can resolve:

```bash
npm run lint:fix
```

### ESLint Configuration

ESLint is configured with:
- Recommended rules for JavaScript
- TypeScript support via @typescript-eslint
- React best practices
- React hooks validation

See [eslint.config.js](eslint.config.js) for the full configuration.
