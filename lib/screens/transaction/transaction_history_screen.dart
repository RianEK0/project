import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/transaction_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/transaction_provider.dart';
import '../../utils/app_constants.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/transaction_card.dart';

class TransactionHistoryScreen extends StatefulWidget {
  const TransactionHistoryScreen({super.key});

  @override
  State<TransactionHistoryScreen> createState() =>
      _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  final _searchController = TextEditingController();
  DateTime? _date;
  String? _method;
  String? _status;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<TransactionProvider>().loadTransactions();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<TransactionModel> _filtered(List<TransactionModel> data) {
    final query = _searchController.text.trim().toLowerCase();
    return data.where((trx) {
      final matchQuery =
          query.isEmpty ||
          trx.invoiceNumber.toLowerCase().contains(query) ||
          trx.cashierName.toLowerCase().contains(query);
      final matchDate =
          _date == null || DateFormatter.isSameDay(trx.dateTime, _date!);
      final matchMethod = _method == null || trx.paymentMethod == _method;
      final matchStatus = _status == null || trx.paymentStatus == _status;
      return matchQuery && matchDate && matchMethod && matchStatus;
    }).toList();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null) setState(() => _date = picked);
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    final visible = context.watch<TransactionProvider>().visibleFor(user);
    final transactions = _filtered(visible);

    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    prefixIcon: Icon(Icons.search),
                    labelText: 'Cari invoice atau kasir',
                  ),
                  onChanged: (_) => setState(() {}),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    FilterChip(
                      label: Text(
                        _date == null
                            ? 'Tanggal'
                            : DateFormatter.formatDate(_date!),
                      ),
                      selected: _date != null,
                      onSelected: (_) => _pickDate(),
                      onDeleted: _date == null
                          ? null
                          : () => setState(() => _date = null),
                    ),
                    DropdownButton<String?>(
                      value: _method,
                      hint: const Text('Metode'),
                      items: const [
                        DropdownMenuItem<String?>(
                          value: null,
                          child: Text('Semua metode'),
                        ),
                        DropdownMenuItem(
                          value: AppConstants.paymentCash,
                          child: Text('Tunai'),
                        ),
                        DropdownMenuItem(
                          value: AppConstants.paymentQris,
                          child: Text('QRIS'),
                        ),
                        DropdownMenuItem(
                          value: AppConstants.paymentTransfer,
                          child: Text('Transfer Bank'),
                        ),
                      ],
                      onChanged: (value) => setState(() => _method = value),
                    ),
                    DropdownButton<String?>(
                      value: _status,
                      hint: const Text('Status'),
                      items: const [
                        DropdownMenuItem<String?>(
                          value: null,
                          child: Text('Semua status'),
                        ),
                        DropdownMenuItem(
                          value: AppConstants.statusPaid,
                          child: Text('Lunas'),
                        ),
                        DropdownMenuItem(
                          value: AppConstants.statusManualPaid,
                          child: Text('Lunas Manual'),
                        ),
                        DropdownMenuItem(
                          value: AppConstants.statusPending,
                          child: Text('Menunggu Konfirmasi'),
                        ),
                        DropdownMenuItem(
                          value: AppConstants.statusCanceled,
                          child: Text('Dibatalkan'),
                        ),
                      ],
                      onChanged: (value) => setState(() => _status = value),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: visible.isEmpty
                ? const EmptyStateWidget(
                    icon: Icons.receipt_long_outlined,
                    title: 'Belum ada transaksi',
                    message:
                        'Riwayat transaksi akan muncul setelah penjualan selesai',
                  )
                : transactions.isEmpty
                ? const EmptyStateWidget(
                    icon: Icons.search_off,
                    title: 'Transaksi tidak ditemukan',
                    message: 'Coba ubah filter transaksi',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
                    itemBuilder: (context, index) {
                      final trx = transactions[index];
                      return TransactionCard(
                        transaction: trx,
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/transaction-detail',
                          arguments: trx.id,
                        ),
                      );
                    },
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemCount: transactions.length,
                  ),
          ),
        ],
      ),
    );
  }
}
