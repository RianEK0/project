import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/cart_provider.dart';
import '../../providers/category_provider.dart';
import '../../providers/product_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/currency_formatter.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/product_card.dart';

class CashierScreen extends StatefulWidget {
  const CashierScreen({super.key});

  @override
  State<CashierScreen> createState() => _CashierScreenState();
}

class _CashierScreenState extends State<CashierScreen> {
  final _searchController = TextEditingController();
  String? _category;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<ProductProvider>().loadProducts();
      context.read<CategoryProvider>().loadCategories();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _addToCart(product) {
    final message = context.read<CartProvider>().addProduct(product);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message ?? '${product.name} masuk keranjang')),
    );
  }

  Future<void> _scanBarcode() async {
    final code = await Navigator.pushNamed(context, '/barcode-scanner');
    if (!mounted || code is! String) return;
    final product = context.read<ProductProvider>().findByBarcode(code);
    if (product == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Produk tidak ditemukan')));
      return;
    }
    _addToCart(product);
  }

  @override
  Widget build(BuildContext context) {
    final productProvider = context.watch<ProductProvider>();
    final products = productProvider.filteredProducts(
      query: _searchController.text,
      category: _category,
    );
    final allProducts = productProvider.products;
    final categories = context.watch<CategoryProvider>().categories;
    final cart = context.watch<CartProvider>();

    return Scaffold(
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        decoration: const InputDecoration(
                          prefixIcon: Icon(Icons.search),
                          labelText: 'Cari produk berdasarkan nama',
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.filled(
                      tooltip: 'Scan barcode',
                      onPressed: _scanBarcode,
                      icon: const Icon(Icons.qr_code_scanner),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String?>(
                  value: _category,
                  decoration: const InputDecoration(
                    labelText: 'Filter kategori',
                  ),
                  items: [
                    const DropdownMenuItem<String?>(
                      value: null,
                      child: Text('Semua kategori'),
                    ),
                    ...categories.map((category) {
                      return DropdownMenuItem<String?>(
                        value: category,
                        child: Text(category),
                      );
                    }),
                  ],
                  onChanged: (value) => setState(() => _category = value),
                ),
              ],
            ),
          ),
          Expanded(
            child: allProducts.isEmpty
                ? const EmptyStateWidget(
                    icon: Icons.inventory_2_outlined,
                    title: 'Belum ada produk',
                    message:
                        'Tambahkan produk terlebih dahulu sebelum transaksi',
                  )
                : products.isEmpty
                ? const EmptyStateWidget(
                    icon: Icons.search_off,
                    title: 'Produk tidak ditemukan',
                    message:
                        'Produk tanpa barcode bisa dicari manual dari nama produk',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 96),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      return ProductCard(
                        product: product,
                        onAdd: product.stock <= 0
                            ? null
                            : () => _addToCart(product),
                      );
                    },
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemCount: products.length,
                  ),
          ),
        ],
      ),
      bottomSheet: SafeArea(
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  '${cart.itemCount} item • ${CurrencyFormatter.format(cart.total)}',
                  style: const TextStyle(fontWeight: FontWeight.w800),
                ),
              ),
              FilledButton.icon(
                onPressed: cart.isEmpty
                    ? null
                    : () => Navigator.pushNamed(context, '/cart'),
                icon: const Icon(Icons.shopping_cart_checkout),
                label: const Text('Keranjang'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
