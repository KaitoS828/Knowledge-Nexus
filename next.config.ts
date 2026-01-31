import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Server External Packages (moved from experimental)
  serverExternalPackages: [
    '@xenova/transformers',
    'onnxruntime-node',
    'voy-search',
    'pdfjs-dist',
  ],
  webpack: (config, { isServer }) => {
    // WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Fix for pdfjs-dist and native modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Exclude problematic native modules from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'onnxruntime-node': 'commonjs onnxruntime-node',
      });
    }

    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Suppress hydration warnings for dark mode
  reactStrictMode: true,
};

export default nextConfig;
