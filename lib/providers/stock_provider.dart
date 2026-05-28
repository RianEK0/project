import 'package:flutter/foundation.dart';

import '../models/product_model.dart';
import '../models/stock_history_model.dart';
import '../models/user_model.dart';
import '../services/database_service.dart';
import '../services/stock_service.dart';
import '../utils/app_constants.dart';

class StockProvider extends ChangeNotifier {
  final StockService _service = StockService();

  List<StockHistoryModel> _histories = [];
  List<StockHistoryModel> get histories => _histories;

  void loadHistories() {
    _histories = _service.getHistories();
    notifyListeners();
  }

  Future<void> recordIn({
    required ProductModel product,
    required int quantity,
    String? supplier,
    String? note,
    required UserModel user,
  }) async {
    await _service.recordStockIn(
      StockHistoryModel(
        id: DatabaseService.createId('stk'),
        productId: product.id,
        productName: product.name,
        type: AppConstants.stockIn,
        quantity: quantity,
        supplier: supplier?.trim().isEmpty == true ? null : supplier?.trim(),
        note: note?.trim().isEmpty == true ? null : note?.trim(),
        dateTime: DateTime.now(),
        userId: user.id,
        userName: user.name,
      ),
    );
    loadHistories();
  }

  Future<void> recordOut({
    required ProductModel product,
    required int quantity,
    required String reason,
    String? note,
    required UserModel user,
  }) async {
    await _service.recordStockOut(
      StockHistoryModel(
        id: DatabaseService.createId('stk'),
        productId: product.id,
        productName: product.name,
        type: AppConstants.stockOut,
        quantity: quantity,
        reason: reason,
        note: note?.trim().isEmpty == true ? null : note?.trim(),
        dateTime: DateTime.now(),
        userId: user.id,
        userName: user.name,
      ),
    );
    loadHistories();
  }
}
