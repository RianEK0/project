import '../models/transaction_model.dart';
import 'database_service.dart';

class TransactionService {
  final _box = DatabaseService.box(DatabaseService.transactionsBox);

  List<TransactionModel> getTransactions() {
    return _box.values
        .map(
          (value) => TransactionModel.fromMap(value as Map<dynamic, dynamic>),
        )
        .toList()
      ..sort((a, b) => b.dateTime.compareTo(a.dateTime));
  }

  TransactionModel? getById(String id) {
    final value = _box.get(id);
    if (value == null) return null;
    return TransactionModel.fromMap(value as Map<dynamic, dynamic>);
  }

  Future<void> saveTransaction(TransactionModel transaction) async {
    await _box.put(transaction.id, transaction.toMap());
  }

  String createInvoiceNumber() {
    final now = DateTime.now();
    final date =
        '${now.year}${now.month.toString().padLeft(2, '0')}${now.day.toString().padLeft(2, '0')}';
    final time =
        '${now.hour.toString().padLeft(2, '0')}${now.minute.toString().padLeft(2, '0')}${now.second.toString().padLeft(2, '0')}';
    return 'INV-$date-$time';
  }
}
