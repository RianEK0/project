import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/user_model.dart';
import '../../providers/user_provider.dart';
import '../../utils/app_constants.dart';
import '../../utils/validators.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class UserFormScreen extends StatefulWidget {
  const UserFormScreen({super.key});

  @override
  State<UserFormScreen> createState() => _UserFormScreenState();
}

class _UserFormScreenState extends State<UserFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  UserModel? _user;
  String _role = AppConstants.roleCashier;
  bool _isActive = true;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;
    _initialized = true;
    final id = ModalRoute.of(context)?.settings.arguments as String?;
    if (id != null) {
      _user = context.read<UserProvider>().getById(id);
      final user = _user;
      if (user != null) {
        _nameController.text = user.name;
        _usernameController.text = user.username;
        _passwordController.text = user.password;
        _role = user.role;
        _isActive = user.isActive;
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    try {
      await context.read<UserProvider>().saveUser(
        id: _user?.id,
        name: _nameController.text,
        username: _usernameController.text,
        password: _passwordController.text,
        role: _role,
        isActive: _isActive,
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _user == null ? 'User berhasil ditambahkan' : 'User diperbarui',
          ),
        ),
      );
      Navigator.pop(context);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(error.toString().replaceFirst('Exception: ', '')),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFirstAdmin = _user?.isFirstAdmin == true;

    return Scaffold(
      appBar: AppBar(title: Text(_user == null ? 'Tambah User' : 'Edit User')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            CustomTextField(
              controller: _nameController,
              label: 'Nama',
              validator: (value) => Validators.required(value, 'Nama'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _usernameController,
              label: 'Username',
              validator: (value) => Validators.required(value, 'Username'),
            ),
            const SizedBox(height: 12),
            CustomTextField(
              controller: _passwordController,
              label: 'Password',
              obscureText: true,
              validator: Validators.minPassword,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _role,
              decoration: const InputDecoration(labelText: 'Role'),
              items: const [
                DropdownMenuItem(
                  value: AppConstants.roleAdmin,
                  child: Text('Admin'),
                ),
                DropdownMenuItem(
                  value: AppConstants.roleCashier,
                  child: Text('Kasir'),
                ),
              ],
              onChanged: isFirstAdmin
                  ? null
                  : (value) => setState(() => _role = value ?? _role),
            ),
            const SizedBox(height: 8),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _isActive,
              title: const Text('User aktif'),
              subtitle: isFirstAdmin
                  ? const Text('Admin pertama wajib tetap aktif')
                  : null,
              onChanged: isFirstAdmin
                  ? null
                  : (value) => setState(() => _isActive = value),
            ),
            const SizedBox(height: 20),
            CustomButton(
              label: 'Simpan User',
              icon: Icons.save_outlined,
              onPressed: _save,
            ),
          ],
        ),
      ),
    );
  }
}
