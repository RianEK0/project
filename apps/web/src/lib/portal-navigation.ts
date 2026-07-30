export const portalNavigationItems = [
  {
    label: 'Dashboard',
    href: '/portal',
    icon: 'LayoutDashboard',
    description: 'Ringkasan booking, order, billing, support, dan customer action yang relevan.',
  },
  {
    label: 'Bookings',
    href: '/portal/bookings',
    icon: 'ClipboardList',
    description: 'Pantau reservasi aktif, voucher, dan permintaan perubahan yang sedang berjalan.',
  },
  {
    label: 'Orders',
    href: '/portal/orders',
    icon: 'ShoppingCart',
    description: 'Lihat order aktif, progres fulfillment, dan milestone komersial yang terbuka.',
  },
  {
    label: 'Invoices',
    href: '/portal/invoices',
    icon: 'ReceiptText',
    description: 'Tinjau tagihan, invoice PDF, dan status settlement customer-facing.',
  },
  {
    label: 'Tickets',
    href: '/portal/tickets',
    icon: 'Ticket',
    description: 'Buat dan monitor support ticket berdasarkan transaksi atau isu umum.',
  },
  {
    label: 'Support',
    href: '/portal/support',
    icon: 'LifeBuoy',
    description: 'Akses support center, SLA target, dan kanal bantuan yang tersedia.',
  },
  {
    label: 'Downloads',
    href: '/portal/downloads',
    icon: 'Download',
    description: 'Unduh invoice, voucher, receipt, proof, dan dokumen customer lainnya.',
  },
  {
    label: 'Payments',
    href: '/portal/payments',
    icon: 'Wallet',
    description: 'Lihat tagihan terbuka, bukti pembayaran, dan verifikasi settlement.',
  },
  {
    label: 'Profile',
    href: '/portal/profile',
    icon: 'UserRound',
    description: 'Kelola kontak, preferensi komunikasi, dan pengaturan akun self-service.',
  },
  {
    label: 'Notifications',
    href: '/portal/notifications',
    icon: 'Bell',
    description: 'Ikuti update invoice, booking, fulfillment, dan support dalam satu inbox.',
  },
  {
    label: 'Tracking',
    href: '/portal/tracking',
    icon: 'Truck',
    description: 'Lihat timeline booking, order, payment, shipment, dan ticket secara terpadu.',
  },
] as const;
