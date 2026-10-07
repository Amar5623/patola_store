# Pragati Patola Art — Storefront

Luxury Patola saree storefront with Razorpay checkout and a Google Sheet as the order register.
There is **no database**: the catalogue is hardcoded and orders live in Razorpay and the owner's
Google Sheet. It is built for **Cloudflare Workers' free plan**, and the project stays connected to
[Lovable](https://lovable.dev).

> Client onboarding (Razorpay KYC, credentials, Google Sheet) is covered in
> **[RAZORPAY_ONBOARDING_GUIDE.md](./RAZORPAY_ONBOARDING_GUIDE.md)**.

---

## 1. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | TanStack Start (React 19, SSR, file-based routing, server functions) |
| Styling | Tailwind CSS v4 + shadcn/Radix UI |
| State | Zustand (cart, wishlist) persisted to `localStorage` |
| Forms | react-hook-form + zod (one schema shared by browser and server) |
| Payments | Razorpay Orders API + Razorpay Checkout (REST via `fetch` + Web Crypto, no Node SDK) |
| Order register | Google Sheet via a Google Apps Script web app |
| Hosting | Cloudflare Workers (free plan) via Nitro's `cloudflare-module` preset |

---

## 2. Architecture

```
                        ┌──────────────────────── Cloudflare Worker (free) ───────────────────────┐
 Browser                │                                                                        │
 ───────                │  SSR pages (src/routes/*)                                              │
 Cart (localStorage) ──▶│                                                                        │
                        │  Server functions (src/functions/checkout.functions.ts)                │
 Checkout form ────────▶│   createCheckout ── re-price from src/data/products.ts ──┐            │
                        │                                                          ▼            │
 Razorpay Checkout ◀────│◀── order_id + public key id ◀── POST /v1/orders (notes = full order) ──┼──▶ Razorpay
   modal (UPI/card)     │                                                                        │
        │ handler       │   confirmPayment ── verify HMAC signature                              │
        └──────────────▶│                  ── GET /v1/orders/:id + /v1/payments/:id ────────────┼──▶ Razorpay
                        │                  ── append row ───────────────────────────────────────┼──▶ Apps Script ─▶ Google Sheet
                        │                                                                        │
 Razorpay webhook ─────▶│  POST /api/public/razorpay-webhook (src/routes/api/public/…)           │
  (order.paid)          │   verify X-Razorpay-Signature ── append row (dedupe by Payment ID) ───┼──▶ Apps Script ─▶ Google Sheet
                        └────────────────────────────────────────────────────────────────────────┘
```

### No database: where the data lives

| Data | Where | Why |
| --- | --- | --- |
| Products and prices | `src/data/products.ts` (hardcoded) | No admin UI. A change goes through a code commit and redeploy. |
| Cart | Browser `localStorage` (`ppa-cart`) | Display only. Prices are re-synced from the catalogue on load. |
| Pending order (customer + items) | Razorpay order `notes` | Survives the shopper closing the tab. The webhook reads it back. |
| Paid orders | Google Sheet (`Orders` / `Test Orders` tabs) | The owner's register, with a ready-made WhatsApp confirmation link per row. |
| Confirmation page data | Browser `sessionStorage` (`ppa-last-order`) | Only for the thank-you page. It is cleared when the tab closes. |

### Directory map

```
src/
  data/products.ts             Hardcoded catalogue (APPEND-ONLY — see §8)
  lib/config.ts                Brand, shipping rules, cart/order limits, APP_MODE
  lib/pricing.ts               quoteCart(): single source of truth for totals (browser + server)
  lib/checkout-schema.ts       zod schemas for customer details and cart lines
  store/cart.ts                Cart store (re-syncs with catalogue, quantity limits)
  services/payments.ts         runCheckout(): demo simulation OR Razorpay flow
  services/orders.ts           OrderRecord type + sessionStorage for the confirmation page
  functions/checkout.functions.ts   createCheckout / confirmPayment server functions (RPC)
  server/                      SERVER-ONLY (import-protected from browser bundles)
    env.server.ts              Reads secrets from Cloudflare env / process.env
    razorpay.server.ts         Razorpay REST client + HMAC signature verification
    order-notes.server.ts      Encode/decode the order into Razorpay notes (15 keys × 256 chars)
    orders.server.ts           Order reference generator, paid-order recording
    sheets.server.ts           Sheet row + WhatsApp message template + Apps Script call
  routes/api/public/razorpay-webhook.ts   Webhook endpoint
  routes/checkout.tsx, routes/order.$orderId.tsx   Checkout and confirmation UI
  server.ts                    Worker entry: SSR error wrapper + security headers
  start.ts                     CSRF middleware for server functions
integrations/google-apps-script/Code.gs   Paste into the Sheet's Apps Script editor
```

---

## 3. Payment flow

1. **The shopper fills in checkout.** The form validates with `customerSchema`.
2. **`createCheckout` (server)**:
   - Validates input again.
   - Re-prices the cart from `products.ts` (the browser's prices are ignored).
   - Rejects sold-out items, quantities above 5, more than 10 lines, or totals above `MAX_ORDER_TOTAL`.
   - Compares the total with what the shopper saw. If prices changed, it returns `PRICE_CHANGED`.
   - Creates a Razorpay order with:
     - `amount` in paise;
     - `receipt` set to our reference, e.g. `PPA-261002-K7Q2M9XA`;
     - `notes` holding the whole order.
   - Returns the order id and the **public** key id. The secret never leaves the server.
3. **The browser opens Razorpay Checkout.** The shopper pays by UPI, card, netbanking or wallet.
   Failed attempts keep the modal open so they can retry.
4. **Razorpay calls `handler`** with `razorpay_order_id`, `razorpay_payment_id` and `razorpay_signature`.
5. **`confirmPayment` (server)**:
   - Verifies `HMAC_SHA256(order_id|payment_id, KEY_SECRET)` with a constant-time compare.
   - Re-fetches the order and the payment from Razorpay.
   - Checks that the payment belongs to the order, the amounts match, the currency is INR, and the status is `captured` or `authorized`.
   - Appends the row to the Sheet, then returns the order to show.
6. **Razorpay sends the `order.paid` webhook** to `/api/public/razorpay-webhook`.
   - The signature is checked against the raw body.
   - The same row is sent again. The Apps Script de-duplicates on **Payment ID**.
   - This covers shoppers who close the tab after paying, and Sheet hiccups during step 5. Razorpay retries non-2xx responses for 24 hours.
7. **The owner opens the Sheet** and clicks **"Send on WhatsApp"**. WhatsApp (web or app) opens with the personalised confirmation pre-filled.

**Demo mode** (`VITE_APP_MODE=demo`, the default and what Lovable previews use) simulates steps 2–5 in the
browser. No server call, no gateway and no sheet write, so previews can never charge anyone.

### WhatsApp confirmation template

The message is built in `buildWhatsAppConfirmation()` in `src/server/sheets.server.ts`. Edit the wording there.
It is personalised with the first name, order reference, items, total, payment ID and delivery city.
If the shopper did not tick WhatsApp consent, the link column says *"No consent — use phone/email"*.

---

## 4. Security model

| Threat | Mitigation |
| --- | --- |
| Price tampering (editing `localStorage` or the request) | The server re-prices from the hardcoded catalogue. The client-sent total is only used to detect stale carts. |
| Fake "payment success" | The order is confirmed only after HMAC signature verification **and** re-fetching the payment from Razorpay. |
| Forged webhooks | `X-Razorpay-Signature` is verified over the raw body with a separate webhook secret. Body is capped at 64 KB. |
| Secret leakage | Secrets are read only in `src/server/*` (import-protected from browser bundles). Only the public key id reaches the browser. `.env*` files are gitignored. |
| Cross-site calls to server functions | TanStack CSRF middleware (`src/start.ts`). |
| Spreadsheet formula injection (`=HYPERLINK(...)` in a name) | Apps Script stores every value as literal text (apostrophe prefix) and strips control characters. |
| Duplicate rows (checkout + webhook + retries) | `LockService` plus de-duplication on Payment ID in Apps Script. |
| Guessable order IDs | Order references use `crypto.getRandomValues` (8 chars from a 32-char alphabet). |
| PII left on shared devices | Long-term order history is no longer kept in `localStorage`. Only the latest order is held in tab-scoped `sessionStorage`. |
| Clickjacking / MIME sniffing | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and HSTS set in `src/server.ts`. |
| Card data | It never touches our code. Razorpay Checkout collects it (PCI-DSS is handled by Razorpay). |

Hardening you can add for free in the Cloudflare dashboard:
- **Bot Fight Mode.**
- **A rate-limiting rule.** The free plan includes one. For example, 20 requests per minute per IP on `/_serverFn/*`.
- **"Always use HTTPS".**

---

## 5. Environment and secrets

| Variable | Where it is used | Secret? | Test value | Production value |
| --- | --- | --- | --- | --- |
| `VITE_APP_MODE` | **Build time**, browser | No | `production` (to exercise Razorpay test mode) | `production` |
| `VITE_INSTAGRAM_URL`, `VITE_FACEBOOK_URL` | Build time | No | — | Client's profile URLs |
| `RAZORPAY_KEY_ID` | Server runtime | No (public), but keep it with the secrets | `rzp_test_…` | `rzp_live_…` |
| `RAZORPAY_KEY_SECRET` | Server runtime | **Yes** | Test key secret | Live key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Server runtime | **Yes** | Secret you set on the **test-mode** webhook | Secret you set on the **live-mode** webhook |
| `GOOGLE_SCRIPT_URL` | Server runtime | Treat as secret | Apps Script `/exec` URL | Same URL (live rows go to the `Orders` tab) |
| `GOOGLE_SCRIPT_SECRET` | Server runtime | **Yes** | Must equal the `ORDER_SECRET` Script Property | Same |

Test vs live is decided **only** by the key prefix. `rzp_test_` rows go to the **Test Orders** tab and
`rzp_live_` rows go to **Orders**. The checkout and confirmation pages tell shoppers when test mode is active.

**Rules:**
- `VITE_*` values are baked into the browser bundle **at build time**. Never put a secret in a `VITE_` variable.
- On Cloudflare, store every server value as an **encrypted secret** (`wrangler secret put`). Secrets survive redeploys; the build also sets `keep_vars: true`.
- Generate random secrets with `openssl rand -hex 32`.
- `.env.local` is also read by `npm run build`. Delete it or set `VITE_APP_MODE=demo` before building a preview.

### 5a. Local development (demo mode)

```sh
npm install
npm run dev            # http://localhost:8080 — demo checkout, no keys needed
```

### 5b. Local development with Razorpay test mode

```sh
cp .env.example .env.local
# Edit .env.local:
#   VITE_APP_MODE=production
#   RAZORPAY_KEY_ID=rzp_test_…  RAZORPAY_KEY_SECRET=…
#   GOOGLE_SCRIPT_URL / GOOGLE_SCRIPT_SECRET (optional — without them orders only log to the console)
npm run dev
```

Pay with Razorpay's test instruments:
- **UPI:** `success@razorpay` succeeds and `failure@razorpay` fails.
- **Card:** use a test card from the [Razorpay test cards docs](https://razorpay.com/docs/payments/payments/test-card-details/), any future expiry, any CVV, and any OTP on the mock bank page.

Webhooks can't reach `localhost`. To test them, deploy to your `*.workers.dev` URL (free) and point the
test-mode webhook there. You can also use the **"Test webhook"** button in the Razorpay dashboard.

To test the actual Worker build locally, copy `.env.example` to `.dev.vars` and run `npm run preview:worker`.

### 5c. Production (Cloudflare Workers)

One-time setup:
```sh
npx wrangler@4 login                                   # opens browser; use the client's or your Cloudflare account
npx wrangler@4 secret put RAZORPAY_KEY_ID              # paste rzp_test_… first, rzp_live_… at go-live
npx wrangler@4 secret put RAZORPAY_KEY_SECRET
npx wrangler@4 secret put RAZORPAY_WEBHOOK_SECRET
npx wrangler@4 secret put GOOGLE_SCRIPT_URL
npx wrangler@4 secret put GOOGLE_SCRIPT_SECRET
```

Every deploy:
```sh
VITE_APP_MODE=production npm run deploy                # build + wrangler deploy
```

The first deploy may say the Worker doesn't exist yet when you run `secret put`. If so, deploy once first, then add the secrets.

**Git-connected deploys (optional, free):**
1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository**.
2. Pick the GitHub repo.
3. Set the build command to `npm run build` and the deploy command to `npx wrangler deploy`.
4. Add `VITE_APP_MODE=production` under **Build variables**.
5. Add the server secrets under **Settings → Variables and Secrets**. Choose the "Secret" type.

Every push to the connected branch then redeploys.

**Custom domain:**
1. Buy the domain. Cloudflare Registrar sells at cost, or move an existing domain's nameservers to Cloudflare.
2. In **Worker → Settings → Domains & Routes → Add → Custom domain**, enter the domain.
3. SSL is issued automatically for free. The `*.workers.dev` URL is already HTTPS.
4. After the domain is live, update the webhook URL in Razorpay (test and live).

### 5d. Switching from test to live

1. Razorpay account activated (KYC approved). See the onboarding guide.
2. In **Live mode**, go to **Account & Settings → API Keys → Generate Key**. Store the secret immediately; it is shown once.
3. Still in **Live mode**, open **Webhooks → Add**:
   - URL: `https://<domain>/api/public/razorpay-webhook`
   - Event: `order.paid`
   - A **new** secret
4. Run `wrangler secret put` for `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` with the live values. Secrets apply immediately, with no redeploy needed.
5. Place one real low-value order (e.g. temporarily list a ₹1 test product, or use a real piece and refund it). Then check:
   - the Sheet has a row in **Orders**;
   - the Razorpay dashboard shows the payment as **captured**;
   - the WhatsApp link works.
6. Refund the test payment from the dashboard.

---

## 6. Google Sheet setup (the order register)

1. Sign in to the **client's** Google account and create a Sheet named "Pragati Patola Art — Orders".
2. Open **Extensions → Apps Script**. Replace `Code.gs` with `integrations/google-apps-script/Code.gs` and save.
3. Open **Project Settings (gear) → Script Properties → Add**. Set `ORDER_SECRET` to a value from `openssl rand -hex 32`.
4. Select `testWrite` in the toolbar and click **Run**. Authorise the script.
   - A **Test Orders** tab should appear with one row.
   - The `=HYPERLINK…` name must show as plain text. That confirms injection protection.
5. Go to **Deploy → New deployment → Web app**, with:
   - Execute as **Me**
   - Who has access **Anyone**

   Then copy the `/exec` URL into `GOOGLE_SCRIPT_URL`, and the `ORDER_SECRET` value into `GOOGLE_SCRIPT_SECRET`.
6. After any later edit to the script, use **Deploy → Manage deployments → Edit → New version**. This keeps the same URL.

"Anyone" access is required because the Worker has no Google login. Every request without the
correct secret is rejected. Share the Sheet itself only with the owner and staff.

Columns are created automatically:
- Order Date (IST), Order Ref, Payment Status, Payment ID, Razorpay Order ID, Payment Method, Mode
- Customer Name, Email, Phone, WhatsApp, WhatsApp Consent
- Address, Apartment, City, State, Postal Code, Country
- Items, Item Count, Subtotal (INR), Shipping (INR), Discount (INR), Total Paid (INR)
- WhatsApp Message, WhatsApp Link, Fulfilment Status, Recorded Via

The owner can update **Fulfilment Status** (New → Packed → Shipped → Delivered).

---

## 7. Razorpay dashboard settings to check

- **Payment capture:** go to **Account & Settings → Payment capture** and set it to **Automatic**. Without this, payments stay `authorized` and are auto-refunded after a few days.
- **Webhook:** event `order.paid` only, with alert email set to the owner. Configure it separately in Test and Live mode.
- **Transaction limit:** set `MAX_ORDER_TOTAL` in `src/lib/config.ts`. It is ₹5,00,000 by default. Keep it at or below the per-transaction limit Razorpay grants the account.
- **UPI:** banks usually cap UPI at ₹1,00,000 per transaction. The checkout tells shoppers to use a card or netbanking above that.
- **International cards:** these need separate activation by Razorpay if NRI customers are expected.

---

## 8. Managing the catalogue (no admin panel)

Products live in `src/data/products.ts`. To change one, edit the file, commit and deploy. Lovable prompts work too.

- **Add a product:** append a new seed at the **end** of `SEEDS`.
  - `id` and `sku` are derived from the position, and past orders and Sheet rows reference the SKU.
  - **Never reorder or delete seeds.**
- **Sell out a piece:** set `availability: "sold_out"`. It shows as "Reserved", can't be added to the cart, and the server rejects it.
- **Change a price:** edit `price` and deploy. Open carts update automatically. A shopper mid-checkout gets "prices updated" instead of being charged the old price.
- **Shipping rules and limits:** edit `src/lib/config.ts`.

There is no stock count. Two people could buy the last piece at the same moment. That's rare at this
traffic level, and the owner refunds the second order from the Razorpay dashboard. Mark the piece `sold_out` straight after a sale.

---

## 9. Free-tier limits (Cloudflare Workers Free)

| Limit | Value | What it means here |
| --- | --- | --- |
| Requests | 100,000 / day | Static assets (images, JS, CSS) are free and don't count. Plenty for a boutique store. |
| CPU time | 10 ms / request | Most pages fit. If **Workers → Observability** shows "Exceeded CPU" errors on SSR pages, upgrade to Workers Paid ($5/month). The code doesn't change. |
| Commercial use | Allowed | Unlike Vercel Hobby, which is for non-commercial use only. |
| Apps Script | ~20k URL calls/day, 30 simultaneous | Far above the order volume. |

---

## 10. Troubleshooting

| Symptom | Check |
| --- | --- |
| "We could not reach the payment gateway" | Worker logs show `Missing server environment variable …` or `Razorpay … failed: BAD_REQUEST_ERROR Authentication failed` (wrong key pair, or mixing test and live). |
| Payment succeeded but no Sheet row | 1. Worker logs for `[checkout.sheet]`. 2. **Apps Script → Executions**. 3. `GOOGLE_SCRIPT_SECRET` must equal `ORDER_SECRET`. 4. The deployment must be "Anyone". The webhook retries automatically for 24h. |
| Webhook shows failures in Razorpay | 401 means the webhook secret differs between Razorpay and Cloudflare. 503 means secrets are missing. 500 means the Sheet write failed (it will retry). |
| Checkout says demo mode in production | The build ran without `VITE_APP_MODE=production`. It's a build-time variable, so rebuild. |
| Razorpay modal doesn't open | Ad blockers can block `checkout.razorpay.com`. The page shows a message asking to disable them. |

---

## 11. Lovable

- The project syncs with Lovable. Don't force-push or rewrite pushed history.
- Lovable previews run in **demo mode**. Real payments only happen in your Cloudflare deployment with `VITE_APP_MODE=production`.
- Inside Lovable's sandbox, its own Cloudflare build settings override the `nitro` block in `vite.config.ts`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build (`.output/` + generated wrangler config) |
| `npm run preview:worker` | Build, then run the real Worker locally (reads `.dev.vars`) |
| `npm run deploy` | Build, then deploy to Cloudflare Workers |
| `npm run typecheck` / `npm run lint` | Static checks |
