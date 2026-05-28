import 'package:flutter/foundation.dart';

import '../models/bank_account_model.dart';
import '../models/payment_setting_model.dart';
import '../services/database_service.dart';
import '../services/payment_service.dart';

class PaymentSettingProvider extends ChangeNotifier {
  final PaymentService _service = PaymentService();

  PaymentSettingModel _setting = const PaymentSettingModel();
  List<BankAccountModel> _bankAccounts = [];

  PaymentSettingModel get setting => _setting;
  List<BankAccountModel> get bankAccounts => _bankAccounts;
  List<BankAccountModel> get activeBankAccounts =>
      _bankAccounts.where((account) => account.isActive).toList();

  void loadPaymentSettings() {
    _setting = _service.getPaymentSetting();
    _bankAccounts = _service.getBankAccounts();
    notifyListeners();
  }

  BankAccountModel? getBankAccount(String id) => _service.getBankAccount(id);

  Future<void> saveQris(String path) async {
    _setting = _setting.copyWith(
      qrisImagePath: path,
      updatedAt: DateTime.now(),
    );
    await _service.savePaymentSetting(_setting);
    loadPaymentSettings();
  }

  Future<void> deleteQris() async {
    _setting = _setting.copyWith(clearQris: true, updatedAt: DateTime.now());
    await _service.savePaymentSetting(_setting);
    loadPaymentSettings();
  }

  Future<void> saveBankAccount({
    String? id,
    required String bankName,
    required String accountNumber,
    required String accountHolder,
    required bool isActive,
  }) async {
    final account = BankAccountModel(
      id: id ?? DatabaseService.createId('bank'),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      isActive: isActive,
    );
    await _service.saveBankAccount(account);
    loadPaymentSettings();
  }

  Future<void> deleteBankAccount(String id) async {
    await _service.deleteBankAccount(id);
    loadPaymentSettings();
  }
}
