import 'package:flutter/material.dart';

import '../models/store_setting_model.dart';
import '../models/transaction_model.dart';
import '../utils/app_constants.dart';
import '../utils/currency_formatter.dart';
import '../utils/date_formatter.dart';

class ReceiptWidget extends StatelessWidget {
  final TransactionModel transaction;
  final StoreSettingModel storeSetting;

  const ReceiptWidget({
    super.key,
    required this.transaction,
    required this.storeSetting,
  });

  @override
  Widget build(BuildContext context) {
    final storeName = storeSetting.storeName.trim().isEmpty
        ? AppConstants.appName
        : storeSetting.storeName;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              storeName,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 20),
            ),
            if (storeSetting.address?.isNotEmpty == true)
              Text(storeSetting.address!, textAlign: TextAlign.center),
            if (storeSetting.whatsapp?.isNotEmpty == true)
              Text(
                'WhatsApp: ${storeSetting.whatsapp!}',
                textAlign: TextAlign.center,
              ),
            const Divider(height: 28),
            _row('Invoice', transaction.invoiceNumber),
            _row('Tanggal', DateFormatter.formatDateTime(transaction.dateTime)),
            _row('Kasir', transaction.cashierName),
            const Divider(height: 28),
            ...transaction.items.map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.productName,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    _row(
                      '${item.quantity} x ${CurrencyFormatter.format(item.sellingPrice)}',
                      CurrencyFormatter.format(item.subtotal),
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 28),
            _row('Subtotal', CurrencyFormatter.format(transaction.subtotal)),
            _row('Diskon', CurrencyFormatter.format(transaction.discount)),
            _row(
              'Total bayar',
              CurrencyFormatter.format(transaction.total),
              isBold: true,
            ),
            _row('Metode', transaction.paymentMethod),
            _row('Status', transaction.paymentStatus),
            const SizedBox(height: 18),
            const Text(
              'Terima kasih sudah berbelanja di Riri’s Mart',
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(String label, String value, {bool isBold = false}) {
    final style = TextStyle(
      fontWeight: isBold ? FontWeight.w800 : FontWeight.w400,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(child: Text(label, style: style)),
          const SizedBox(width: 12),
          Flexible(
            child: Text(value, textAlign: TextAlign.right, style: style),
          ),
        ],
      ),
    );
  }
}
