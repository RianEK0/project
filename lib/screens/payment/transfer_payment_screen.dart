import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
import '../../widgets/bank_account_card.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_widget.dart';

class TransferPaymentScreen extends StatefulWidget {
  const TransferPaymentScreen({super.key});

  @override
  State<TransferPaymentScreen> createState() => _TransferPaymentScreenState();
}

class _TransferPaymentScreenState extends State<TransferPaymentScreen> {
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
        paymentMethod: AppConstants.paymentTransfer,
        paymentStatus: AppConstants.statusPending,
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
    final accounts = context.watch<PaymentSettingProvider>().activeBankAccounts;
    final isAdmin = RoleHelper.isAdmin(
      context.watch<AuthProvider>().currentUser?.role,
    );

    return Scaffold(
      appBar: AppBar(title: const Text('Pembayaran Transfer')),
      body: accounts.isEmpty
          ? EmptyStateWidget(
              icon: Icons.account_balance_outlined,
              title: 'Belum ada rekening bank',
              message: 'Tambahkan rekening bank di Pengaturan Pembayaran',
              action: CustomButton(
                label: 'Buka Pengaturan Pembayaran',
                icon: Icons.settings_outlined,
                onPressed: () {
                  if (isAdmin) {
                    Navigator.pushNamed(context, '/payment-settings');
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Hubungi admin untuk input rekening bank',
                        ),
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
                const SizedBox(height: 14),
                const Text(
                  'Transfer ke salah satu rekening berikut, lalu konfirmasi manual.',
                ),
                const SizedBox(height: 12),
                ...accounts.map(
                  (account) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: BankAccountCard(
                      account: account,
                      onCopy: () async {
                        await Clipboard.setData(
                          ClipboardData(text: account.accountNumber),
                        );
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Nomor rekening berhasil disalin'),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                CustomButton(
                  label: _isSubmitting ? 'Memproses...' : 'Saya Sudah Transfer',
                  icon: Icons.check_circle_outline,
                  onPressed: _isSubmitting ? null : _finish,
                ),
              ],
            ),
    );
  }
}
