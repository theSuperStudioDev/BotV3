import webpack from "webpack"

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    // Prevent optional native dependency from breaking the build
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^zlib-sync$/ })
    )
    return config
  },
}

export default nextConfig
