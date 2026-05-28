import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/report_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../utils/app_constants.dart';
import '../../utils/currency_formatter.dart';
import '../../utils/validators.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class CashPaymentScreen extends StatefulWidget {
  const CashPaymentScreen({super.key});

  @override
  State<CashPaymentScreen> createState() => _CashPaymentScreenState();
}

class _CashPaymentScreenState extends State<CashPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _receivedController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _receivedController.dispose();
    super.dispose();
  }

  int get _received => CurrencyFormatter.parseToInt(_receivedController.text);

  Future<void> _pay() async {
    final cart = context.read<CartProvider>();
    if (!_formKey.currentState!.validate()) return;
    if (_received < cart.total) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Uang diterima tidak boleh kurang dari total bayar'),
        ),
      );
      return;
    }
    final user = context.read<AuthProvider>().currentUser;
    if (user == null) return;
    setState(() => _isSubmitting = true);
    try {
      final transaction = await context.read<TransactionProvider>().checkout(
        cartItems: cart.items,
        discount: cart.discount,
        paymentMethod: AppConstants.paymentCash,
        paymentStatus: AppConstants.statusPaid,
        cashier: user,
        paidAmount: _received,
        changeAmount: _received - cart.total,
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
    final total = context.watch<CartProvider>().total;
    final change = (_received - total).clamp(0, _received);

    return Scaffold(
      appBar: AppBar(title: const Text('Pembayaran Tunai')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: ListTile(
                title: const Text('Total bayar'),
                trailing: Text(
                  CurrencyFormatter.format(total),
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 18,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            CustomTextField(
              controller: _receivedController,
              label: 'Uang diterima',
              keyboardType: TextInputType.number,
              validator: (value) => Validators.number(value, 'Uang diterima'),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                title: const Text('Kembalian'),
                trailing: Text(
                  CurrencyFormatter.format(change),
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
            ),
            const SizedBox(height: 20),
            CustomButton(
              label: _isSubmitting ? 'Memproses...' : 'Bayar',
              icon: Icons.check_circle_outline,
              onPressed: _isSubmitting ? null : _pay,
            ),
          ],
        ),
      ),
    );
  }
}
