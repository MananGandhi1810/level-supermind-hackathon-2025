/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;
