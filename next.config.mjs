/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep the heavy native renderer packages out of the client/server webpack bundle
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer"],
};

export default nextConfig;
