import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/stock_provider.dart';
import '../../utils/app_constants.dart';
import '../../utils/validators.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/empty_state_widget.dart';

class StockOutScreen extends StatefulWidget {
  const StockOutScreen({super.key});

  @override
  State<StockOutScreen> createState() => _StockOutScreenState();
}

class _StockOutScreenState extends State<StockOutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _quantityController = TextEditingController();
  final _noteController = TextEditingController();
  String? _productId;
  String _reason = AppConstants.stockOutReasons.first;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<ProductProvider>().loadProducts();
    });
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final product = context.read<ProductProvider>().getById(_productId!);
    final user = context.read<AuthProvider>().currentUser;
    if (product == null || user == null) return;
    final quantity = int.parse(_quantityController.text);
    if (quantity > product.stock) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Jumlah stok keluar tidak boleh lebih besar dari stok tersedia',
          ),
        ),
      );
      return;
    }
    await context.read<StockProvider>().recordOut(
      product: product,
      quantity: quantity,
      reason: _reason,
      note: _noteController.text,
      user: user,
    );
    if (!mounted) return;
    context.read<ProductProvider>().loadProducts();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Stok keluar berhasil disimpan')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final products = context.watch<ProductProvider>().products;

    return Scaffold(
      appBar: AppBar(title: const Text('Stok Keluar')),
      body: products.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.inventory_2_outlined,
              title: 'Belum ada produk',
              message: 'Tambahkan produk terlebih dahulu',
            )
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  DropdownButtonFormField<String>(
                    value: _productId,
                    decoration: const InputDecoration(
                      labelText: 'Pilih produk',
                    ),
                    items: products
                        .map(
                          (product) => DropdownMenuItem(
                            value: product.id,
                            child: Text(
                              '${product.name} - stok ${product.stock}',
                            ),
                          ),
                        )
                        .toList(),
                    validator: (value) =>
                        value == null ? 'Produk wajib dipilih' : null,
                    onChanged: (value) => setState(() => _productId = value),
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _quantityController,
                    label: 'Jumlah stok keluar',
                    keyboardType: TextInputType.number,
                    validator: (value) => Validators.number(
                      value,
                      'Jumlah stok',
                      allowZero: false,
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _reason,
                    decoration: const InputDecoration(
                      labelText: 'Alasan stok keluar',
                    ),
                    items: AppConstants.stockOutReasons
                        .map(
                          (reason) => DropdownMenuItem(
                            value: reason,
                            child: Text(reason),
                          ),
                        )
                        .toList(),
                    onChanged: (value) =>
                        setState(() => _reason = value ?? _reason),
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _noteController,
                    label: 'Catatan opsional',
                    maxLines: 3,
                  ),
                  const SizedBox(height: 20),
                  CustomButton(
                    label: 'Simpan',
                    icon: Icons.save_outlined,
                    onPressed: _save,
                  ),
                ],
              ),
            ),
    );
  }
}
