import 'package:flutter/foundation.dart';

import '../models/transaction_model.dart';
import '../providers/cart_provider.dart';
import '../services/database_service.dart';
import '../services/product_service.dart';
import '../services/transaction_service.dart';
import '../models/user_model.dart';

class TransactionProvider extends ChangeNotifier {
  final TransactionService _transactionService = TransactionService();
  final ProductService _productService = ProductService();

  List<TransactionModel> _transactions = [];
  List<TransactionModel> get transactions => _transactions;

  void loadTransactions() {
    _transactions = _transactionService.getTransactions();
    notifyListeners();
  }

  TransactionModel? getById(String id) => _transactionService.getById(id);

  Future<TransactionModel> checkout({
    required List<CartItem> cartItems,
    required int discount,
    required String paymentMethod,
    required String paymentStatus,
    required UserModel cashier,
    int? paidAmount,
    int? changeAmount,
  }) async {
    if (cartItems.isEmpty) throw Exception('Keranjang masih kosong');

    for (final item in cartItems) {
      final product = _productService.getById(item.productId);
      if (product == null) {
        throw Exception('${item.productName} tidak ditemukan');
      }
      if (product.stock < item.quantity) {
        throw Exception('Stok produk tidak mencukupi');
      }
    }

    for (final item in cartItems) {
      final product = _productService.getById(item.productId)!;
      await _productService.updateStock(
        product.id,
        product.stock - item.quantity,
      );
    }

    final subtotal = cartItems.fold(0, (sum, item) => sum + item.subtotal);
    final total = (subtotal - discount).clamp(0, subtotal);
    final transaction = TransactionModel(
      id: DatabaseService.createId('trx'),
      invoiceNumber: _transactionService.createInvoiceNumber(),
      dateTime: DateTime.now(),
      cashierId: cashier.id,
      cashierName: cashier.name,
      items: cartItems.map((item) => item.toTransactionItem()).toList(),
      subtotal: subtotal,
      discount: discount,
      total: total,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      paidAmount: paidAmount,
      changeAmount: changeAmount,
    );
    await _transactionService.saveTransaction(transaction);
    loadTransactions();
    return transaction;
  }

  List<TransactionModel> visibleFor(UserModel? user) {
    if (user == null) return [];
    if (user.isAdmin) return _transactions;
    return _transactions.where((trx) => trx.cashierId == user.id).toList();
  }
}
