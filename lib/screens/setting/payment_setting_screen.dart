import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../providers/payment_setting_provider.dart';
import '../../utils/app_colors.dart';
import '../../widgets/bank_account_card.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_widget.dart';

class PaymentSettingScreen extends StatefulWidget {
  const PaymentSettingScreen({super.key});

  @override
  State<PaymentSettingScreen> createState() => _PaymentSettingScreenState();
}

class _PaymentSettingScreenState extends State<PaymentSettingScreen> {
  String? _pickedQrisPath;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<PaymentSettingProvider>().loadPaymentSettings();
    });
  }

  Future<void> _pickQris() async {
    final image = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (image == null) return;
    setState(() => _pickedQrisPath = image.path);
  }

  Future<void> _deleteBank(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus rekening?'),
        content: const Text(
          'Rekening tidak akan tampil lagi pada pembayaran transfer.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
    if (confirm == true && mounted) {
      await context.read<PaymentSettingProvider>().deleteBankAccount(id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PaymentSettingProvider>();
    final qrisPath = _pickedQrisPath ?? provider.setting.qrisImagePath;

    return Scaffold(
      appBar: AppBar(title: const Text('Pengaturan Pembayaran')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Pengaturan QRIS',
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 10),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Container(
                    height: 220,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppColors.softOrange,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: qrisPath == null
                        ? const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.qr_code_2,
                                size: 56,
                                color: AppColors.brown,
                              ),
                              SizedBox(height: 8),
                              Text('QRIS belum tersedia'),
                              Text('Upload QRIS toko di sini'),
                            ],
                          )
                        : ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.file(
                              File(qrisPath),
                              fit: BoxFit.contain,
                            ),
                          ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: _pickQris,
                          icon: const Icon(Icons.upload_file),
                          label: Text(
                            qrisPath == null ? 'Upload QRIS' : 'Ganti QRIS',
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (qrisPath != null)
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              await context
                                  .read<PaymentSettingProvider>()
                                  .deleteQris();
                              setState(() => _pickedQrisPath = null);
                            },
                            icon: const Icon(Icons.delete_outline),
                            label: const Text('Hapus QRIS'),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  CustomButton(
                    label: 'Simpan QRIS',
                    icon: Icons.save_outlined,
                    onPressed: _pickedQrisPath == null
                        ? null
                        : () async {
                            await context
                                .read<PaymentSettingProvider>()
                                .saveQris(_pickedQrisPath!);
                            if (!context.mounted) return;
                            setState(() => _pickedQrisPath = null);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('QRIS berhasil disimpan'),
                              ),
                            );
                          },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Transfer Bank',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              FilledButton.icon(
                onPressed: () =>
                    Navigator.pushNamed(context, '/bank-account-form'),
                icon: const Icon(Icons.add),
                label: const Text('Tambah'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (provider.bankAccounts.isEmpty)
            const SizedBox(
              height: 220,
              child: EmptyStateWidget(
                icon: Icons.account_balance_outlined,
                title: 'Belum ada rekening bank',
                message: 'Tambahkan rekening bank di Pengaturan Pembayaran',
              ),
            )
          else
            ...provider.bankAccounts.map(
              (account) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: BankAccountCard(
                  account: account,
                  onEdit: () => Navigator.pushNamed(
                    context,
                    '/bank-account-form',
                    arguments: account.id,
                  ),
                  onDelete: () => _deleteBank(account.id),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
