/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Expose ADMIN_PASSWORD to Edge Runtime (middleware) — NOT sent to browser
  env: {
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Compress responses
  compress: true,

  // For AWS deployment via standalone output
  output: "standalone",

  // Enable experimental features carefully
  experimental: {
    optimizeCss: false,
  },
};

module.exports = nextConfig;
