# AK VOID deployment

The project is split into a React frontend and an Express/tRPC backend. The backend must remain running because products, inventory, admin actions, orders, authentication, image uploads, and payments use the API and database.

## 1. Deploy the backend

Use a Node hosting provider such as Render, Railway, Fly.io, or a VPS. From the project root, run:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

The service must expose the assigned `PORT` and use the project root as its working directory.

Configure these backend environment variables:

```text
DATABASE_URL=<production MySQL or TiDB connection string>
JWT_SECRET=<long random secret>
VITE_APP_ID=<Manus app id>
OAUTH_SERVER_URL=<Manus OAuth server URL>
OWNER_OPEN_ID=<owner open id>
OWNER_NAME=AK
BUILT_IN_FORGE_API_URL=<provided Manus forge URL>
BUILT_IN_FORGE_API_KEY=<provided Manus forge key>
ADMIN_PASSWORD=<strong replacement for the development default>
FRONTEND_ORIGIN=https://<your-netlify-site>.netlify.app
RAZORPAY_KEY_ID=<production Razorpay key id>
RAZORPAY_KEY_SECRET=<production Razorpay secret>
RAZORPAY_WEBHOOK_SECRET=<Razorpay webhook secret>
```

Do not commit `.env` files or expose `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `JWT_SECRET`, or `ADMIN_PASSWORD` to the frontend.

## 2. Deploy the frontend to Netlify

Set the Netlify base directory to the repository root and use:

```text
Build command: pnpm install --frozen-lockfile && pnpm build
Publish directory: dist/public
```

Configure these Netlify environment variables before building:

```text
VITE_API_BASE_URL=https://<your-backend-domain>
VITE_APP_ID=<Manus app id>
VITE_OAUTH_PORTAL_URL=<Manus OAuth portal URL>
```

`VITE_API_BASE_URL` makes tRPC requests and OAuth callbacks target the separate backend. If the frontend and backend are hosted together, leave it empty.

## 3. OAuth callback

Register this exact callback with the Manus OAuth application:

```text
https://<your-backend-domain>/api/oauth/callback
```

The frontend login button constructs this callback from `VITE_API_BASE_URL`.

## 4. Razorpay webhook

In Razorpay, add a webhook pointing to:

```text
https://<your-backend-domain>/api/payments/razorpay/webhook
```

Subscribe to `payment.captured` and `order.paid`, then copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.

## 5. Admin and catalog

Open `/admin` on the deployed frontend. The portal uses the server-side `ADMIN_PASSWORD` value and the username `admin`. Change the development fallback password before production. Use the portal to create products, upload images, add sizes, set prices, set stock, hide products, and manage order status.

## 6. Production checklist

- Confirm the backend health URL responds.
- Confirm Netlify can call `/api/trpc` without CORS errors.
- Confirm Manus OAuth redirects to the backend callback.
- Test one COD order in staging.
- Test one Razorpay test-mode payment and webhook.
- Replace all seeded catalog entries with the approved product image batch.
- Rotate the development admin password and all production secrets.
