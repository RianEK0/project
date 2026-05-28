import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/product_provider.dart';
import '../../utils/app_colors.dart';
import '../../widgets/empty_state_widget.dart';

class LowStockScreen extends StatefulWidget {
  const LowStockScreen({super.key});

  @override
  State<LowStockScreen> createState() => _LowStockScreenState();
}

class _LowStockScreenState extends State<LowStockScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<ProductProvider>().loadProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final products = context.watch<ProductProvider>().lowStockProducts;

    return Scaffold(
      appBar: AppBar(title: const Text('Stok Menipis')),
      body: products.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.check_circle_outline,
              title: 'Belum ada produk dengan stok menipis',
              message:
                  'Produk dengan stok kurang dari atau sama dengan 5 akan muncul di sini',
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemBuilder: (context, index) {
                final product = products[index];
                return Card(
                  child: ListTile(
                    leading: const Icon(
                      Icons.warning_amber_outlined,
                      color: AppColors.warning,
                    ),
                    title: Text(
                      product.name,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(product.category),
                    trailing: FilledButton.icon(
                      onPressed: () =>
                          Navigator.pushNamed(context, '/stock-in'),
                      icon: const Icon(Icons.add),
                      label: const Text('Tambah stok'),
                    ),
                  ),
                );
              },
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemCount: products.length,
            ),
    );
  }
}
