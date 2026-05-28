import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/payment_setting_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/report_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../utils/app_constants.dart';
import '../../utils/currency_formatter.dart';
import '../../utils/role_helper.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_widget.dart';

class QrisPaymentScreen extends StatefulWidget {
  const QrisPaymentScreen({super.key});

  @override
  State<QrisPaymentScreen> createState() => _QrisPaymentScreenState();
}

class _QrisPaymentScreenState extends State<QrisPaymentScreen> {
  bool _isSubmitting = false;

  Future<void> _finish() async {
    final cart = context.read<CartProvider>();
    final user = context.read<AuthProvider>().currentUser;
    if (user == null) return;
    setState(() => _isSubmitting = true);
    try {
      final transaction = await context.read<TransactionProvider>().checkout(
        cartItems: cart.items,
        discount: cart.discount,
        paymentMethod: AppConstants.paymentQris,
        paymentStatus: AppConstants.statusManualPaid,
        cashier: user,
      );
      if (!mounted) return;
      cart.clear();
      context.read<ProductProvider>().loadProducts();
      context.read<ReportProvider>().loadReport();
      Navigator.pushNamedAndRemoveUntil(
        context,
        '/receipt',
        (route) => route.settings.name == '/dashboard',
        arguments: transaction.id,
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString().replaceFirst('Exception: ', '')),
        ),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final setting = context.watch<PaymentSettingProvider>().setting;
    final isAdmin = RoleHelper.isAdmin(
      context.watch<AuthProvider>().currentUser?.role,
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Pembayaran QRIS')),
      body: !setting.hasQris
          ? EmptyStateWidget(
              icon: Icons.qr_code_2,
              title: 'QRIS belum tersedia',
              message: 'Silakan upload QRIS toko di Pengaturan Pembayaran',
              action: CustomButton(
                label: 'Buka Pengaturan Pembayaran',
                icon: Icons.settings_outlined,
                onPressed: () {
                  if (isAdmin) {
                    Navigator.pushNamed(context, '/payment-settings');
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Hubungi admin untuk upload QRIS toko'),
                      ),
                    );
                  }
                },
              ),
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
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Image.file(
                          File(setting.qrisImagePath!),
                          fit: BoxFit.contain,
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Silakan scan QRIS menggunakan GoPay, DANA, OVO, ShopeePay, LinkAja, atau Mobile Banking.',
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                CustomButton(
                  label: _isSubmitting ? 'Memproses...' : 'Saya Sudah Bayar',
                  icon: Icons.check_circle_outline,
                  onPressed: _isSubmitting ? null : _finish,
                ),
              ],
            ),
    );
  }
}
