class StockHistoryModel {
  final String id;
  final String productId;
  final String productName;
  final String type;
  final int quantity;
  final String? supplier;
  final String? reason;
  final String? note;
  final DateTime dateTime;
  final String userId;
  final String userName;

  const StockHistoryModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.type,
    required this.quantity,
    this.supplier,
    this.reason,
    this.note,
    required this.dateTime,
    required this.userId,
    required this.userName,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'productId': productId,
      'productName': productName,
      'type': type,
      'quantity': quantity,
      'supplier': supplier,
      'reason': reason,
      'note': note,
      'dateTime': dateTime.toIso8601String(),
      'userId': userId,
      'userName': userName,
    };
  }

  factory StockHistoryModel.fromMap(Map<dynamic, dynamic> map) {
    return StockHistoryModel(
      id: map['id'] as String,
      productId: map['productId'] as String,
      productName: map['productName'] as String,
      type: map['type'] as String,
      quantity: map['quantity'] as int,
      supplier: map['supplier'] as String?,
      reason: map['reason'] as String?,
      note: map['note'] as String?,
      dateTime: DateTime.parse(map['dateTime'] as String),
      userId: map['userId'] as String,
      userName: map['userName'] as String,
    );
  }
}
