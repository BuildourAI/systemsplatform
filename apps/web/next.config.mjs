/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@buildour/catalog"],
  outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
};

export default nextConfig;
