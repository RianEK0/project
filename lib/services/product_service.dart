import '../models/category_model.dart';
import '../models/product_model.dart';
import 'database_service.dart';

class ProductService {
  final _productBox = DatabaseService.box(DatabaseService.productsBox);
  final _categoryBox = DatabaseService.box(DatabaseService.categoriesBox);

  List<ProductModel> getProducts() {
    return _productBox.values
        .map((value) => ProductModel.fromMap(value as Map<dynamic, dynamic>))
        .toList()
      ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
  }

  ProductModel? getById(String id) {
    final value = _productBox.get(id);
    if (value == null) return null;
    return ProductModel.fromMap(value as Map<dynamic, dynamic>);
  }

  ProductModel? getByBarcode(String barcode) {
    final code = barcode.trim();
    if (code.isEmpty) return null;
    for (final product in getProducts()) {
      if (product.barcode?.trim() == code) return product;
    }
    return null;
  }

  Future<void> saveProduct(ProductModel product) async {
    await _productBox.put(product.id, product.toMap());
  }

  Future<void> deleteProduct(String id) async {
    await _productBox.delete(id);
  }

  Future<void> updateStock(String productId, int newStock) async {
    final product = getById(productId);
    if (product == null) throw Exception('Produk tidak ditemukan');
    if (newStock < 0) throw Exception('Stok tidak boleh minus');
    await saveProduct(
      product.copyWith(stock: newStock, updatedAt: DateTime.now()),
    );
  }

  List<CategoryModel> getCustomCategories() {
    return _categoryBox.values
        .map((value) => CategoryModel.fromMap(value as Map<dynamic, dynamic>))
        .toList()
      ..sort((a, b) => a.name.toLowerCase().compareTo(b.name.toLowerCase()));
  }

  Future<void> saveCategory(CategoryModel category) async {
    await _categoryBox.put(category.id, category.toMap());
  }
}
