import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';

class DatabaseService {
  static const usersBox = 'users';
  static const productsBox = 'products';
  static const categoriesBox = 'categories';
  static const transactionsBox = 'transactions';
  static const stockHistoriesBox = 'stock_histories';
  static const bankAccountsBox = 'bank_accounts';
  static const paymentSettingsBox = 'payment_settings';
  static const storeSettingsBox = 'store_settings';

  static Future<void> init() async {
    if (kIsWeb) {
      await Hive.initFlutter();
    } else {
      final directory = await getApplicationDocumentsDirectory();
      await Hive.initFlutter(directory.path);
    }
    await Future.wait([
      Hive.openBox(usersBox),
      Hive.openBox(productsBox),
      Hive.openBox(categoriesBox),
      Hive.openBox(transactionsBox),
      Hive.openBox(stockHistoriesBox),
      Hive.openBox(bankAccountsBox),
      Hive.openBox(paymentSettingsBox),
      Hive.openBox(storeSettingsBox),
    ]);
  }

  static Box box(String name) => Hive.box(name);

  static String createId(String prefix) {
    return '${prefix}_${DateTime.now().microsecondsSinceEpoch}';
  }
}
