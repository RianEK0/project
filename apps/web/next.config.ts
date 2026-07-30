import { networkInterfaces } from 'node:os';
import type { NextConfig } from 'next';

function getAllowedDevOrigins(): string[] {
  const origins = new Set(['localhost', '127.0.0.1']);

  for (const network of Object.values(networkInterfaces())) {
    for (const address of network ?? []) {
      if (address.family === 'IPv4' && !address.internal) {
        origins.add(address.address);
      }
    }
  }

  return [...origins];
}

const nextConfig: NextConfig = {
  // Allow local demos over LAN IPs without breaking Next.js dev assets or HMR.
  allowedDevOrigins: getAllowedDevOrigins(),
  transpilePackages: ['@nova/ui', '@nova/shared-types', '@nova/validation'],
};

export default nextConfig;
