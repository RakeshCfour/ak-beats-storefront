# AK VOID — Custom Streetwear Commerce Platform

A premium minimalist streetwear e-commerce application rebuilt from a Shopify-dependent storefront into a custom, database-driven platform.

This repository contains the customer storefront, protected admin portal, commerce API, inventory management, image handling, checkout integrations, and production deployment configuration.

## What the application does

### Customer storefront

- Displays products in a responsive premium fashion layout.
- Supports product categories, gender filters, search, sorting, and sale filtering.
- Provides product detail pages with image galleries and fallback rendering.
- Supports product variants and size selection.
- Shows current price, original price, and automatically calculated discount percentage.
- Displays low-stock and out-of-stock states.
- Provides a persistent shopping bag/cart.
- Supports guest checkout.
- Supports online payment continuation and Cash on Delivery.
- Includes responsive desktop and mobile layouts.

### Admin portal

- Protected Admin login.
- Product create, edit, hide, and delete operations.
- Product slug, category, gender, description, and visibility management.
- Product image URL editing.
- Product image upload and multiple-image support.
- Variant management for XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL, and One Size.
- Per-size price, sale price, discount state, stock, and visibility controls.
- Order listing and order status management.
- XLSX/CSV bulk product import.
- Import validation, duplicate slug detection, missing-image reporting, and row-level error reporting.

### Commerce and operations

- Database-backed products, variants, images, carts, and orders.
- Server-side stock validation.
- Server-side payment order creation and verification.
- COD order creation.
- Optional email and WhatsApp notification service integration through environment variables.
- Configurable frontend-to-backend API base URL for separate Netlify and backend hosting.

## Technology stack

### Languages

- TypeScript
- JavaScript
- SQL
- HTML
- CSS

### Frontend

- React 19
- Vite
- Tailwind CSS 4
- React Router/Wouter-style client routing
- tRPC React client
- Three.js
- React Three Fiber
- GSAP
- Lenis smooth scrolling
- Lucide icons

### Backend

- Node.js
- Express
- TypeScript
- tRPC 11
- Drizzle ORM
- MySQL/TiDB-compatible database layer
- Zod validation
- Razorpay server integration
- XLSX.js catalog parsing

### Tooling and testing

- pnpm
- Vite build tooling
- esbuild backend bundling
- Vitest
- TypeScript compiler
- Git and GitHub

## Project structure

```text
client/
  src/
    components/       Shared storefront, checkout, image, and UI components
    contexts/         Cart and application state providers
    lib/              tRPC client and formatting utilities
    pages/            Home, shop, product detail, and Admin pages
    App.tsx           Application routes
    index.css         Global design system and responsive styling

driz​​zle/
  schema.ts           Product, variant, image, cart, order, and user schema

server/
  _core/              Express, tRPC, auth, environment, and runtime setup
  routers/            Commerce and Admin tRPC routers
  dbCommerce.ts       Database-backed product, cart, order, and inventory logic
  payments.ts         Razorpay order and payment verification logic
  notifications.ts    Optional order notification service
  storage.ts          Product image storage helpers

shared/
  catalog.ts           Supported product sizes and catalog constants
  commerce/            Shared commerce types and inventory helpers

DEPLOYMENT.md          Backend, Netlify, OAuth, CORS, and payment deployment guide
package.json           Scripts and dependencies
pnpm-lock.yaml         Locked dependency versions
```

## Application architecture

```text
React + Vite storefront
          |
          | tRPC requests
          v
Express + tRPC backend
          |
          +--> Drizzle ORM --> MySQL/TiDB
          +--> Payment provider integration
          +--> Image storage integration
          +--> Optional notification integrations
```

The frontend can be deployed to Netlify while the Node.js backend and database run on a separate hosting provider.

## Local setup

Requirements:

- Node.js 22+
- pnpm
- MySQL or TiDB database for database-backed development

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Create a local `.env` file with the required runtime values. Keep `.env` files outside GitHub. The backend reads database, session, CORS, payment, OAuth, storage, and optional notification settings from environment variables.

Run development mode:

```bash
pnpm dev
```

The local application normally runs on port `3000`.

## Validation commands

TypeScript validation:

```bash
pnpm check
```

Production build:

```bash
pnpm build
```

Regression tests:

```bash
pnpm test
```

The verified project state passes all three commands. The current Vitest suite contains 11 passing tests covering authentication, catalog parsing, commerce procedures, compatibility behavior, and inventory/sale logic.

## Product data model

A product contains:

- Title
- Unique URL slug
- Description
- Category
- Gender classification
- Visibility state
- Primary image URL and alt text
- One or more image records
- One or more product variants

A variant contains:

- Size/name
- Original price
- Optional sale price
- Discount-enabled state
- Stock quantity
- Visibility state

Products without valid purchasable variants are not exposed as purchasable customer catalog items. Zero-stock variants remain visible for inventory communication but are rejected during cart and checkout operations.

## Slugs

A slug is the URL-safe unique identifier for a product.

```text
Product title: Dune Cargo Trouser
Slug:          dune-cargo-trouser
Product URL:   /product/dune-cargo-trouser
```

Slugs use lowercase letters, numbers, and hyphens. Duplicate slugs are rejected by the Admin API.

## Pricing behavior

For a discounted product, the API preserves both prices:

```text
Current price:  ₹1,699
Original price: ₹1,999
Display:        ₹1,699  ~~₹1,999~~  15% OFF
```

The discount percentage is derived automatically from the original and current prices. Normal-price products do not receive a fake sale label.

Pricing is displayed consistently in:

- Product cards
- Shop and category pages
- Search results
- Product detail pages
- Cart drawer
- Checkout order summary

## Inventory behavior

Supported standard clothing sizes:

```text
XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL, One Size
```

Inventory is tracked per variant. The storefront can display:

- Ready to ship
- Low stock
- Out of stock

The server validates stock again when adding to the cart and creating orders so the client cannot bypass inventory rules.

## Image flow

Product images can enter the system through either:

1. Admin image URL field.
2. Admin image upload.
3. XLSX/CSV import with matching image files.

The flow is:

```text
Admin input/upload
      -> product or product_images database row
      -> commerce tRPC response
      -> shared product image type
      -> ProductCard/ProductDetail/Cart image component
```

The storefront uses a reusable fallback image component so missing or unavailable URLs do not leave broken empty image areas.

## Bulk import

The importer accepts XLSX or CSV files and optional image files.

Common catalog columns:

```text
product_name
title
slug
description
category
gender
price
sale_price
discount
sizes
stock
image_filename
image_filenames
```

Importer behavior:

- Validates required fields.
- Validates supported genders and sizes.
- Validates positive prices and non-negative stock.
- Detects duplicate slugs.
- Matches image files by filename.
- Supports multiple image files per product.
- Produces imported, skipped, duplicate, missing-image, and invalid-row reports.
- Keeps manual Admin product creation available.

## Checkout behavior

The checkout form collects customer delivery information and validates required fields before continuing.

Payment actions:

- Online payment: creates a server-side payment order and continues to the payment provider.
- COD: creates a server-side COD order.

The final checkout action is visible on desktop and mobile and shows a loading state while the request is being processed.

Payment credentials and webhook secrets must be supplied through backend environment variables and must never be committed to the repository.

## Deployment model

### Frontend

The frontend is Netlify-compatible:

```text
Build command: pnpm install --frozen-lockfile && pnpm build
Publish directory: dist/public
```

The frontend can use:

```text
VITE_API_BASE_URL=https://your-backend-domain
```

### Backend

The backend can run on Render, Railway, Fly.io, a VPS, or another Node.js host:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The backend must expose its assigned `PORT`, connect to the production database, and allow the deployed frontend origin through CORS.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete deployment checklist and environment-variable categories.

## Security rules

- Do not commit `.env` files.
- Do not commit payment secrets, database credentials, OAuth secrets, session secrets, API tokens, or private keys.
- Keep server-only credentials out of `VITE_*` variables.
- Use HTTPS for production frontend, backend, OAuth callbacks, and payment webhooks.
- Use server-side payment verification.
- Restrict database access to the backend.
- Change development authentication defaults before production.
- Rotate any credential that is accidentally exposed in logs or source control.

## Current project status

The current implementation has been migrated from Shopify-backed commerce to the custom Node.js, Express, tRPC, Drizzle, and database-driven architecture.

Verified features include:

- Customer homepage and shop
- Men’s, Women’s, category, and Sale filters
- Product detail pages
- Cart and checkout drawer
- Discount and original-price display
- Low-stock and out-of-stock badges
- Admin product CRUD
- Admin variants and per-size inventory
- Admin image URLs and uploads
- Multiple product images
- XLSX/CSV importer
- COD flow
- Razorpay order continuation and verification path
- Netlify frontend configuration
- Production build and regression tests

## License and ownership

This is a private project repository. Brand assets, catalog content, and application code are intended for the project owner and authorized contributors only.
