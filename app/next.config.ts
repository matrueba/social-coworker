import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mastra se ejecuta solo en el servidor; se carga desde node_modules en lugar de empaquetarse
  serverExternalPackages: ["@mastra/*"],
};

export default nextConfig;
