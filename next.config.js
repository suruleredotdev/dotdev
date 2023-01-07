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

  redirects: async () => {
    return [
      {
        source: '/2020/08/23/mapping-lagos-slums.html',
        destination: '/mapping-lagos-slums-66b44ffa4d8b49d09583c5335322bb06/',
        permanent: true,
      },
      {
        source: '/2020/08/16/naira-stablecoins.html',
        destination: '/naira-stablecoins-fb1a8832de874f3597069381e1032fd9/',
        permanent: true,
      },
    ]
  },
})
