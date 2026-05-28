import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/report_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/currency_formatter.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/dashboard_card.dart';
import '../../widgets/empty_state_widget.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<ReportProvider>().loadReport();
    });
  }

  Future<void> _pickCustomRange() async {
    final now = DateTime.now();
    final range = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
      initialDateRange: DateTimeRange(start: now, end: now),
    );
    if (range == null || !mounted) return;
    context.read<ReportProvider>().setCustomRange(range.start, range.end);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ReportProvider>();
    final report = provider.report;

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async => context.read<ReportProvider>().loadReport(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ChoiceChip(
                  label: const Text('Hari ini'),
                  selected: provider.period == ReportPeriod.today,
                  onSelected: (_) => context.read<ReportProvider>().setPeriod(
                    ReportPeriod.today,
                  ),
                ),
                ChoiceChip(
                  label: const Text('Minggu ini'),
                  selected: provider.period == ReportPeriod.week,
                  onSelected: (_) => context.read<ReportProvider>().setPeriod(
                    ReportPeriod.week,
                  ),
                ),
                ChoiceChip(
                  label: const Text('Bulan ini'),
                  selected: provider.period == ReportPeriod.month,
                  onSelected: (_) => context.read<ReportProvider>().setPeriod(
                    ReportPeriod.month,
                  ),
                ),
                ChoiceChip(
                  label: Text(
                    provider.period == ReportPeriod.custom &&
                            provider.customStart != null &&
                            provider.customEnd != null
                        ? '${DateFormatter.formatDate(provider.customStart!)} - ${DateFormatter.formatDate(provider.customEnd!)}'
                        : 'Custom tanggal',
                  ),
                  selected: provider.period == ReportPeriod.custom,
                  onSelected: (_) => _pickCustomRange(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (report == null || report.transactions.isEmpty)
              const SizedBox(
                height: 420,
                child: EmptyStateWidget(
                  icon: Icons.bar_chart_outlined,
                  title: 'Belum ada data penjualan',
                  message: 'Transaksi yang selesai akan muncul di laporan',
                ),
              )
            else ...[
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: MediaQuery.sizeOf(context).width > 680 ? 4 : 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio: MediaQuery.sizeOf(context).width > 680
                    ? 1.9
                    : 1.35,
                children: [
                  DashboardCard(
                    title: 'Total penjualan',
                    value: CurrencyFormatter.format(report.totalSales),
                    icon: Icons.payments_outlined,
                  ),
                  DashboardCard(
                    title: 'Total transaksi',
                    value: report.totalTransactions.toString(),
                    icon: Icons.receipt_long_outlined,
                    color: AppColors.success,
                  ),
                  DashboardCard(
                    title: 'Produk terjual',
                    value: report.totalItemsSold.toString(),
                    icon: Icons.shopping_bag_outlined,
                    color: AppColors.brown,
                  ),
                  DashboardCard(
                    title: 'Keuntungan',
                    value: CurrencyFormatter.format(report.totalProfit),
                    icon: Icons.trending_up,
                    color: AppColors.warning,
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Text(
                'Grafik penjualan',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 10),
              const _ReportChart(),
              const SizedBox(height: 18),
              _SectionHeader(
                title: 'Produk paling laku',
                route: '/best-selling-products',
                empty: report.bestSellingProducts.isEmpty,
              ),
              if (report.bestSellingProducts.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: Text('Belum ada produk terjual')),
                )
              else
                ...report.bestSellingProducts
                    .take(5)
                    .map(
                      (item) => Card(
                        child: ListTile(
                          leading: const Icon(
                            Icons.local_fire_department,
                            color: AppColors.orange,
                          ),
                          title: Text(item.productName),
                          subtitle: Text('${item.quantitySold} terjual'),
                          trailing: Text(
                            CurrencyFormatter.format(item.revenue),
                          ),
                        ),
                      ),
                    ),
              const SizedBox(height: 18),
              _SectionHeader(
                title: 'Stok menipis',
                route: '/low-stock',
                empty: report.lowStockProducts.isEmpty,
              ),
              if (report.lowStockProducts.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(
                    child: Text('Belum ada produk dengan stok menipis'),
                  ),
                )
              else
                ...report.lowStockProducts
                    .take(5)
                    .map(
                      (product) => Card(
                        child: ListTile(
                          leading: const Icon(
                            Icons.warning_amber_outlined,
                            color: AppColors.warning,
                          ),
                          title: Text(product.name),
                          subtitle: Text(product.category),
                          trailing: Text('${product.stock} ${product.unit}'),
                        ),
                      ),
                    ),
            ],
          ],
        ),
      ),
    );
  }
}

class _ReportChart extends StatelessWidget {
  const _ReportChart();

  @override
  Widget build(BuildContext context) {
    final data = context.watch<ReportProvider>().lastSevenDays;
    final maxValue = data.values.isEmpty
        ? 0
        : data.values.reduce((a, b) => a > b ? a : b);
    return Card(
      child: SizedBox(
        height: 170,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: data.entries.map((entry) {
              final factor = maxValue == 0
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
                            heightFactor: factor,
                            widthFactor: 0.7,
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

class _SectionHeader extends StatelessWidget {
  final String title;
  final String route;
  final bool empty;

  const _SectionHeader({
    required this.title,
    required this.route,
    required this.empty,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
        ),
        TextButton(
          onPressed: empty ? null : () => Navigator.pushNamed(context, route),
          child: const Text('Lihat semua'),
        ),
      ],
    );
  }
}
