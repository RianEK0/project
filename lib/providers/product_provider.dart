import 'package:flutter/foundation.dart';

import '../models/product_model.dart';
import '../services/database_service.dart';
import '../services/product_service.dart';
import '../utils/app_constants.dart';

class ProductProvider extends ChangeNotifier {
  final ProductService _service = ProductService();

  List<ProductModel> _products = [];
  List<ProductModel> get products => _products;

  void loadProducts() {
    _products = _service.getProducts();
    notifyListeners();
  }

  ProductModel? getById(String id) => _service.getById(id);

  ProductModel? findByBarcode(String barcode) => _service.getByBarcode(barcode);

  Future<void> saveProduct({
    String? id,
    required String name,
    required String category,
    required int purchasePrice,
    required int sellingPrice,
    required int stock,
    required String unit,
    String? barcode,
    String? imagePath,
    String? description,
  }) async {
    final current = id == null ? null : _service.getById(id);
    final now = DateTime.now();
    final product = ProductModel(
      id: id ?? DatabaseService.createId('prd'),
      name: name.trim(),
      category: category.trim(),
      purchasePrice: purchasePrice,
      sellingPrice: sellingPrice,
      stock: stock,
      unit: unit.trim().isEmpty ? 'pcs' : unit.trim(),
      barcode: barcode?.trim().isEmpty == true ? null : barcode?.trim(),
      imagePath: imagePath,
      description: description?.trim().isEmpty == true
          ? null
          : description?.trim(),
      createdAt: current?.createdAt ?? now,
      updatedAt: now,
    );
    await _service.saveProduct(product);
    loadProducts();
  }

  Future<void> deleteProduct(String id) async {
    await _service.deleteProduct(id);
    loadProducts();
  }

  List<ProductModel> filteredProducts({String query = '', String? category}) {
    final normalizedQuery = query.trim().toLowerCase();
    return _products.where((product) {
      final matchQuery =
          normalizedQuery.isEmpty ||
          product.name.toLowerCase().contains(normalizedQuery);
      final matchCategory =
          category == null || category.isEmpty || product.category == category;
      return matchQuery && matchCategory;
    }).toList();
  }

  List<ProductModel> get lowStockProducts {
    return _products
        .where((product) => product.stock <= AppConstants.lowStockLimit)
        .toList();
  }
}
