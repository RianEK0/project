import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/cart_provider.dart';
import '../../providers/product_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/currency_formatter.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_widget.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _discountController = TextEditingController();

  @override
  void initState() {
    super.initState();
    final discount = context.read<CartProvider>().discount;
    _discountController.text = discount == 0 ? '' : discount.toString();
  }

  @override
  void dispose() {
    _discountController.dispose();
    super.dispose();
  }

  void _increment(CartItem item) {
    final product = context.read<ProductProvider>().getById(item.productId);
    if (product == null) return;
    final message = context.read<CartProvider>().addProduct(product);
    if (message != null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Keranjang'),
        actions: [
          IconButton(
            tooltip: 'Kosongkan keranjang',
            onPressed: cart.isEmpty
                ? null
                : () => context.read<CartProvider>().clear(),
            icon: const Icon(Icons.delete_sweep_outlined),
          ),
        ],
      ),
      body: cart.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.shopping_cart_outlined,
              title: 'Keranjang masih kosong',
              message: 'Tambahkan produk dari halaman kasir',
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                ...cart.items.map(
                  (item) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    item.productName,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                IconButton(
                                  tooltip: 'Hapus item',
                                  onPressed: () => context
                                      .read<CartProvider>()
                                      .remove(item.productId),
                                  icon: const Icon(Icons.close),
                                ),
                              ],
                            ),
                            Text(CurrencyFormatter.format(item.sellingPrice)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                IconButton.filledTonal(
                                  tooltip: 'Kurangi',
                                  onPressed: () => context
                                      .read<CartProvider>()
                                      .decrement(item.productId),
                                  icon: const Icon(Icons.remove),
                                ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                  ),
                                  child: Text(
                                    item.quantity.toString(),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                IconButton.filledTonal(
                                  tooltip: 'Tambah',
                                  onPressed: () => _increment(item),
                                  icon: const Icon(Icons.add),
                                ),
                                const Spacer(),
                                Text(
                                  CurrencyFormatter.format(item.subtotal),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _discountController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'Diskon nominal opsional',
                    prefixIcon: Icon(Icons.discount_outlined),
                  ),
                  onChanged: (value) {
                    context.read<CartProvider>().setDiscount(
                      CurrencyFormatter.parseToInt(value),
                    );
                  },
                ),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        _row(
                          'Subtotal',
                          CurrencyFormatter.format(cart.subtotal),
                        ),
                        _row('Diskon', CurrencyFormatter.format(cart.discount)),
                        const Divider(),
                        _row(
                          'Total bayar',
                          CurrencyFormatter.format(cart.total),
                          bold: true,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                CustomButton(
                  label: 'Pilih Pembayaran',
                  icon: Icons.payments_outlined,
                  onPressed: () => Navigator.pushNamed(context, '/payment'),
                ),
              ],
            ),
    );
  }

  Widget _row(String label, String value, {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Expanded(child: Text(label)),
          Text(
            value,
            style: TextStyle(
              color: bold ? AppColors.brown : null,
              fontWeight: bold ? FontWeight.w800 : FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
