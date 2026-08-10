/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Use the stable TypeScript compiler API; CLI config parsing is unreliable
    // with this project's generated route type set.
    useTypeScriptCli: false,
  },
};

export default nextConfig;
