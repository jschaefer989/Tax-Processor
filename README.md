# Tax Processor

A US tax return walkthrough built with React + Vite frontend and a .NET 8 Web API backend. The frontend
guides users through filing steps while the .NET backend persists progress to Postgres.

## Getting started

### Prerequisites

- .NET SDK 8.0 or later
- Node.js 18+ (for frontend)
- Postgres 12+ (or Docker)

### Frontend

```bash
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### Backend API

Set the Postgres connection string:

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/tax_processor
```

Then start the API:

```bash
cd TaxProcessor.Api
dotnet run
```

API runs on http://localhost:5000

## Useful scripts

Frontend:

```bash
npm run build
npm run preview
```

Backend:

```bash
cd TaxProcessor.Api
dotnet build
dotnet run
```
