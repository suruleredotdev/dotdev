// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? (process.env.NEXT_PUBLIC_BASE_PATH || '') : ''

module.exports = withBundleAnalyzer({
  basePath,
  assetPrefix: basePath,

  trailingSlash: true,

  staticPageGenerationTimeout: 300,
  images: {
    // unoptimized: true,
    loader: 'akamai',
    path: '',
    domains: [
      'www.notion.so',
      'notion.so',
      'images.unsplash.com',
      'pbs.twimg.com',
      'abs.twimg.com',
      's3.us-west-2.amazonaws.com',
      'surulere.dev'
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  eslint: {
    // TODO: revert this after fixing builds + before site is ready to go live
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  typescript: {
    // TODO: revert this after fixing builds + before site is ready to go live
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
})
