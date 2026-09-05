import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firestore.googleapis.com https://www.google-analytics.com wss://*.firebaseio.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  compress: true,

  poweredByHeader: false,

  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.notescafe.in" }],
        destination: "https://notescafe.in/:path*",
        permanent: true,
      },
      { source: "/resources", destination: "/study-material", permanent: true },
      { source: "/resources/syllabus", destination: "/study-material/upsc-syllabus", permanent: true },
      { source: "/resources/:slug", destination: "/study-material", permanent: true },
      { source: "/student-desk/syllabus", destination: "/study-material/upsc-syllabus", permanent: true },
      { source: "/student-desk/notes-2", destination: "/student-desk/notes", permanent: true },
      { source: "/student-desk/notes-2/:subjectId", destination: "/student-desk/notes/:subjectId", permanent: true },
      { source: "/student-desk/notifications", destination: "/student-desk/dashboard", permanent: false },
      { source: "/student-desk/timetable", destination: "/student-desk/planner", permanent: false },
      { source: "/student-desk/goals", destination: "/student-desk/planner", permanent: false },
      { source: "/courses", destination: "/study-material", permanent: false },
      { source: "/maps/government", destination: "/government", permanent: true },
      { source: "/admin/notes", destination: "/admin/notes-2", permanent: true },
      { source: "/admin/dashboard", destination: "/admin", permanent: true },
      { source: "/student-desk/mistake-notebook", destination: "/student-desk/analytics?tab=mistakes", permanent: false },
      { source: "/student-desk/mistake-notebook/review", destination: "/student-desk/analytics/review", permanent: false },
      { source: "/student-desk/mock-tests/leaderboard", destination: "/student-desk/mock-tests", permanent: false },
      { source: "/resources/books", destination: "/study-material/upsc-syllabus", permanent: true },
      { source: "/admin/topper-tips", destination: "/admin", permanent: false },
      { source: "/planning-tools/beginner-roadmap", destination: "/planning-tools", permanent: false },
      { source: "/planning-tools/preparation-strategy", destination: "/planning-tools", permanent: false },
      { source: "/planning-tools/goal-tracker", destination: "/planning-tools", permanent: false },
      { source: "/planning-tools/revision-planner", destination: "/planning-tools", permanent: false },
      { source: "/maps/upsc-maps/important-locations", destination: "/maps/upsc-maps", permanent: false },
      { source: "/government/committees", destination: "/government", permanent: false },
      { source: "/government/reports-and-indices", destination: "/government", permanent: false },
      { source: "/government/reports-indices", destination: "/government", permanent: false },
      { source: "/contact", destination: "/about", permanent: false },
      { source: "/study-material/ncert-books", destination: "/study-material/upsc-syllabus", permanent: false },
      { source: "/pyq", destination: "/login", permanent: false },
      { source: "/mock-tests", destination: "/login", permanent: false },
    ];
  },

  images: {
    formats: ["image/webp", "image/avif"],

    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "notescafe.in", pathname: "/**" },
      { protocol: "https", hostname: "www.notescafe.in", pathname: "/**" },
    ],
  },
};

export default nextConfig;
