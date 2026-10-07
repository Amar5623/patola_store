# Pragati Patola Art storefront completion

## Goal
Finish the existing luxury Patola storefront so it matches the requested brand, shopping flow, policies, and demo integrations without replacing the work already present.

## Changes
- Align the shared header with **Home, Story, Catalog, Return Policy**, plus search and bag access on desktop and mobile.
- Update the home banner to **“900 Years of Royal Double-Ikat Masterpieces”** with **Explore Collection** and **Consult on WhatsApp** actions.
- Preserve the 25-piece catalogue and add prominent filters for **Double Ikat, Single Ikat, Silk Mark, and Festive** alongside the detailed filters already available.
- Complete product cards and quick view with price, motif context, add-to-bag, and direct WhatsApp purchasing.
- Refine the slide-out bag with subtotal, free-shipping progress, and an explicit **Checkout via Razorpay** action.
- Update the return policy to require same-day photos and an unedited unboxing video for damaged or defective pieces within the two-day window.
- Update the footer with the supplied phone, address, Instagram, Facebook, WhatsApp, and GI Tag / Silk Mark trust messaging.
- Make the demo checkout visibly behave like a Razorpay popup while ensuring no money is charged; keep the Google Sheets order-logging integration as a clearly isolated production placeholder.
- Retain and verify keyboard support and responsive behavior across shopping, checkout, dialogs, and information pages.

## Technical details
- Reuse the existing TanStack routes, cart/wishlist stores, product data, semantic colour tokens, and accessible dialog/sheet controls.
- Keep all payment and order logging in demo mode; do not connect a live payment account or external spreadsheet.
- Add or update route-specific metadata where needed, then verify the central catalogue → bag → checkout flow on desktop and mobile.
