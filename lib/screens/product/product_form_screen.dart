import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../models/product_model.dart';
import '../../providers/category_provider.dart';
import '../../providers/product_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/currency_formatter.dart';
import '../../utils/validators.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class ProductFormScreen extends StatefulWidget {
  const ProductFormScreen({super.key});

  @override
  State<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends State<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _purchaseController = TextEditingController();
  final _sellingController = TextEditingController();
  final _stockController = TextEditingController();
  final _unitController = TextEditingController(text: 'pcs');
  final _barcodeController = TextEditingController();
  final _descriptionController = TextEditingController();
  ProductModel? _product;
  String? _category;
  String? _imagePath;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;
    _initialized = true;
    context.read<CategoryProvider>().loadCategories();
    final id = ModalRoute.of(context)?.settings.arguments as String?;
    if (id != null) {
      _product = context.read<ProductProvider>().getById(id);
      final product = _product;
      if (product != null) {
        _nameController.text = product.name;
        _purchaseController.text = product.purchasePrice.toString();
        _sellingController.text = product.sellingPrice.toString();
        _stockController.text = product.stock.toString();
        _unitController.text = product.unit;
        _barcodeController.text = product.barcode ?? '';
        _descriptionController.text = product.description ?? '';
        _category = product.category;
        _imagePath = product.imagePath;
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _purchaseController.dispose();
    _sellingController.dispose();
    _stockController.dispose();
    _unitController.dispose();
    _barcodeController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final image = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 75,
    );
    if (image == null) return;
    setState(() => _imagePath = image.path);
  }

  Future<void> _scanBarcode() async {
    final result = await Navigator.pushNamed(context, '/barcode-scanner');
    if (result is String && result.isNotEmpty) {
      _barcodeController.text = result;
    }
  }

  Future<void> _addCategory() async {
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tambah kategori'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Nama kategori'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text),
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
    controller.dispose();
    if (name == null || name.trim().isEmpty || !mounted) return;
    await context.read<CategoryProvider>().addCategory(name);
    setState(() => _category = name.trim());
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_category == null || _category!.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Kategori wajib dipilih')));
      return;
    }
    await context.read<ProductProvider>().saveProduct(
      id: _product?.id,
      name: _nameController.text,
      category: _category!,
      purchasePrice: CurrencyFormatter.parseToInt(_purchaseController.text),
      sellingPrice: CurrencyFormatter.parseToInt(_sellingController.text),
      stock: int.parse(_stockController.text),
      unit: _unitController.text,
      barcode: _barcodeController.text,
      imagePath: _imagePath,
      description: _descriptionController.text,
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _product == null
              ? 'Produk berhasil ditambahkan'
              : 'Produk diperbarui',
        ),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final categories = {
      ...context.watch<CategoryProvider>().categories,
      if (_category != null) _category!,
    }.toList()..sort((a, b) => a.toLowerCase().compareTo(b.toLowerCase()));

    return Scaffold(
      appBar: AppBar(
        title: Text(_product == null ? 'Tambah Produk' : 'Edit Produk'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            InkWell(
              onTap: _pickImage,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                height: 150,
                decoration: BoxDecoration(
                  color: AppColors.softOrange,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.border),
                ),
                child: _imagePath == null
                    ? const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.add_photo_alternate_outlined,
                            size: 36,
                            color: AppColors.brown,
                          ),
                          SizedBox(height: 8),
                          Text('Foto produk opsional'),
                        ],
                      )
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(File(_imagePath!), fit: BoxFit.cover),
                      ),
              ),
            ),
            const SizedBox(height: 16),
            CustomTextField(
              controller: _nameController,
              label: 'Nama produk',
              validator: (value) => Validators.required(value, 'Nama produk'),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _category,
                    decoration: const InputDecoration(labelText: 'Kategori'),
                    items: categories
                        .map(
                          (category) => DropdownMenuItem(
                            value: category,
                            child: Text(category),
                          ),
                        )
                        .toList(),
                    validator: (value) =>
                        value == null ? 'Kategori wajib dipilih' : null,
                    onChanged: (value) => setState(() => _category = value),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  tooltip: 'Tambah kategori',
                  onPressed: _addCategory,
                  icon: const Icon(Icons.add),
                ),
              ],
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _purchaseController,
              label: 'Harga beli',
              keyboardType: TextInputType.number,
              validator: (value) => Validators.number(value, 'Harga beli'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _sellingController,
              label: 'Harga jual',
              keyboardType: TextInputType.number,
              validator: (value) => Validators.number(value, 'Harga jual'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _stockController,
              label: 'Stok awal / stok saat ini',
              keyboardType: TextInputType.number,
              validator: (value) => Validators.nonNegativeNumber(value, 'Stok'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _unitController,
              label: 'Satuan',
              validator: (value) => Validators.required(value, 'Satuan'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _barcodeController,
              label: 'Barcode opsional',
              suffixIcon: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    tooltip: 'Scan barcode',
                    onPressed: _scanBarcode,
                    icon: const Icon(Icons.qr_code_scanner),
                  ),
                  IconButton(
                    tooltip: 'Kosongkan barcode',
                    onPressed: () => _barcodeController.clear(),
                    icon: const Icon(Icons.clear),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _descriptionController,
              label: 'Deskripsi produk opsional',
              maxLines: 3,
            ),
            const SizedBox(height: 20),
            CustomButton(
              label: 'Simpan Produk',
              icon: Icons.save_outlined,
              onPressed: _save,
            ),
          ],
        ),
      ),
    );
  }
}
