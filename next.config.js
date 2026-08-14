// Allow any HTTPS remote host for next/image so admin-added external images work without
// updating config for each new hostname. This keeps Next.js image component working while
// allowing arbitrary external images. Restart the dev server after changing this file.

/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // allow any hostname over HTTPS
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
  },
};
