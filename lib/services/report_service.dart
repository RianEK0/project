import '../models/product_model.dart';
import '../models/transaction_model.dart';
import '../utils/app_constants.dart';
import '../utils/date_formatter.dart';
import 'product_service.dart';
import 'transaction_service.dart';

class BestSellingProductReport {
  final String productId;
  final String productName;
  final int quantitySold;
  final int revenue;
  final int profit;

  const BestSellingProductReport({
    required this.productId,
    required this.productName,
    required this.quantitySold,
    required this.revenue,
    required this.profit,
  });
}

class SalesReport {
  final List<TransactionModel> transactions;
  final int totalSales;
  final int totalTransactions;
  final int totalItemsSold;
  final int totalProfit;
  final List<BestSellingProductReport> bestSellingProducts;
  final List<ProductModel> lowStockProducts;

  const SalesReport({
    required this.transactions,
    required this.totalSales,
    required this.totalTransactions,
    required this.totalItemsSold,
    required this.totalProfit,
    required this.bestSellingProducts,
    required this.lowStockProducts,
  });
}

class ReportService {
  final TransactionService _transactionService = TransactionService();
  final ProductService _productService = ProductService();

  SalesReport buildReport({DateTime? startDate, DateTime? endDate}) {
    final transactions = _transactionService.getTransactions().where((trx) {
      final afterStart =
          startDate == null ||
          !trx.dateTime.isBefore(
            DateTime(startDate.year, startDate.month, startDate.day),
          );
      final beforeEnd =
          endDate == null ||
          trx.dateTime.isBefore(
            DateTime(endDate.year, endDate.month, endDate.day + 1),
          );
      return afterStart && beforeEnd;
    }).toList();

    final totalSales = transactions.fold(0, (sum, trx) => sum + trx.total);
    final totalItemsSold = transactions.fold(
      0,
      (sum, trx) => sum + trx.totalQuantity,
    );
    final totalProfit = transactions.fold(
      0,
      (sum, trx) => sum + trx.totalProfit,
    );

    final bestMap = <String, BestSellingProductReport>{};
    for (final trx in transactions) {
      for (final item in trx.items) {
        final current = bestMap[item.productId];
        bestMap[item.productId] = BestSellingProductReport(
          productId: item.productId,
          productName: item.productName,
          quantitySold: (current?.quantitySold ?? 0) + item.quantity,
          revenue: (current?.revenue ?? 0) + item.subtotal,
          profit: (current?.profit ?? 0) + item.profitTotal,
        );
      }
    }

    final bestSelling = bestMap.values.toList()
      ..sort((a, b) => b.quantitySold.compareTo(a.quantitySold));
    final lowStock = _productService
        .getProducts()
        .where((product) => product.stock <= AppConstants.lowStockLimit)
        .toList();

    return SalesReport(
      transactions: transactions,
      totalSales: totalSales,
      totalTransactions: transactions.length,
      totalItemsSold: totalItemsSold,
      totalProfit: totalProfit,
      bestSellingProducts: bestSelling,
      lowStockProducts: lowStock,
    );
  }

  Map<DateTime, int> lastSevenDaysSales() {
    final today = DateTime.now();
    final result = <DateTime, int>{};
    for (var index = 6; index >= 0; index--) {
      final day = DateTime(today.year, today.month, today.day - index);
      result[day] = 0;
    }
    for (final trx in _transactionService.getTransactions()) {
      for (final day in result.keys) {
        if (DateFormatter.isSameDay(trx.dateTime, day)) {
          result[day] = (result[day] ?? 0) + trx.total;
        }
      }
    }
    return result;
  }
}
