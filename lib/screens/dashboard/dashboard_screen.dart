import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';
import '../../providers/payment_setting_provider.dart';
import '../../providers/product_provider.dart';
import '../../providers/report_provider.dart';
import '../../providers/stock_provider.dart';
import '../../providers/store_setting_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../providers/user_provider.dart';
import '../../screens/cashier/cashier_screen.dart';
import '../../screens/product/product_list_screen.dart';
import '../../screens/report/report_screen.dart';
import '../../screens/transaction/transaction_history_screen.dart';
import '../../utils/app_colors.dart';
import '../../utils/app_constants.dart';
import '../../utils/currency_formatter.dart';
import '../../utils/date_formatter.dart';
import '../../utils/role_helper.dart';
import '../../widgets/dashboard_card.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/transaction_card.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    Future.microtask(_refreshAll);
  }

  void _refreshAll() {
    context.read<UserProvider>().loadUsers();
    context.read<ProductProvider>().loadProducts();
    context.read<TransactionProvider>().loadTransactions();
    context.read<PaymentSettingProvider>().loadPaymentSettings();
    context.read<StockProvider>().loadHistories();
    context.read<StoreSettingProvider>().loadStoreSetting();
    context.read<ReportProvider>().loadReport();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    final isAdmin = RoleHelper.isAdmin(user?.role);
    final tabs = [
      const _DashboardHome(),
      const ProductListScreen(),
      const CashierScreen(),
      const TransactionHistoryScreen(),
      isAdmin ? const ReportScreen() : const _NoAccessScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text(AppConstants.appName),
        actions: [
          Consumer<CartProvider>(
            builder: (context, cart, _) => IconButton(
              tooltip: 'Keranjang',
              onPressed: () => Navigator.pushNamed(context, '/cart'),
              icon: Badge(
                isLabelVisible: cart.itemCount > 0,
                label: Text(cart.itemCount.toString()),
                child: const Icon(Icons.shopping_cart_outlined),
              ),
            ),
          ),
        ],
      ),
      drawer: _AppDrawer(onRefresh: _refreshAll),
      body: IndexedStack(index: _index, children: tabs),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            label: 'Produk',
          ),
          NavigationDestination(
            icon: Icon(Icons.point_of_sale),
            label: 'Kasir',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            label: 'Transaksi',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            label: 'Laporan',
          ),
        ],
      ),
    );
  }
}

class _DashboardHome extends StatelessWidget {
  const _DashboardHome();

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    final store = context.watch<StoreSettingProvider>().setting;
    final products = context.watch<ProductProvider>().products;
    final allTransactions = context.watch<TransactionProvider>().visibleFor(
      user,
    );
    final todayTransactions = allTransactions
        .where((trx) => DateFormatter.isSameDay(trx.dateTime, DateTime.now()))
        .toList();
    final todaySales = todayTransactions.fold(0, (sum, trx) => sum + trx.total);
    final latest = allTransactions.take(5).toList();
    final lowStock = products
        .where((product) => product.stock <= AppConstants.lowStockLimit)
        .length;

    return RefreshIndicator(
      onRefresh: () async {
        context.read<ProductProvider>().loadProducts();
        context.read<TransactionProvider>().loadTransactions();
        context.read<ReportProvider>().loadReport();
      },
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            store.storeName,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w800,
              color: AppColors.brown,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Halo, ${user?.role ?? 'User'}',
            style: const TextStyle(color: AppColors.muted),
          ),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth > 680;
              return GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: isWide ? 4 : 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: isWide ? 1.9 : 1.35,
                children: [
                  DashboardCard(
                    title: 'Penjualan hari ini',
                    value: CurrencyFormatter.format(todaySales),
                    icon: Icons.payments_outlined,
                  ),
                  DashboardCard(
                    title: 'Transaksi hari ini',
                    value: '${todayTransactions.length}',
                    icon: Icons.receipt_long_outlined,
                    color: AppColors.success,
                  ),
                  DashboardCard(
                    title: 'Total produk',
                    value: '${products.length}',
                    icon: Icons.inventory_2_outlined,
                    color: AppColors.brown,
                  ),
                  DashboardCard(
                    title: 'Stok menipis',
                    value: '$lowStock',
                    icon: Icons.warning_amber_outlined,
                    color: AppColors.warning,
                  ),
                ],
              );
            },
          ),
          const SizedBox(height: 18),
          Text(
            'Grafik penjualan 7 hari terakhir',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          const _SalesChart(),
          const SizedBox(height: 20),
          Text(
            'Transaksi terbaru',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          if (latest.isEmpty)
            const SizedBox(
              height: 220,
              child: EmptyStateWidget(
                icon: Icons.receipt_long_outlined,
                title: 'Belum ada transaksi',
                message: 'Transaksi yang selesai akan muncul di sini',
              ),
            )
          else
            ...latest.map(
              (trx) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: TransactionCard(
                  transaction: trx,
                  onTap: () => Navigator.pushNamed(
                    context,
                    '/transaction-detail',
                    arguments: trx.id,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _SalesChart extends StatelessWidget {
  const _SalesChart();

  @override
  Widget build(BuildContext context) {
    final data = context.watch<ReportProvider>().lastSevenDays;
    final maxValue = data.values.isEmpty
        ? 0
        : data.values.reduce((a, b) => a > b ? a : b);

    return Card(
      child: SizedBox(
        height: 180,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: data.entries.map((entry) {
              final heightFactor = maxValue == 0
                  ? 0.03
                  : (entry.value / maxValue).clamp(0.08, 1.0);
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Align(
                          alignment: Alignment.bottomCenter,
                          child: FractionallySizedBox(
                            heightFactor: heightFactor,
                            widthFactor: 0.72,
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                color: entry.value == 0
                                    ? AppColors.border
                                    : AppColors.orange,
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        DateFormatter.formatDate(entry.key).split(' ').first,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppColors.muted,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _AppDrawer extends StatelessWidget {
  final VoidCallback onRefresh;

  const _AppDrawer({required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.currentUser;
    final isAdmin = RoleHelper.isAdmin(user?.role);

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            ListTile(
              leading: const CircleAvatar(
                backgroundColor: AppColors.softOrange,
                child: Icon(Icons.person, color: AppColors.brown),
              ),
              title: Text(user?.name ?? '-'),
              subtitle: Text(user?.role ?? '-'),
            ),
            const Divider(),
            if (isAdmin) ...[
              _drawerTile(context, Icons.input, 'Stok Masuk', '/stock-in'),
              _drawerTile(context, Icons.output, 'Stok Keluar', '/stock-out'),
              _drawerTile(
                context,
                Icons.history,
                'Riwayat Stok',
                '/stock-history',
              ),
              _drawerTile(
                context,
                Icons.warning_amber_outlined,
                'Stok Menipis',
                '/low-stock',
              ),
              _drawerTile(
                context,
                Icons.payments_outlined,
                'Pengaturan Pembayaran',
                '/payment-settings',
              ),
              _drawerTile(
                context,
                Icons.store_outlined,
                'Pengaturan Toko',
                '/store-settings',
              ),
              _drawerTile(
                context,
                Icons.group_outlined,
                'Manajemen User',
                '/user-management',
              ),
            ],
            const Spacer(),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Logout'),
              onTap: () async {
                await context.read<AuthProvider>().logout();
                if (!context.mounted) return;
                context.read<CartProvider>().clear();
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  '/login',
                  (_) => false,
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawerTile(
    BuildContext context,
    IconData icon,
    String title,
    String route,
  ) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: () async {
        Navigator.pop(context);
        await Navigator.pushNamed(context, route);
        onRefresh();
      },
    );
  }
}

class _NoAccessScreen extends StatelessWidget {
  const _NoAccessScreen();

  @override
  Widget build(BuildContext context) {
    return const EmptyStateWidget(
      icon: Icons.lock_outline,
      title: 'Akses laporan admin',
      message:
          'Laporan penjualan hanya tersedia untuk admin atau pemilik toko.',
    );
  }
}
