/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep dynamic features (API routes, auth, portal) enabled for Cloudflare/Next
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig