import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../utils/app_colors.dart';
import '../../utils/app_constants.dart';
import '../../utils/validators.dart';
import '../../widgets/app_logo.dart';

class FirstAdminRegisterScreen extends StatefulWidget {
  const FirstAdminRegisterScreen({super.key});

  @override
  State<FirstAdminRegisterScreen> createState() =>
      _FirstAdminRegisterScreenState();
}

class _FirstAdminRegisterScreenState extends State<FirstAdminRegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _ownerController = TextEditingController();
  final _storeController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _addressController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _ownerController.dispose();
    _storeController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _whatsappController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);
    final success = await context.read<AuthProvider>().registerFirstAdmin(
      ownerName: _ownerController.text,
      storeName: _storeController.text,
      username: _usernameController.text,
      password: _passwordController.text,
      whatsapp: _whatsappController.text,
      address: _addressController.text,
    );
    if (!mounted) return;
    setState(() => _isSubmitting = false);
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Admin pertama berhasil dibuat. Silakan login.'),
        ),
      );
      Navigator.pushReplacementNamed(context, '/login');
    } else {
      final message =
          context.read<AuthProvider>().errorMessage ?? 'Gagal mendaftar';
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daftar Admin Pertama')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const AppLogo(size: 112),
            const SizedBox(height: 12),
            Text(
              AppConstants.appName,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: AppColors.brown,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Isi data toko dan akun pemilik untuk mulai menggunakan aplikasi.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Form(
              key: _formKey,
              child: Column(
                children: [
                  CustomTextField(
                    controller: _ownerController,
                    label: 'Nama pemilik toko',
                    validator: (value) =>
                        Validators.required(value, 'Nama pemilik'),
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _storeController,
                    label: 'Nama toko',
                    validator: (value) =>
                        Validators.required(value, 'Nama toko'),
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _usernameController,
                    label: 'Username',
                    validator: (value) =>
                        Validators.required(value, 'Username'),
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _passwordController,
                    label: 'Password',
                    obscureText: true,
                    validator: Validators.minPassword,
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _confirmPasswordController,
                    label: 'Konfirmasi password',
                    obscureText: true,
                    validator: (value) => Validators.confirmPassword(
                      value,
                      _passwordController.text,
                    ),
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _whatsappController,
                    label: 'Nomor WhatsApp toko (opsional)',
                    keyboardType: TextInputType.phone,
                  ),
                  const SizedBox(height: 12),
                  CustomTextField(
                    controller: _addressController,
                    label: 'Alamat toko (opsional)',
                    maxLines: 3,
                  ),
                  const SizedBox(height: 20),
                  CustomButton(
                    label: _isSubmitting
                        ? 'Menyimpan...'
                        : 'Buat Admin Pertama',
                    icon: Icons.person_add_alt,
                    onPressed: _isSubmitting ? null : _submit,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
