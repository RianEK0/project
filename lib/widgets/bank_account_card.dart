import 'package:flutter/material.dart';

import '../models/bank_account_model.dart';
import '../utils/app_colors.dart';

class BankAccountCard extends StatelessWidget {
  final BankAccountModel account;
  final VoidCallback? onCopy;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;

  const BankAccountCard({
    super.key,
    required this.account,
    this.onCopy,
    this.onEdit,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: account.isActive
              ? AppColors.softOrange
              : Colors.grey.shade200,
          child: Icon(
            Icons.account_balance,
            color: account.isActive ? AppColors.brown : Colors.grey,
          ),
        ),
        title: Text(
          account.bankName,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
        subtitle: Text(
          '${account.accountNumber}\nAtas nama ${account.accountHolder}',
        ),
        isThreeLine: true,
        trailing: Wrap(
          spacing: 4,
          children: [
            if (onCopy != null)
              IconButton(
                tooltip: 'Salin nomor rekening',
                onPressed: onCopy,
                icon: const Icon(Icons.copy),
              ),
            if (onEdit != null)
              IconButton(
                tooltip: 'Edit rekening',
                onPressed: onEdit,
                icon: const Icon(Icons.edit_outlined),
              ),
            if (onDelete != null)
              IconButton(
                tooltip: 'Hapus rekening',
                onPressed: onDelete,
                icon: const Icon(Icons.delete_outline, color: AppColors.danger),
              ),
          ],
        ),
      ),
    );
  }
}
