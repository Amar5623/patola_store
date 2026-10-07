# Pragati Patola Art — Luxury Patola E-Commerce

Building the full experience from your brief: a heritage-led Patola saree store with catalogue, filtering, search, product pages, wishlist, cart, shipping calculator, WhatsApp consultation, checkout and order confirmation.

## Look and feel

Exactly the tokens in your brief: ivory `#F8F4EC` backgrounds, deep maroon `#3A0F18`, royal maroon buttons `#5A1824` turning crimson `#8E2332` on hover, antique gold accents `#B18A45`, charcoal text. Cormorant Garamond for display and product names, Inter for navigation, prices and forms. Generous whitespace, restrained motion, a subtle ikat-diamond pattern used only in separators, footer and empty states.

## Pages

- Home: cinematic hero, heritage introduction, featured pieces, motif explorer teaser, trust section
- Shop: 25 pieces, filters (technique, collection, colour, motif, price, availability), sort, search, quick view
- Collections: Royal Heritage, Bridal, Festive, Contemporary
- Product detail: gallery with zoom, story, specifications, add to cart, Buy via WhatsApp
- Story (Patola history, timeline, double ikat explainer, GI information), About, Journal, Contact, FAQ
- Cart, checkout, order confirmation
- Policies: shipping, returns (2-day return and replacement, unboxing video process), privacy, terms

## Commerce behaviour

- Cart and wishlist persist in the browser; cart drawer with free-shipping progress
- Shipping calculated per your rules; WhatsApp links generated with encoded order details to +91 9898716280
- Certification badges appear only where product data says so — no automatic silk/GI claims

## Payments and order records

Starts in demo mode: checkout runs a simulated payment flow with realistic states (created, processing, success, failed) behind a clean service layer, so no prototype order ever reaches a live gateway. Razorpay and the Google Sheets order log stay behind that same layer, ready to switch on once you provide credentials.

## Product photography

The brief rules out generic AI fashion imagery, and I have no real product photos. I will build the catalogue on carefully art-directed textile-detail imagery (silk weave, ikat geometry, folded saree studio shots) so the layout reads as intended, and each image is swappable per product once your photography is ready.

## Technical notes

- TanStack Start with file routes for every path listed in the brief; Tailwind tokens in `src/styles.css`; shadcn components with luxury variants
- Typed `Product` model exactly as specified, 25 records driving all catalogue UI
- `src/services/` abstractions for payments, order logging and analytics with a single `APP_MODE` switch; secrets never in client code
- Per-page titles, descriptions and social tags; keyboard-accessible drawers, dialogs and filters

## Build order

1. Design system, layout, header/footer, home page
2. Product data, shop, filters, search, quick view, product detail
3. Wishlist, cart, drawer, shipping calculator
4. Checkout, simulated payment, order confirmation, WhatsApp templates
5. Story, journal, about, contact, FAQ, policy pages
6. Accessibility, responsive and motion pass
