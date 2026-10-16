# Wallet Task

Wallet module with deposit, transfer, transaction history and summary APIs.

Built with Node.js, Express, TypeScript, TypeORM and MySQL.

Live URL: <add deployed url here>

## Setup

```bash
npm install
cp .env.example .env
```

Add your MySQL details in `.env`, create the database and run migrations:

```sql
CREATE DATABASE wallet_task;
```

```bash
npm run migration:run
npm run dev
```

Server runs on http://localhost:5555

For production:

```bash
npm run build
npm run migration:run:prod
npm start
```

## APIs

Register or login first. Use the token as `Authorization: Bearer <token>` for wallet APIs.

```
POST /auth/register
POST /auth/login
GET  /auth/me

POST /wallet
POST /wallet/deposit
POST /wallet/transfer
GET  /wallet/balance
GET  /wallet/transactions?page=1&limit=10&type=CREDIT&fromDate=2026-10-01&toDate=2026-10-31
GET  /wallet/summary
```

`type` can be CREDIT, DEBIT or TRANSFER.

Postman collection is in `postman/wallet-task.postman_collection.json`. Login and register save the token automatically.

## Notes

- One user can have only one active wallet. This is handled with a unique index on a generated column (`active_user_id`) in the wallets table.
- Transfer runs inside a DB transaction. Both wallets are locked with `SELECT ... FOR UPDATE` (ordered by id to avoid deadlocks), so parallel requests can't make the balance negative. If anything fails, everything is rolled back.
- Deposit and transfer need a `referenceId`. Sending the same request again returns the old result with 200 instead of creating a new entry. Using the same referenceId with different data returns 409.
- Transfer creates two rows in `wallet_transactions`: DEBIT for sender and CREDIT for receiver, with the same referenceId.
- Amounts are stored as DECIMAL(18,2) and calculated in paise to avoid float issues.
