import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/product_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/currency_formatter.dart';
import '../../utils/date_formatter.dart';
import '../../utils/role_helper.dart';
import '../../widgets/empty_state_widget.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final id = ModalRoute.of(context)?.settings.arguments as String?;
    final product = id == null
        ? null
        : context.watch<ProductProvider>().getById(id);
    final isAdmin = RoleHelper.isAdmin(
      context.watch<AuthProvider>().currentUser?.role,
    );

    if (product == null) {
      return const Scaffold(
        body: EmptyStateWidget(
          icon: Icons.inventory_2_outlined,
          title: 'Produk tidak ditemukan',
          message: 'Produk mungkin sudah dihapus',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Produk'),
        actions: [
          if (isAdmin)
            IconButton(
              tooltip: 'Edit produk',
              onPressed: () => Navigator.pushNamed(
                context,
                '/product-form',
                arguments: product.id,
              ),
              icon: const Icon(Icons.edit_outlined),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            height: 210,
            decoration: BoxDecoration(
              color: AppColors.softOrange,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: product.imagePath == null
                ? const Icon(
                    Icons.fastfood_outlined,
                    size: 72,
                    color: AppColors.brown,
                  )
                : ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.file(
                      File(product.imagePath!),
                      fit: BoxFit.cover,
                    ),
                  ),
          ),
          const SizedBox(height: 16),
          Text(
            product.name,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              Chip(label: Text(product.category)),
              Chip(
                label: Text(
                  product.hasBarcode
                      ? 'Barcode: ${product.barcode}'
                      : 'Tanpa barcode',
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _row('Harga beli', CurrencyFormatter.format(product.purchasePrice)),
          _row('Harga jual', CurrencyFormatter.format(product.sellingPrice)),
          _row(
            'Keuntungan/item',
            CurrencyFormatter.format(product.profitPerItem),
          ),
          _row('Stok', '${product.stock} ${product.unit}'),
          _row('Dibuat', DateFormatter.formatDateTime(product.createdAt)),
          _row('Diperbarui', DateFormatter.formatDateTime(product.updatedAt)),
          if (product.description?.isNotEmpty == true) ...[
            const SizedBox(height: 16),
            Text(product.description!),
          ],
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Card(
      child: ListTile(
        title: Text(label),
        trailing: Text(
          value,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
