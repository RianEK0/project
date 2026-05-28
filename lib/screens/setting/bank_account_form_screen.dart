import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/bank_account_model.dart';
import '../../providers/payment_setting_provider.dart';
import '../../utils/validators.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class BankAccountFormScreen extends StatefulWidget {
  const BankAccountFormScreen({super.key});

  @override
  State<BankAccountFormScreen> createState() => _BankAccountFormScreenState();
}

class _BankAccountFormScreenState extends State<BankAccountFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _bankController = TextEditingController();
  final _numberController = TextEditingController();
  final _holderController = TextEditingController();
  BankAccountModel? _account;
  bool _isActive = true;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;
    _initialized = true;
    final id = ModalRoute.of(context)?.settings.arguments as String?;
    if (id != null) {
      _account = context.read<PaymentSettingProvider>().getBankAccount(id);
      final account = _account;
      if (account != null) {
        _bankController.text = account.bankName;
        _numberController.text = account.accountNumber;
        _holderController.text = account.accountHolder;
        _isActive = account.isActive;
      }
    }
  }

  @override
  void dispose() {
    _bankController.dispose();
    _numberController.dispose();
    _holderController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    await context.read<PaymentSettingProvider>().saveBankAccount(
      id: _account?.id,
      bankName: _bankController.text,
      accountNumber: _numberController.text,
      accountHolder: _holderController.text,
      isActive: _isActive,
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _account == null ? 'Rekening ditambahkan' : 'Rekening diperbarui',
        ),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_account == null ? 'Tambah Rekening' : 'Edit Rekening'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            CustomTextField(
              controller: _bankController,
              label: 'Nama bank',
              validator: (value) => Validators.required(value, 'Nama bank'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _numberController,
              label: 'Nomor rekening',
              keyboardType: TextInputType.number,
              validator: Validators.bankNumber,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _holderController,
              label: 'Atas nama rekening',
              validator: (value) =>
                  Validators.required(value, 'Nama pemilik rekening'),
            ),
            const SizedBox(height: 8),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _isActive,
              title: const Text('Rekening aktif'),
              onChanged: (value) => setState(() => _isActive = value),
            ),
            const SizedBox(height: 20),
            CustomButton(
              label: 'Simpan Rekening',
              icon: Icons.save_outlined,
              onPressed: _save,
            ),
          ],
        ),
      ),
    );
  }
}
