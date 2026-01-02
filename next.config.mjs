/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ✅ Don’t fail production builds on ESLint issues
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

