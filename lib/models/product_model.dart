class ProductModel {
  final String id;
  final String name;
  final String category;
  final int purchasePrice;
  final int sellingPrice;
  final int stock;
  final String unit;
  final String? barcode;
  final String? imagePath;
  final String? description;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ProductModel({
    required this.id,
    required this.name,
    required this.category,
    required this.purchasePrice,
    required this.sellingPrice,
    required this.stock,
    required this.unit,
    this.barcode,
    this.imagePath,
    this.description,
    required this.createdAt,
    required this.updatedAt,
  });

  int get profitPerItem => sellingPrice - purchasePrice;
  bool get hasBarcode => barcode != null && barcode!.trim().isNotEmpty;

  ProductModel copyWith({
    String? id,
    String? name,
    String? category,
    int? purchasePrice,
    int? sellingPrice,
    int? stock,
    String? unit,
    String? barcode,
    bool clearBarcode = false,
    String? imagePath,
    bool clearImage = false,
    String? description,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ProductModel(
      id: id ?? this.id,
      name: name ?? this.name,
      category: category ?? this.category,
      purchasePrice: purchasePrice ?? this.purchasePrice,
      sellingPrice: sellingPrice ?? this.sellingPrice,
      stock: stock ?? this.stock,
      unit: unit ?? this.unit,
      barcode: clearBarcode ? null : (barcode ?? this.barcode),
      imagePath: clearImage ? null : (imagePath ?? this.imagePath),
      description: description ?? this.description,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'purchasePrice': purchasePrice,
      'sellingPrice': sellingPrice,
      'stock': stock,
      'unit': unit,
      'barcode': barcode,
      'imagePath': imagePath,
      'description': description,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory ProductModel.fromMap(Map<dynamic, dynamic> map) {
    return ProductModel(
      id: map['id'] as String,
      name: map['name'] as String,
      category: map['category'] as String,
      purchasePrice: map['purchasePrice'] as int,
      sellingPrice: map['sellingPrice'] as int,
      stock: map['stock'] as int,
      unit: map['unit'] as String? ?? 'pcs',
      barcode: map['barcode'] as String?,
      imagePath: map['imagePath'] as String?,
      description: map['description'] as String?,
      createdAt: DateTime.parse(map['createdAt'] as String),
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }
}
