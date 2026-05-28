import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../models/store_setting_model.dart';
import '../../providers/store_setting_provider.dart';
import '../../utils/app_colors.dart';
import '../../utils/app_constants.dart';
import '../../utils/validators.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class StoreSettingScreen extends StatefulWidget {
  const StoreSettingScreen({super.key});

  @override
  State<StoreSettingScreen> createState() => _StoreSettingScreenState();
}

class _StoreSettingScreenState extends State<StoreSettingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _storeController = TextEditingController();
  final _ownerController = TextEditingController();
  final _addressController = TextEditingController();
  final _whatsappController = TextEditingController();
  String? _logoPath;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;
    _initialized = true;
    final setting = context.read<StoreSettingProvider>().setting;
    _storeController.text = setting.storeName;
    _ownerController.text = setting.ownerName;
    _addressController.text = setting.address ?? '';
    _whatsappController.text = setting.whatsapp ?? '';
    _logoPath = setting.logoPath;
  }

  @override
  void dispose() {
    _storeController.dispose();
    _ownerController.dispose();
    _addressController.dispose();
    _whatsappController.dispose();
    super.dispose();
  }

  Future<void> _pickLogo() async {
    final image = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      imageQuality: 75,
    );
    if (image != null) setState(() => _logoPath = image.path);
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    await context.read<StoreSettingProvider>().saveStoreSetting(
      StoreSettingModel(
        storeName: _storeController.text.trim().isEmpty
            ? AppConstants.appName
            : _storeController.text.trim(),
        ownerName: _ownerController.text.trim(),
        address: _addressController.text.trim().isEmpty
            ? null
            : _addressController.text.trim(),
        whatsapp: _whatsappController.text.trim().isEmpty
            ? null
            : _whatsappController.text.trim(),
        logoPath: _logoPath,
        updatedAt: DateTime.now(),
      ),
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Pengaturan toko berhasil disimpan')),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Pengaturan Toko')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            InkWell(
              onTap: _pickLogo,
              borderRadius: BorderRadius.circular(8),
              child: Container(
                height: 150,
                decoration: BoxDecoration(
                  color: AppColors.softOrange,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.border),
                ),
                child: _logoPath == null
                    ? const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.add_photo_alternate_outlined,
                            size: 36,
                            color: AppColors.brown,
                          ),
                          SizedBox(height: 8),
                          Text('Logo toko opsional'),
                        ],
                      )
                    : ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(File(_logoPath!), fit: BoxFit.cover),
                      ),
              ),
            ),
            const SizedBox(height: 16),
            CustomTextField(
              controller: _storeController,
              label: 'Nama toko',
              validator: (value) => Validators.required(value, 'Nama toko'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _ownerController,
              label: 'Nama pemilik toko',
              validator: (value) =>
                  Validators.required(value, 'Nama pemilik toko'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _addressController,
              label: 'Alamat toko',
              maxLines: 3,
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _whatsappController,
              label: 'Nomor WhatsApp toko',
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 20),
            CustomButton(
              label: 'Simpan Pengaturan',
              icon: Icons.save_outlined,
              onPressed: _save,
            ),
          ],
        ),
      ),
    );
  }
}
