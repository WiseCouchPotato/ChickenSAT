# ChickenSAT 🐣

A chicken-themed SAT Math practice website with a React/Vite frontend and an Express API. Users create an account, verify their email, and get private practice history, accuracy, streaks, XP, and chick customization.

## Requirements

- Node.js 22.9+ (Node 20+ recommended for the frontend; Node 22.9+ is needed to load `.env` automatically)
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open the Vite URL printed in the terminal (usually `http://localhost:5173`). The API runs at `http://localhost:4000`. Without email configured, the six-digit verification code is printed in the API terminal. Set up Gmail SMTP below to deliver verification messages to real inboxes.

## Email setup

### Gmail SMTP

1. Turn on 2-Step Verification for the Gmail account you want to send mail from.
2. Create an [App Password in your Google Account](https://myaccount.google.com/apppasswords). Google only shows it when App Passwords are available for the account.
3. Copy `.env.example` to `.env`. Set `SMTP_USER` to that Gmail address and `SMTP_PASS` to the App Password (not your regular Google password). If Google displays spaces in the App Password, omit them.
4. Set `FROM_EMAIL` to the same Gmail address, for example `ChickenSAT <yourname@gmail.com>`. Leave the SMTP host, port, and secure settings at the Gmail defaults shown in `.env.example`.
5. Set `AUTH_SECRET` to a long random secret (at least 32 random bytes), save `.env`, and restart `npm.cmd run dev`.

The `.env` file contains credentials. Keep it private and do not commit it or paste the App Password into chat. Gmail account security settings and sending limits apply.

### Resend (alternative)

Instead of SMTP, you can send through [Resend](https://resend.com/). Configure:

- `RESEND_API_KEY` to an API key from Resend.
- `FROM_EMAIL` to a sender address verified for your Resend account.

When SMTP credentials are set, the app uses SMTP; otherwise it uses Resend if configured. With neither provider configured, the app prints verification codes to the server terminal only while running outside production. Production startup requires `AUTH_SECRET` and a configured email provider.

## Production build

```powershell
npm run build
npm start
```

Then open `http://localhost:4000`.

## What works

- Email/password signup with a six-digit, expiring email verification code.
- Repeating signup with an unverified email sends a fresh code; requests are limited to one email every 60 seconds.
- Sign-in automatically offers a fresh verification code for accounts that have not verified their email.
- Password reset by expiring, one-time email code; successful reset invalidates existing sessions.
- Password visibility toggle on password fields.
- Secure password hashing, rate-limited auth endpoints, and HTTP-only session cookies.
- Sign-in and sign-out; verified users only can view and update their profile.
- Twenty practice questions (five per domain) across Algebra, Advanced Math, Problem-Solving & Data Analysis, and Geometry & Trigonometry.
- Question Bank has four solid-color SAT Math domain cards, focused domain navigation, and grouped topic lists; topics open related questions from the current sample bank.
- Account-specific bookmarks and missed-question review; notes use editable cards, custom folders, Markdown formatting, and up to five PNG/JPEG/WebP images (1 MB each).
- Responsive slide-out navigation, a Home dashboard with a daily question and adjustable XP goal, a logo-opened full-screen landing page, and a pricing preview.
- Interactive Desmos calculator that opens as a draggable, resizable popup and can dock beside a question.
- Server-checked answers and account-specific saved attempts, accuracy, daily totals, streaks, and XP.
- Saved avatar customization with XP-unlocked shirt colors, patterns, and decals.

The app uses a local JSON file for persistence. It is suitable for development and an early prototype, not a production multi-instance deployment. Before launch, migrate user/session data to a managed database, configure HTTPS and email delivery, and add backups and monitoring. Estimated SAT scores, payments, and full-length tests are intentionally not presented as functional features.
