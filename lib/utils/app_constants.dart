class AppConstants {
  static const appName = 'Riri’s Mart';
  static const appLogoAsset = 'assets/images/riris_mart_logo.png';

  static const roleAdmin = 'Admin';
  static const roleCashier = 'Kasir';

  static const paymentCash = 'Tunai';
  static const paymentQris = 'QRIS';
  static const paymentTransfer = 'Transfer Bank';

  static const statusPaid = 'Lunas';
  static const statusManualPaid = 'Lunas Manual';
  static const statusPending = 'Menunggu Konfirmasi';
  static const statusCanceled = 'Dibatalkan';

  static const stockIn = 'Masuk';
  static const stockOut = 'Keluar';

  static const lowStockLimit = 5;

  static const defaultCategories = <String>[
    'Sabana',
    'Frozen Food',
    'Snack',
    'Minuman',
    'Makanan Kering',
    'Produk Titipan',
    'Tanpa Barcode',
    'Lainnya',
  ];

  static const stockOutReasons = <String>[
    'Rusak',
    'Expired',
    'Hilang',
    'Koreksi stok',
    'Lainnya',
  ];
}
