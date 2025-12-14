/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/photos/**',
      },
      {
        protocol: 'https',
        hostname: 'fhgvnjwiasusjfevimcw.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'eastdockstudios.site',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'eastdockstudios.co.uk',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.eastdockstudios.co.uk',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
