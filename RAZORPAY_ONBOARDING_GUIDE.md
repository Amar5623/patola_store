# Razorpay Onboarding Guide — Pragati Patola Art

*Meeting reference for the developer and the store owner. Prepared 2 October 2026.*

> **Verify before the meeting:** Razorpay changes its forms, fees and limits from time to time. Check the
> figures marked ⚠︎ against [razorpay.com/pricing](https://razorpay.com/pricing) and the live sign-up
> form on the day.

---

## 1. Meeting goals (30–45 min)

1. Explain how payments and orders will work (2 min, §2).
2. Start the client's Razorpay sign-up **with the client at the keyboard**. The account, KYC and bank are theirs.
3. Add the developer as a **team member** so keys and webhooks can be set up without sharing the owner's password or OTP.
4. Collect the decisions in §8.
5. Create the Google Sheet in the **client's** Google account (§6).

---

## 2. How it works, in plain words (for the client)

- Customers pay on the website through **Razorpay**: UPI, cards, netbanking or wallets.
- The money goes to the **client's bank account** directly from Razorpay, usually 2 working days later (T+2) ⚠︎.
  The developer never touches the money.
- Every paid order appears automatically as a new row in the client's **Google Sheet**. The row has the
  customer's details, the items, the payment ID and a **"Send on WhatsApp"** link. One click opens WhatsApp
  with a ready, personalised order confirmation.
- No monthly server bill: the site runs on Cloudflare's free plan. The only running costs are
  **Razorpay's per-transaction fee** and the **domain (~₹800–1,200/year)**.

---

## 3. What the client must bring (KYC checklist)

Razorpay's form adapts to the business type. Have scans or photos (PDF/JPG) ready for **all** that apply:

| # | Document | Notes |
| --- | --- | --- |
| 1 | **Business type decided** | Individual / Sole proprietorship / Partnership / Pvt Ltd / LLP. Most small family businesses are a *sole proprietorship*. |
| 2 | **PAN** | Proprietorship: the proprietor's personal PAN. Partnership or company: the business PAN *and* the signatory's PAN. |
| 3 | **Aadhaar** of the authorised signatory | eKYC through DigiLocker/OTP. The mobile number must be linked to Aadhaar. |
| 4 | **GSTIN certificate** | Strongly recommended, and expected for an online store selling goods. If not registered, discuss with their CA *before* the meeting. |
| 5 | **Business proof** (proprietorship: usually any one or two) | GST certificate, **Udyam (MSME)** registration, Shop & Establishment licence, or trade licence. |
| 6 | **Bank account for settlements** | Current account in the business name is preferred. A proprietor's savings account is often accepted. Bring a **cancelled cheque** or recent bank statement showing the name, account number and IFSC. |
| 7 | **Business address proof** | Matches the address on the website: Rashvi Residency, Rajkot Bypass Road, Wadhwan. |
| 8 | **Partnership deed / COI + MoA + Board resolution** | Only for partnerships or companies. |
| 9 | **Business email + mobile** | Used for the Razorpay login and alerts. Use the business one (e.g. care@pragatipatolaart.com), **not** the developer's. |

**Business details the form asks for:**
- Business category: **E-commerce → Fashion & Lifestyle / Apparel** (closest match).
- Description: e.g. *"Handwoven Patan Patola silk sarees sold online across India."*
- Expected monthly volume and average ticket size: ~₹1–3 lakh per order. Be honest; it affects risk review and limits.
- Website URL: see §4.

---

## 4. Website requirements for activation

Razorpay manually reviews the website. It must be **live, on the client's own domain** (preferred over a
`workers.dev` link), match the business name, and show:

| Requirement | Status in this project |
| --- | --- |
| Products with prices in INR | ✅ `/shop`, `/product/…` |
| Contact page with address, phone and email | ✅ `/contact` |
| Terms & Conditions | ✅ `/policies/terms` |
| Privacy Policy | ✅ `/policies/privacy` (mentions Razorpay and the order register) |
| Refund & Cancellation policy | ✅ `/policies/returns`: 2-day damage window, cancel before dispatch, refund in 5–7 working days. **Client must confirm these terms.** |
| Shipping / delivery policy | ✅ `/policies/shipping` |
| About page | ✅ `/about`, `/story` |
| Working checkout | Deploy with `VITE_APP_MODE=production` and **test keys** during review, so reviewers see a real Razorpay checkout and not a "demo mode" banner. |

**Action:** buy the domain *before* submitting KYC, connect it to Cloudflare, deploy, then submit.

---

## 5. Step-by-step sign-up (do this live in the meeting)

1. Go to **https://dashboard.razorpay.com/signup**. Sign up with the client's **business email and mobile**.
2. Choose **Payment Gateway**. Fill in the business type, category and website.
3. **Test mode is available immediately**, with no KYC. The developer can build and test while KYC is reviewed.
4. **Complete the activation form:**
   - Contact info
   - Business details
   - Business overview
   - Website
   - Bank account
   - Upload the documents from §3
   - Aadhaar eKYC
   - Submit
5. **Add the developer as a team member.** Go to **Account & Settings → Team / Manage Team → Invite member**,
   enter the developer's email, and choose the role **Developer** ⚠︎ (or Admin if Developer can't manage webhooks).
   The developer then uses their own login. **Never share the owner's password or OTPs.**
6. **Settings to switch on** (developer, after invite):
   - **Payment capture → Automatic.** Payments must not stay "authorized".
   - **Webhooks** (Test mode first): URL `https://<domain>/api/public/razorpay-webhook`, event **`order.paid`**, a strong secret, and alert email set to the owner.
   - Check **payment methods** enabled: UPI, cards, netbanking, wallets.
   - Optional: request **international cards** for NRI customers. This is a separate approval.
7. **Wait for activation.** Typically a few working days ⚠︎. Razorpay may email clarification requests;
   the client should reply promptly.
8. **After activation:** switch the dashboard to **Live mode**, generate live keys, add the live webhook,
   and do the go-live test (§7).

---

## 6. Google Sheet (order register): set up in the client's account

1. Create the sheet in the client's Google account, e.g. "Pragati Patola Art — Orders".
2. Go to **Extensions → Apps Script**. Paste `integrations/google-apps-script/Code.gs`.
3. Go to **Project Settings → Script Properties**. Add `ORDER_SECRET` with a random value (`openssl rand -hex 32`).
4. Run `testWrite` once and authorise it. A **Test Orders** tab appears.
5. Go to **Deploy → Web app**, with:
   - Execute as **Me**
   - Access **Anyone**

   Copy the `/exec` URL.
6. Share the Sheet only with the owner and staff. Never make the Sheet public.

The developer needs the `/exec` URL and the `ORDER_SECRET` value (see §7).

---

## 7. Credentials the developer needs

Send credentials through a secure channel: Bitwarden/1Password share, or in person. **Never** by plain
email or WhatsApp. The key secret is shown **only once** when generated.

### For testing (available on day 1, no KYC needed)

| Item | Where it comes from | Example format |
| --- | --- | --- |
| Test **Key ID** | Dashboard (Test mode) → Account & Settings → API Keys → Generate | `rzp_test_XXXXXXXXXXXXXX` |
| Test **Key Secret** | Same screen, shown once | 24-character string |
| Test **Webhook Secret** | **Developer invents it** when adding the test webhook | random 64-hex string |
| Google Apps Script URL + `ORDER_SECRET` | §6 | `https://script.google.com/macros/s/…/exec` |

### For production (after KYC activation)

| Item | Where it comes from | Example format |
| --- | --- | --- |
| Live **Key ID** | Dashboard (**Live** mode) → API Keys → Generate | `rzp_live_XXXXXXXXXXXXXX` |
| Live **Key Secret** | Same, shown once | 24-character string |
| Live **Webhook Secret** | Developer invents it when adding the **live** webhook (a different value from test) | random 64-hex string |
| Settlement bank confirmed | Dashboard → Settlements | — |
| Per-transaction limit granted | Dashboard / Razorpay support | e.g. ₹5,00,000. The developer sets `MAX_ORDER_TOTAL` to match. |

**Not needed:** the owner's Razorpay password, OTPs, bank login or card details.

### Where they go

- All server values go in **Cloudflare secrets** (`wrangler secret put …`). See README §5.
- Test keys are used until activation. Go-live means replacing three secrets with live values. **No code change.**

**Go-live test:**
1. Place one real low-value order.
2. Confirm the row appears in the **Orders** tab and the payment shows **captured** in Razorpay.
3. Refund it from the dashboard.

---

## 8. Decisions to get from the client in the meeting

1. **Business type, and whether they have GSTIN.** This drives the document list.
2. **Settlement bank account.**
3. **Domain name** to buy, and who owns the Cloudflare account. **Recommendation:** the client's email owns both; the developer gets member access.
4. **Refund, cancellation and shipping terms.** Confirm the current wording on `/policies/*`.
5. **Maximum online order value.** ₹5 lakh by default. Above that, sales are handled through the WhatsApp concierge.
6. **WhatsApp message wording** for order confirmations. A default is provided; tweak as they like.
7. **International customers (NRI)?** If yes, request international card payments.
8. **Who receives** webhook failure alerts and Razorpay emails.

---

## 9. Costs to set expectations ⚠︎

| Item | Typical cost |
| --- | --- |
| Razorpay setup / annual fee | ₹0 on the Standard plan |
| Domestic cards, netbanking, wallets, UPI | ~2% per transaction + 18% GST on the fee |
| Amex, Diners, international cards, EMI | ~3% + GST |
| Example: ₹2,00,000 saree | ~₹4,000 fee + ₹720 GST ≈ **₹4,720** |
| Hosting (Cloudflare Workers free) | ₹0. Upgrade is $5/month only if traffic or CPU limits are hit. |
| Domain | ~₹800–1,200 / year |
| Google Sheet / Apps Script | ₹0 |

**Tip:** for high-ticket stores, ask Razorpay sales for **custom (lower) pricing** once volume builds.

---

## 10. Answers to questions the client may ask

- **"Can customers pay ₹2 lakh by UPI?"** Usually no. Most banks cap UPI around ₹1 lakh per transaction.
  Checkout tells customers to use a card or netbanking for higher amounts. Card payments depend on the
  customer's card limit.
- **"When do I get the money?"** Settlement is T+2 working days by default ⚠︎. Instant settlements are a paid add-on.
- **"What if the customer pays but closes the browser?"** The order is still recorded. Razorpay notifies our
  server (webhook) and the row appears in the Sheet.
- **"How do I refund?"** Razorpay Dashboard → Payments → open the payment → **Refund** (full or partial).
  Normal refunds reach the customer in 5–7 working days.
- **"How do I add or change products and prices?"** There is no admin panel, by design and to keep costs at zero.
  Send the changes to the developer; a deploy takes minutes. Mark sold pieces as "Reserved" straight away.
- **"Is customer card data safe?"** Card, UPI and bank details are entered on Razorpay's PCI-DSS certified
  window and never reach the website.
- **"What about chargebacks or disputes?"** Razorpay emails the owner. Respond with proof of delivery and
  the unboxing-video policy. Keep shipping receipts and tracking for every order.

---

## 11. Developer checklist after the meeting

- [ ] Accept the Razorpay team invite. Set **Payment capture → Automatic**.
- [ ] Generate **test** keys. Add the **test** webhook (`order.paid`) with a new secret.
- [ ] Set up the Apps Script in the client's Sheet and get the `/exec` URL + `ORDER_SECRET`.
- [ ] Buy/connect the domain on Cloudflare. Deploy with `VITE_APP_MODE=production` and test keys.
- [ ] `wrangler secret put` all five server values.
- [ ] Test payments, using the test instruments in README §5b:
  - [ ] UPI `success@razorpay`
  - [ ] UPI `failure@razorpay`
  - [ ] Card
  - [ ] Close the tab after paying, and confirm the webhook still creates the row
- [ ] Check the rows in **Test Orders** and the WhatsApp link.
- [ ] Client submits KYC with the live domain.
- [ ] After activation: live keys + live webhook, swap secrets, run the go-live test, then refund it.
- [ ] Set `MAX_ORDER_TOTAL` to the granted per-transaction limit.
