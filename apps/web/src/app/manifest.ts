import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NovaERP',
    short_name: 'NovaERP',
    description:
      'Installable enterprise workspace for dashboards, warehouse execution, and mobile operations.',
    start_url: '/app/mobile',
    display: 'standalone',
    background_color: '#f7f8fb',
    theme_color: '#0ea5e9',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcuts: [
      {
        name: 'Mobile Workspace',
        short_name: 'Mobile',
        url: '/app/mobile',
      },
      {
        name: 'Warehouse UI',
        short_name: 'Warehouse',
        url: '/app/mobile/warehouse-ui',
      },
      {
        name: 'Scan',
        short_name: 'Scan',
        url: '/app/warehouse-operations/scan',
      },
    ],
  };
}
