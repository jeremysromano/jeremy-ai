/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: '/portfolio', destination: '/portfolio/index.html' },
      { source: '/uxportfolio', destination: '/uxportfolio/index.html' },
    ]
  },
}

export default nextConfig
