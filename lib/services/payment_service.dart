import '../models/bank_account_model.dart';
import '../models/payment_setting_model.dart';
import 'database_service.dart';

class PaymentService {
  final _paymentBox = DatabaseService.box(DatabaseService.paymentSettingsBox);
  final _bankBox = DatabaseService.box(DatabaseService.bankAccountsBox);

  PaymentSettingModel getPaymentSetting() {
    final value = _paymentBox.get('payment');
    if (value == null) return const PaymentSettingModel();
    return PaymentSettingModel.fromMap(value as Map<dynamic, dynamic>);
  }

  Future<void> savePaymentSetting(PaymentSettingModel setting) async {
    await _paymentBox.put('payment', setting.toMap());
  }

  List<BankAccountModel> getBankAccounts({bool onlyActive = false}) {
    final accounts =
        _bankBox.values
            .map(
              (value) =>
                  BankAccountModel.fromMap(value as Map<dynamic, dynamic>),
            )
            .toList()
          ..sort(
            (a, b) =>
                a.bankName.toLowerCase().compareTo(b.bankName.toLowerCase()),
          );
    if (!onlyActive) return accounts;
    return accounts.where((account) => account.isActive).toList();
  }

  BankAccountModel? getBankAccount(String id) {
    final value = _bankBox.get(id);
    if (value == null) return null;
    return BankAccountModel.fromMap(value as Map<dynamic, dynamic>);
  }

  Future<void> saveBankAccount(BankAccountModel account) async {
    await _bankBox.put(account.id, account.toMap());
  }

  Future<void> deleteBankAccount(String id) async {
    await _bankBox.delete(id);
  }
}
