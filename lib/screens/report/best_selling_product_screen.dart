import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/report_provider.dart';
import '../../utils/currency_formatter.dart';
import '../../widgets/empty_state_widget.dart';

class BestSellingProductScreen extends StatefulWidget {
  const BestSellingProductScreen({super.key});

  @override
  State<BestSellingProductScreen> createState() =>
      _BestSellingProductScreenState();
}

class _BestSellingProductScreenState extends State<BestSellingProductScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<ReportProvider>().loadReport();
    });
  }

  @override
  Widget build(BuildContext context) {
    final items =
        context.watch<ReportProvider>().report?.bestSellingProducts ?? [];

    return Scaffold(
      appBar: AppBar(title: const Text('Produk Paling Laku')),
      body: items.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.local_fire_department_outlined,
              title: 'Belum ada produk terjual',
              message: 'Produk paling laku dihitung dari transaksi asli',
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final item = items[index];
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(child: Text('${index + 1}')),
                    title: Text(
                      item.productName,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      '${item.quantitySold} terjual\nOmzet ${CurrencyFormatter.format(item.revenue)}',
                    ),
                    isThreeLine: true,
                    trailing: Text(
                      CurrencyFormatter.format(item.profit),
                      style: const TextStyle(fontWeight: FontWeight.w800),
                    ),
                  ),
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemCount: items.length,
            ),
    );
  }
}
