import '../models/stock_history_model.dart';
import '../utils/app_constants.dart';
import 'database_service.dart';
import 'product_service.dart';

class StockService {
  final _box = DatabaseService.box(DatabaseService.stockHistoriesBox);
  final ProductService _productService = ProductService();

  List<StockHistoryModel> getHistories() {
    return _box.values
        .map(
          (value) => StockHistoryModel.fromMap(value as Map<dynamic, dynamic>),
        )
        .toList()
      ..sort((a, b) => b.dateTime.compareTo(a.dateTime));
  }

  Future<void> recordStockIn(StockHistoryModel history) async {
    final product = _productService.getById(history.productId);
    if (product == null) throw Exception('Produk tidak ditemukan');
    await _productService.updateStock(
      product.id,
      product.stock + history.quantity,
    );
    await _box.put(history.id, history.toMap());
  }

  Future<void> recordStockOut(StockHistoryModel history) async {
    final product = _productService.getById(history.productId);
    if (product == null) throw Exception('Produk tidak ditemukan');
    final updatedStock = product.stock - history.quantity;
    if (updatedStock < 0) {
      throw Exception('Jumlah stok keluar melebihi stok tersedia');
    }
    await _productService.updateStock(product.id, updatedStock);
    await _box.put(history.id, history.toMap());
  }

  List<StockHistoryModel> byType(String type) {
    return getHistories().where((history) => history.type == type).toList();
  }

  List<StockHistoryModel> get stockInHistories => byType(AppConstants.stockIn);
  List<StockHistoryModel> get stockOutHistories =>
      byType(AppConstants.stockOut);
}
