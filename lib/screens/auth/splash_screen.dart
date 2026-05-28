import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/category_provider.dart';
import '../../providers/payment_setting_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/report_provider.dart';
import '../../providers/stock_provider.dart';
import '../../providers/store_setting_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/user_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/app_constants.dart';
import '../../widgets/app_logo.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(_start);
  }

  Future<void> _start() async {
    final auth = context.read<AuthProvider>();
    await auth.bootstrap();
    if (!mounted) return;

    context.read<UserProvider>().loadUsers();
    context.read<ProductProvider>().loadProducts();
    context.read<CategoryProvider>().loadCategories();
    context.read<TransactionProvider>().loadTransactions();
    context.read<PaymentSettingProvider>().loadPaymentSettings();
    context.read<StockProvider>().loadHistories();
    context.read<StoreSettingProvider>().loadStoreSetting();
    context.read<ReportProvider>().loadReport();

    await Future<void>.delayed(const Duration(milliseconds: 350));
    if (!mounted) return;
    if (!auth.hasAdmin) {
      Navigator.pushReplacementNamed(context, '/first-admin');
    } else if (auth.isLoggedIn) {
      Navigator.pushReplacementNamed(context, '/dashboard');
    } else {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AppLogo(size: 132),
            SizedBox(height: 16),
            Text(
              AppConstants.appName,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: AppColors.brown,
              ),
            ),
            SizedBox(height: 18),
            CircularProgressIndicator(color: AppColors.orange),
          ],
        ),
      ),
    );
  }
}
