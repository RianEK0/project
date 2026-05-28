import 'package:flutter/material.dart';

import '../models/transaction_model.dart';
import '../utils/app_colors.dart';
import '../utils/currency_formatter.dart';
import '../utils/date_formatter.dart';

class TransactionCard extends StatelessWidget {
  final TransactionModel transaction;
  final VoidCallback? onTap;

  const TransactionCard({super.key, required this.transaction, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: const CircleAvatar(
          backgroundColor: AppColors.softOrange,
          child: Icon(Icons.receipt_long, color: AppColors.brown),
        ),
        title: Text(
          transaction.invoiceNumber,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
        subtitle: Text(
          '${DateFormatter.formatDateTime(transaction.dateTime)}\n${transaction.cashierName} • ${transaction.paymentMethod} • ${transaction.paymentStatus}',
        ),
        isThreeLine: true,
        trailing: Text(
          CurrencyFormatter.format(transaction.total),
          style: const TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.brown,
          ),
        ),
      ),
    );
  }
}
