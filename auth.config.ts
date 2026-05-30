import { betterAuth } from "better-auth";
import { jwt, organization } from "better-auth/plugins";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { Pool } from "pg";

// This file is the single source of truth for the Better Auth config.
// It intentionally has no `server-only` import so the CLI can use it for migrations.
// App code must import from `lib/auth.ts` (which re-exports with the server-only guard).

// Shared pool so definePayload can query member roles without a second connection.
// Also re-exported so server routes (e.g. the internal directory endpoint) reuse the same pool.
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ---- Polar plugin assembly --------------------------------------------------------------------
// We only register the Polar plugin when an access token is present. Local dev installs (and the
// initial deploy before the env vars are set) keep working — the checkout / portal calls just
// fail gracefully until POLAR_ACCESS_TOKEN, POLAR_PRO_PRODUCT_ID and POLAR_WEBHOOK_SECRET are
// configured. server defaults to "sandbox"; switch to "production" via POLAR_SERVER on prod.
const polarAccessToken = process.env.POLAR_ACCESS_TOKEN ?? "";
const polarProProductId = process.env.POLAR_PRO_PRODUCT_ID ?? "";
const polarWebhookSecret = process.env.POLAR_WEBHOOK_SECRET ?? "";
const polarServer = (process.env.POLAR_SERVER ?? "sandbox") as "sandbox" | "production";

const polarPlugin = polarAccessToken
  ? polar({
      client: new Polar({ accessToken: polarAccessToken, server: polarServer }),
      // Auto-create the Polar Customer when a new Better Auth user signs up. externalId is set
      // to user.id so the backend can ingest usage / look up subscriptions without a separate
      // mapping table.
      createCustomerOnSignUp: true,
      use: [
        // Pro plan checkout. Accessible from the client via authClient.checkout({ slug: "pro" }).
        // On success the user lands on /upgrade/success?checkout_id=... where we show the new
        // subscription state.
        checkout({
          products: polarProProductId ? [{ productId: polarProProductId, slug: "pro" }] : [],
          successUrl: "/upgrade/success?checkout_id={CHECKOUT_ID}",
          authenticatedUsersOnly: true,
        }),
        // Customer portal — authClient.customer.portal() redirects to Polar's hosted page where
        // the customer can manage subscriptions / payment methods / view invoices.
        portal(),
        // Webhook receiver wired at /api/auth/polar/webhooks. We only attach handlers when the
        // secret is present; without it the receiver would fail signature verification anyway.
        ...(polarWebhookSecret
          ? [
              webhooks({
                secret: polarWebhookSecret,
                // For now we just log lifecycle events; pipe these into the backend audit log
                // once we have a Pro entitlement table to update.
                onSubscriptionActive: async (payload) => {
                  console.info("[polar] subscription active", payload.data.id);
                },
                onSubscriptionCanceled: async (payload) => {
                  console.info("[polar] subscription canceled", payload.data.id);
                },
                onOrderPaid: async (payload) => {
                  console.info("[polar] order paid", payload.data.id);
                },
              }),
            ]
          : []),
      ],
    })
  : null;

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await fetch(`${process.env.INTERNAL_API_URL ?? "http://localhost:8080"}/internal/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Token": process.env.INTERNAL_SERVICE_TOKEN ?? "dev-internal-token",
        },
        body: JSON.stringify({
          to: user.email,
          subject: "Verify your email address",
          template: "verify-email",
          context: { url, name: user.name },
        }),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
  },
  plugins: [
    organization({
      requireEmailVerificationOnInvitation: false,
      sendInvitationEmail: async (data) => {
        const url = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/invitations/accept?token=${data.invitation.id}`;
        await fetch(`${process.env.INTERNAL_API_URL ?? "http://localhost:8080"}/internal/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Token": process.env.INTERNAL_SERVICE_TOKEN ?? "dev-internal-token",
          },
          body: JSON.stringify({
            to: data.email,
            subject: `You've been invited to join ${data.organization.name}`,
            template: "org-invitation",
            context: {
              organizationName: data.organization.name,
              inviterName: data.inviter.user?.name ?? data.inviter.user?.email ?? "",
              url,
            },
          }),
        });
      },
    }),
    jwt({
      jwt: {
        expirationTime: "1h",
        definePayload: async ({ user, session }) => {
          const orgId =
            (session as unknown as { activeOrganizationId?: string }).activeOrganizationId ?? null;

          let roles: string[] = [];
          if (orgId) {
            try {
              const result = await pool.query<{ role: string }>(
                'SELECT role FROM member WHERE "userId" = $1 AND "organizationId" = $2 LIMIT 1',
                [user.id, orgId],
              );
              const role = result.rows[0]?.role;
              if (role) roles = [role];
            } catch {
              // non-fatal: roles stays empty, user gets no admin authority
            }
          }

          return { org: orgId, roles };
        },
      },
      jwks: { keyPairConfig: { alg: "RS256" } },
    }),
    // Polar plugin appended only when the access token is configured. See the assembly block at
    // the top of this file for the conditional logic.
    ...(polarPlugin ? [polarPlugin] : []),
  ],
});
