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
export RECAPTCHA_SECRET_KEY=your_google_recaptcha_secret
export FRONTEND_BASE_URL=http://localhost:5173
export SMTP_HOST=smtp.example.com
export SMTP_PORT=587
export SMTP_ENABLE_SSL=true
export SMTP_USERNAME=your_smtp_username
export SMTP_PASSWORD=your_smtp_password
export SMTP_FROM_EMAIL=no-reply@example.com
```

Then start the API:

```bash
cd TaxProcessor.Api
dotnet run
```

API runs on http://localhost:5000

### Frontend auth captcha key

Create a `.env` in the frontend root and set:

```bash
VITE_RECAPTCHA_SITE_KEY=your_google_recaptcha_site_key
```

The app now requires login before tax pages load. Accounts can be created with email/password, and
forgot-password sends an email reset link.

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
