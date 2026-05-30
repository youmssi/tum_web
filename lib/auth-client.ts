"use client";

import { jwtClient, organizationClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth/client";
import { createAuthClient } from "better-auth/react";

import { env } from "@/lib/env";

// polarClient() pairs with the server-side polar() plugin in auth.config.ts. It surfaces:
//   authClient.checkout({ slug | products }) — start a Polar checkout for an authenticated user
//   authClient.customer.portal()              — open the hosted billing portal
//   authClient.customer.state()               — read subscription / benefits / meters
// The client-side plugin is harmless when the server plugin isn't registered (no token yet) —
// calls just resolve to errors that callers should treat as "checkout not available".
export const authClient = createAuthClient({
  baseURL: env.betterAuthUrl,
  plugins: [organizationClient(), jwtClient(), polarClient()],
});
