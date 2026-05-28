import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/category_provider.dart';
import '../../providers/product_provider.dart';
import '../../utils/role_helper.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/empty_state_widget.dart';
import '../../widgets/product_card.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
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

  Future<void> _deleteProduct(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus produk?'),
        content: const Text(
          'Produk yang dihapus tidak bisa digunakan untuk transaksi baru.',
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
    if (confirm != true || !mounted) return;
    await context.read<ProductProvider>().deleteProduct(id);
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = RoleHelper.isAdmin(
      context.watch<AuthProvider>().currentUser?.role,
    );
    final products = context.watch<ProductProvider>().filteredProducts(
      query: _searchController.text,
      category: _category,
    );
    final allProducts = context.watch<ProductProvider>().products;
    final categories = context.watch<CategoryProvider>().categories;

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
                    labelText: 'Cari produk',
                  ),
                  onChanged: (_) => setState(() {}),
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
                ? EmptyStateWidget(
                    icon: Icons.inventory_2_outlined,
                    title: 'Belum ada produk',
                    message: 'Tambahkan produk pertama untuk mulai berjualan',
                    action: isAdmin
                        ? CustomButton(
                            label: '+ Tambah Produk',
                            onPressed: () =>
                                Navigator.pushNamed(context, '/product-form'),
                          )
                        : null,
                  )
                : products.isEmpty
                ? const EmptyStateWidget(
                    icon: Icons.search_off,
                    title: 'Produk tidak ditemukan',
                    message: 'Coba kata kunci atau kategori lain',
                  )
                : ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 88),
                    itemBuilder: (context, index) {
                      final product = products[index];
                      return ProductCard(
                        product: product,
                        showAdminActions: isAdmin,
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/product-detail',
                          arguments: product.id,
                        ),
                        onEdit: () => Navigator.pushNamed(
                          context,
                          '/product-form',
                          arguments: product.id,
                        ),
                        onDelete: () => _deleteProduct(product.id),
                      );
                    },
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemCount: products.length,
                  ),
          ),
        ],
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              onPressed: () => Navigator.pushNamed(context, '/product-form'),
              icon: const Icon(Icons.add),
              label: const Text('Tambah Produk'),
            )
          : null,
    );
  }
}
