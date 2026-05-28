class TransactionItemModel {
  final String productId;
  final String productName;
  final int purchasePrice;
  final int sellingPrice;
  final int quantity;
  final int subtotal;
  final int profitTotal;

  const TransactionItemModel({
    required this.productId,
    required this.productName,
    required this.purchasePrice,
    required this.sellingPrice,
    required this.quantity,
    required this.subtotal,
    required this.profitTotal,
  });

  Map<String, dynamic> toMap() {
    return {
      'productId': productId,
      'productName': productName,
      'purchasePrice': purchasePrice,
      'sellingPrice': sellingPrice,
      'quantity': quantity,
      'subtotal': subtotal,
      'profitTotal': profitTotal,
    };
  }

  factory TransactionItemModel.fromMap(Map<dynamic, dynamic> map) {
    return TransactionItemModel(
      productId: map['productId'] as String,
      productName: map['productName'] as String,
      purchasePrice: map['purchasePrice'] as int,
      sellingPrice: map['sellingPrice'] as int,
      quantity: map['quantity'] as int,
      subtotal: map['subtotal'] as int,
      profitTotal: map['profitTotal'] as int,
    );
  }
}
