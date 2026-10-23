import type { NextConfig } from "next";

const isDevelopment =
  process.env.NODE_ENV === "development";

/*
 * =========================================================
 * CONTENT SECURITY POLICY
 * =========================================================
 *
 * Supabase must be allowed in connect-src because the
 * browser communicates with Supabase Auth and Storage.
 *
 * data: is allowed for images because our MFA QR code
 * can be returned as an inline image.
 *
 * Next.js requires some inline script/style support when
 * using a CSP without per-request nonces.
 */

const contentSecurityPolicy = `
  default-src 'self';

  script-src
    'self'
    'unsafe-inline'
    ${isDevelopment ? "'unsafe-eval'" : ""};

  style-src
    'self'
    'unsafe-inline';

  img-src
    'self'
    data:
    blob:
    https://*.supabase.co;

  font-src
    'self'
    data:;

  connect-src
    'self'
    https://*.supabase.co
    wss://*.supabase.co;

  media-src
    'self'
    blob:
    https://*.supabase.co;

  worker-src
    'self'
    blob:;

  object-src
    'none';

  base-uri
    'self';

  form-action
    'self';

  frame-ancestors
    'none';

  frame-src
    'none';

  manifest-src
    'self';

  ${
    isDevelopment
      ? ""
      : "upgrade-insecure-requests;"
  }
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },

  /*
   * Prevent this website from being embedded in an iframe.
   * This protects against clickjacking.
   */
  {
    key: "X-Frame-Options",
    value: "DENY",
  },

  /*
   * Do not let the browser guess MIME types.
   */
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },

  /*
   * Limit information sent in the Referer header.
   */
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },

  /*
   * This project currently does not need camera,
   * microphone or geolocation access.
   */
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },

  /*
   * Disable old Adobe cross-domain policy files.
   */
  {
    key: "X-Permitted-Cross-Domain-Policies",
    value: "none",
  },
];

const productionSecurityHeaders = [
  /*
   * HTTPS-only browser policy.
   *
   * This is added only in production so localhost
   * development is not affected.
   */
  {
    key: "Strict-Transport-Security",
    value:
      "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",

        headers: [
          ...securityHeaders,

          ...(
            isDevelopment
              ? []
              : productionSecurityHeaders
          ),
        ],
      },
    ];
  },
};

export default nextConfig;