import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/store_setting_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/receipt_widget.dart';

class TransactionDetailScreen extends StatelessWidget {
  const TransactionDetailScreen({super.key});

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
          icon: Icons.receipt_long_outlined,
          title: 'Transaksi tidak ditemukan',
          message: 'Transaksi mungkin belum tersimpan',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Detail Transaksi')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ReceiptWidget(transaction: transaction, storeSetting: store),
          const SizedBox(height: 16),
          CustomButton(
            label: 'Lihat Struk',
            icon: Icons.receipt,
            onPressed: () => Navigator.pushNamed(
              context,
              '/receipt',
              arguments: transaction.id,
            ),
          ),
        ],
      ),
    );
  }
}
