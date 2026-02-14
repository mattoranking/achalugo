# Achalugo 💘

A mischievous Valentine's Day prank app — send your valentine a link they **can't** refuse.

The recipient sees a "Will you be my Valentine?" prompt with **Yes** and **No** buttons. The catch? The **No button runs away** every time they try to click it, cycling through hilarious Nigerian/Igbo-flavoured taunts. When they inevitably click **Yes**, confetti explodes and their favourite song plays.

**Live at [achalugo.page](https://achalugo.page)**

---

## How It Works

1. **Sender** enters their name, their valentine's name, and an optional YouTube link
2. A unique shareable link is generated (e.g. `achalugo.page/l/abc12xyz`)
3. **Recipient** opens the link and sees the valentine prompt
4. The "No" button dodges their cursor with escalating messages like:
   - *"Catch me if you can! 😜"*
   - *"Why are you running? 😂"*
   - *"You no dey tire? 😩"*
   - *"Say Yes Nah, Achalugo 💕"*
   - *"Una go tire! 😂"*
   - *"JUST CLICK YES! 😤"*
5. They click **Yes** → confetti celebration + YouTube song autoplay 🎉

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Hosting | [Cloudflare Pages](https://pages.cloudflare.com/) (free tier) |
| Backend | [Cloudflare Workers](https://workers.cloudflare.com/) (Pages Functions, TypeScript) |
| Database | [Cloudflare KV](https://developers.cloudflare.com/kv/) (key-value store) |
| Anti-bot | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| Frontend | Vanilla HTML, CSS, JavaScript — no frameworks, no build step |

---

## Project Structure

```
achalugo/
├── public/                  # Static frontend (served by Pages)
│   ├── index.html           # Landing page — create a valentine link
│   ├── valentine.html       # Recipient page — the prank interaction
│   ├── success.html         # Post-creation page with share buttons
│   ├── closed.html          # Waitlist page when limit is reached
│   ├── css/style.css        # Pink Valentine theme, mobile-first
│   └── js/
│       ├── config.js        # Turnstile site key
│       ├── create.js        # Form submission + flash messages
│       ├── valentine.js     # Runaway No button + Yes handler
│       ├── confetti.js      # Canvas confetti animation
│       ├── success.js       # Share links + copy button
│       └── waitlist.js      # Waitlist form handler
├── functions/               # Cloudflare Pages Functions (API)
│   ├── api/
│   │   ├── create.ts        # POST /api/create — generate a link
│   │   ├── accept/[id].ts   # POST /api/accept/:id — mark as accepted
│   │   ├── link/[id].ts     # GET /api/link/:id — fetch link data
│   │   ├── remaining.ts     # GET /api/remaining — personal usage info
│   │   └── waitlist.ts      # POST /api/waitlist — join waitlist
│   ├── l/[id].ts            # Serves valentine.html for /l/:id routes
│   └── utils/
│       ├── config.ts        # Centralised constants (limits, windows)
│       ├── helpers.ts       # ID generation, JSON response helpers
│       ├── ratelimit.ts     # IP-based rate limiting via KV
│       └── turnstile.ts     # Server-side Turnstile verification
├── types/env.d.ts           # TypeScript type definitions
├── wrangler.toml            # Cloudflare configuration
└── package.json
```

---

## Guardrails

- **Rate limit:** 2 links per IP per 24 hours
- **Global limit:** 500 total links (optimised for KV free tier)
- **Turnstile:** Anti-bot verification on all form submissions
- **YouTube validation:** Only accepts valid youtube.com / youtu.be URLs
- **Input limits:** Names capped at 50 chars, URLs at 200 chars

---

## Local Development

```bash
# Install dependencies
npm install

# Create .dev.vars with your Turnstile secret
echo "TURNSTILE_SECRET=your_secret_here" > .dev.vars

# Start local dev server (port 8788)
npm run dev
```

Visit `http://localhost:8788`

---

## Deployment

```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy public/ --project-name achalugo --branch main

# Set production Turnstile secret (first time only)
npx wrangler pages secret put TURNSTILE_SECRET --project-name achalugo
```

Don't forget to add your production domain to the Turnstile widget's allowed hostnames in the Cloudflare dashboard.

---

## Configuration

All tuneable constants live in [`functions/utils/config.ts`](functions/utils/config.ts):

```typescript
export const MAX_LINKS = 500;              // Global link cap
export const MAX_REQUESTS = 2;             // Links per IP per window
export const RATE_LIMIT_WINDOW_MS = 86400000; // 24 hours
```

---

## Name

**Achalugo** (Igbo: *Achàlùgọ̀*) — a beautiful Igbo name meaning "the world's wealth" or "gift of the land." Because love is the greatest gift. 💕

---

Made with 💖 for Valentine's Day 2026