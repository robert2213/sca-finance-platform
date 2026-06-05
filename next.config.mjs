/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep server-only packages out of the webpack bundle.
  // @databricks/sql uses lz4 native bindings; sql.js uses a WASM binary.
  // These are loaded at runtime by Node.js, not bundled.
  experimental: {
    serverComponentsExternalPackages: ["@databricks/sql", "sql.js", "lz4"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Belt-and-suspenders: also mark as webpack externals so they are
      // never included in the server bundle, regardless of import style.
      const existing = Array.isArray(config.externals) ? config.externals : [];
      config.externals = [
        ...existing,
        "@databricks/sql",
        "sql.js",
        "lz4",
      ];
    }
    return config;
  },
};
export default nextConfig;
