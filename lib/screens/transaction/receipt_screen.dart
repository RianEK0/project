import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/store_setting_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/receipt_widget.dart';

class ReceiptScreen extends StatelessWidget {
  const ReceiptScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final id = ModalRoute.of(context)?.settings.arguments as String?;
    final transaction = id == null
        ? null
        : context.watch<TransactionProvider>().getById(id);
    final store = context.watch<StoreSettingProvider>().setting;

    if (transaction == null) {
      return const Scaffold(
        body: EmptyStateWidget(
          icon: Icons.receipt_outlined,
          title: 'Struk tidak ditemukan',
          message: 'Transaksi belum tersedia',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Struk Transaksi')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ReceiptWidget(transaction: transaction, storeSetting: store),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: CustomButton(
                  label: 'Cetak struk',
                  icon: Icons.print_outlined,
                  onPressed: () {
                    // TODO: Integrasikan printer bluetooth/thermal pada pengembangan berikutnya.
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Fitur cetak struk disiapkan untuk versi berikutnya',
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          CustomButton(
            label: 'Simpan struk',
            icon: Icons.save_alt_outlined,
            isSecondary: true,
            onPressed: () {
              // TODO: Simpan struk sebagai gambar atau PDF pada pengembangan berikutnya.
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'Fitur simpan struk disiapkan untuk versi berikutnya',
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 10),
          CustomButton(
            label: 'Bagikan WhatsApp',
            icon: Icons.share_outlined,
            isSecondary: true,
            onPressed: () {
              // TODO: Tambahkan share intent WhatsApp setelah package sharing dipasang.
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'Fitur bagikan struk disiapkan untuk versi berikutnya',
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
