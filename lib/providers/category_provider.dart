import 'package:flutter/foundation.dart';

import '../models/category_model.dart';
import '../services/database_service.dart';
import '../services/product_service.dart';
import '../utils/app_constants.dart';

class CategoryProvider extends ChangeNotifier {
  final ProductService _service = ProductService();

  List<CategoryModel> _customCategories = [];
  List<CategoryModel> get customCategories => _customCategories;

  void loadCategories() {
    _customCategories = _service.getCustomCategories();
    notifyListeners();
  }

  List<String> get categories {
    final names = <String>{...AppConstants.defaultCategories};
    for (final category in _customCategories) {
      names.add(category.name);
    }
    return names.toList()
      ..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));
  }

  Future<void> addCategory(String name) async {
    final trimmed = name.trim();
    if (trimmed.isEmpty) throw Exception('Kategori wajib diisi');
    final exists = categories.any(
      (category) => category.toLowerCase() == trimmed.toLowerCase(),
    );
    if (exists) return;
    await _service.saveCategory(
      CategoryModel(
        id: DatabaseService.createId('cat'),
        name: trimmed,
        createdAt: DateTime.now(),
      ),
    );
    loadCategories();
  }
}
