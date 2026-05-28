import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/category_provider.dart';
import 'providers/payment_setting_provider.dart';
import 'providers/product_provider.dart';
import 'providers/report_provider.dart';
import 'providers/stock_provider.dart';
import 'providers/store_setting_provider.dart';
import 'providers/transaction_provider.dart';
import 'providers/user_provider.dart';
import 'screens/auth/first_admin_register_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/splash_screen.dart';
import 'screens/cashier/cart_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/payment/cash_payment_screen.dart';
import 'screens/payment/payment_screen.dart';
import 'screens/payment/qris_payment_screen.dart';
import 'screens/payment/transfer_payment_screen.dart';
import 'screens/product/barcode_scanner_screen.dart';
import 'screens/product/product_detail_screen.dart';
import 'screens/product/product_form_screen.dart';
import 'screens/report/best_selling_product_screen.dart';
import 'screens/report/low_stock_screen.dart';
import 'screens/setting/bank_account_form_screen.dart';
import 'screens/setting/payment_setting_screen.dart';
import 'screens/setting/store_setting_screen.dart';
import 'screens/stock/stock_history_screen.dart';
import 'screens/stock/stock_in_screen.dart';
import 'screens/stock/stock_out_screen.dart';
import 'screens/transaction/receipt_screen.dart';
import 'screens/transaction/transaction_detail_screen.dart';
import 'screens/user/user_form_screen.dart';
import 'screens/user/user_management_screen.dart';
import 'utils/app_colors.dart';
import 'utils/app_constants.dart';

class RirisMartApp extends StatelessWidget {
  const RirisMartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => CategoryProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => TransactionProvider()),
        ChangeNotifierProvider(create: (_) => PaymentSettingProvider()),
        ChangeNotifierProvider(create: (_) => ReportProvider()),
        ChangeNotifierProvider(create: (_) => StockProvider()),
        ChangeNotifierProvider(create: (_) => StoreSettingProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: AppConstants.appName,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: AppColors.orange,
            primary: AppColors.brown,
            secondary: AppColors.orange,
            surface: AppColors.surface,
          ),
          scaffoldBackgroundColor: AppColors.cream,
          appBarTheme: const AppBarTheme(
            backgroundColor: AppColors.brown,
            foregroundColor: Colors.white,
            centerTitle: false,
            elevation: 0,
          ),
          cardTheme: CardThemeData(
            color: AppColors.surface,
            elevation: 0,
            margin: EdgeInsets.zero,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
              side: const BorderSide(color: AppColors.border),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.orange, width: 1.4),
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.orange,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              minimumSize: const Size.fromHeight(48),
            ),
          ),
          useMaterial3: true,
        ),
        routes: {
          '/': (_) => const SplashScreen(),
          '/first-admin': (_) => const FirstAdminRegisterScreen(),
          '/login': (_) => const LoginScreen(),
          '/dashboard': (_) => const DashboardScreen(),
          '/user-management': (_) => const UserManagementScreen(),
          '/user-form': (_) => const UserFormScreen(),
          '/product-form': (_) => const ProductFormScreen(),
          '/product-detail': (_) => const ProductDetailScreen(),
          '/barcode-scanner': (_) => const BarcodeScannerScreen(),
          '/cart': (_) => const CartScreen(),
          '/payment': (_) => const PaymentScreen(),
          '/cash-payment': (_) => const CashPaymentScreen(),
          '/qris-payment': (_) => const QrisPaymentScreen(),
          '/transfer-payment': (_) => const TransferPaymentScreen(),
          '/transaction-detail': (_) => const TransactionDetailScreen(),
          '/receipt': (_) => const ReceiptScreen(),
          '/stock-in': (_) => const StockInScreen(),
          '/stock-out': (_) => const StockOutScreen(),
          '/stock-history': (_) => const StockHistoryScreen(),
          '/best-selling-products': (_) => const BestSellingProductScreen(),
          '/low-stock': (_) => const LowStockScreen(),
          '/payment-settings': (_) => const PaymentSettingScreen(),
          '/bank-account-form': (_) => const BankAccountFormScreen(),
          '/store-settings': (_) => const StoreSettingScreen(),
        },
      ),
    );
  }
}
