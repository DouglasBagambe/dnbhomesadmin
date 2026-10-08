import { validateEnvironment } from "./lib/environment.mjs";
validateEnvironment(process.env);
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    useTypeScriptCli: false
  }
};

export default nextConfig;
