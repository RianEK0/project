import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/stock_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/empty_state_widget.dart';

class StockHistoryScreen extends StatefulWidget {
  const StockHistoryScreen({super.key});

  @override
  State<StockHistoryScreen> createState() => _StockHistoryScreenState();
}

class _StockHistoryScreenState extends State<StockHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<StockProvider>().loadHistories();
    });
  }

  @override
  Widget build(BuildContext context) {
    final histories = context.watch<StockProvider>().histories;

    return Scaffold(
      appBar: AppBar(title: const Text('Riwayat Stok')),
      body: histories.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.history,
              title: 'Belum ada produk untuk dikelola stoknya',
              message: 'Riwayat stok masuk dan keluar akan muncul di sini',
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final history = histories[index];
                final isIn = history.type == 'Masuk';
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isIn
                          ? AppColors.softOrange
                          : Colors.red.shade50,
                      child: Icon(
                        isIn ? Icons.arrow_downward : Icons.arrow_upward,
                        color: isIn ? AppColors.brown : AppColors.danger,
                      ),
                    ),
                    title: Text(
                      history.productName,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      '${DateFormatter.formatDateTime(history.dateTime)}\n${history.reason ?? history.supplier ?? '-'} ${history.note ?? ''}',
                    ),
                    isThreeLine: true,
                    trailing: Text(
                      '${isIn ? '+' : '-'}${history.quantity}',
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemCount: histories.length,
            ),
    );
  }
}
