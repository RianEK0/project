import 'transaction_item_model.dart';

class TransactionModel {
  final String id;
  final String invoiceNumber;
  final DateTime dateTime;
  final String cashierId;
  final String cashierName;
  final List<TransactionItemModel> items;
  final int subtotal;
  final int discount;
  final int total;
  final String paymentMethod;
  final String paymentStatus;
  final int? paidAmount;
  final int? changeAmount;

  const TransactionModel({
    required this.id,
    required this.invoiceNumber,
    required this.dateTime,
    required this.cashierId,
    required this.cashierName,
    required this.items,
    required this.subtotal,
    required this.discount,
    required this.total,
    required this.paymentMethod,
    required this.paymentStatus,
    this.paidAmount,
    this.changeAmount,
  });

  int get totalQuantity => items.fold(0, (sum, item) => sum + item.quantity);
  int get totalProfit => items.fold(0, (sum, item) => sum + item.profitTotal);

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'invoiceNumber': invoiceNumber,
      'dateTime': dateTime.toIso8601String(),
      'cashierId': cashierId,
      'cashierName': cashierName,
      'items': items.map((item) => item.toMap()).toList(),
      'subtotal': subtotal,
      'discount': discount,
      'total': total,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'paidAmount': paidAmount,
      'changeAmount': changeAmount,
    };
  }

  factory TransactionModel.fromMap(Map<dynamic, dynamic> map) {
    final rawItems = (map['items'] as List<dynamic>? ?? <dynamic>[]);
    return TransactionModel(
      id: map['id'] as String,
      invoiceNumber: map['invoiceNumber'] as String,
      dateTime: DateTime.parse(map['dateTime'] as String),
      cashierId: map['cashierId'] as String,
      cashierName: map['cashierName'] as String,
      items: rawItems
          .map(
            (item) =>
                TransactionItemModel.fromMap(item as Map<dynamic, dynamic>),
          )
          .toList(),
      subtotal: map['subtotal'] as int,
      discount: map['discount'] as int? ?? 0,
      total: map['total'] as int,
      paymentMethod: map['paymentMethod'] as String,
      paymentStatus: map['paymentStatus'] as String,
      paidAmount: map['paidAmount'] as int?,
      changeAmount: map['changeAmount'] as int?,
    );
  }
}
