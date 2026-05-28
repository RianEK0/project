import 'package:flutter/foundation.dart';

import '../models/product_model.dart';
import '../models/transaction_item_model.dart';

class CartItem {
  final String productId;
  final String productName;
  final int purchasePrice;
  final int sellingPrice;
  final int quantity;

  const CartItem({
    required this.productId,
    required this.productName,
    required this.purchasePrice,
    required this.sellingPrice,
    required this.quantity,
  });

  int get subtotal => sellingPrice * quantity;
  int get profitTotal => (sellingPrice - purchasePrice) * quantity;

  CartItem copyWith({int? quantity}) {
    return CartItem(
      productId: productId,
      productName: productName,
      purchasePrice: purchasePrice,
      sellingPrice: sellingPrice,
      quantity: quantity ?? this.quantity,
    );
  }

  TransactionItemModel toTransactionItem() {
    return TransactionItemModel(
      productId: productId,
      productName: productName,
      purchasePrice: purchasePrice,
      sellingPrice: sellingPrice,
      quantity: quantity,
      subtotal: subtotal,
      profitTotal: profitTotal,
    );
  }
}

class CartProvider extends ChangeNotifier {
  final List<CartItem> _items = [];
  int _discount = 0;

  List<CartItem> get items => List.unmodifiable(_items);
  int get discount => _discount;
  bool get isEmpty => _items.isEmpty;
  int get subtotal => _items.fold(0, (sum, item) => sum + item.subtotal);
  int get total => (subtotal - _discount).clamp(0, subtotal);
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);

  String? addProduct(ProductModel product) {
    final index = _items.indexWhere((item) => item.productId == product.id);
    final currentQty = index == -1 ? 0 : _items[index].quantity;
    if (currentQty + 1 > product.stock) {
      return 'Stok produk tidak mencukupi';
    }
    if (index == -1) {
      _items.add(
        CartItem(
          productId: product.id,
          productName: product.name,
          purchasePrice: product.purchasePrice,
          sellingPrice: product.sellingPrice,
          quantity: 1,
        ),
      );
    } else {
      _items[index] = _items[index].copyWith(quantity: currentQty + 1);
    }
    notifyListeners();
    return null;
  }

  void decrement(String productId) {
    final index = _items.indexWhere((item) => item.productId == productId);
    if (index == -1) return;
    final item = _items[index];
    if (item.quantity <= 1) {
      _items.removeAt(index);
    } else {
      _items[index] = item.copyWith(quantity: item.quantity - 1);
    }
    notifyListeners();
  }

  void remove(String productId) {
    _items.removeWhere((item) => item.productId == productId);
    notifyListeners();
  }

  void clear() {
    _items.clear();
    _discount = 0;
    notifyListeners();
  }

  void setDiscount(int value) {
    _discount = value < 0 ? 0 : value;
    notifyListeners();
  }
}
