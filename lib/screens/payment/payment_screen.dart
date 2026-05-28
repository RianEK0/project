import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/cart_provider.dart';
import '../../utils/app_constants.dart';
import '../../utils/currency_formatter.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/payment_method_card.dart';

class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();

    return Scaffold(
      appBar: AppBar(title: const Text('Pembayaran')),
      body: cart.isEmpty
          ? const EmptyStateWidget(
              icon: Icons.shopping_cart_outlined,
              title: 'Keranjang masih kosong',
              message: 'Tambahkan produk sebelum memilih pembayaran',
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: ListTile(
                    title: const Text('Total bayar'),
                    trailing: Text(
                      CurrencyFormatter.format(cart.total),
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                PaymentMethodCard(
                  title: AppConstants.paymentCash,
                  description: 'Input uang diterima dan hitung kembalian',
                  icon: Icons.payments_outlined,
                  onTap: () => Navigator.pushNamed(context, '/cash-payment'),
                ),
                const SizedBox(height: 10),
                PaymentMethodCard(
                  title: AppConstants.paymentQris,
                  description: 'Tampilkan QRIS toko yang diupload admin',
                  icon: Icons.qr_code_2,
                  onTap: () => Navigator.pushNamed(context, '/qris-payment'),
                ),
                const SizedBox(height: 10),
                PaymentMethodCard(
                  title: AppConstants.paymentTransfer,
                  description: 'Tampilkan rekening bank toko',
                  icon: Icons.account_balance_outlined,
                  onTap: () =>
                      Navigator.pushNamed(context, '/transfer-payment'),
                ),
              ],
            ),
    );
  }
}
