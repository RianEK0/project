import 'package:shared_preferences/shared_preferences.dart';

import '../models/store_setting_model.dart';
import '../models/user_model.dart';
import '../utils/app_constants.dart';
import 'database_service.dart';
import 'user_service.dart';

class AuthService {
  static const _sessionKey = 'current_user_id';

  final UserService _userService = UserService();
  final _storeBox = DatabaseService.box(DatabaseService.storeSettingsBox);

  Future<bool> hasAdmin() async {
    return _userService.hasAdmin();
  }

  Future<UserModel?> currentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getString(_sessionKey);
    if (id == null) return null;
    final user = _userService.getById(id);
    if (user == null || !user.isActive) {
      await prefs.remove(_sessionKey);
      return null;
    }
    return user;
  }

  Future<UserModel> registerFirstAdmin({
    required String ownerName,
    required String storeName,
    required String username,
    required String password,
    String? whatsapp,
    String? address,
  }) async {
    if (_userService.hasAdmin()) {
      throw Exception('Admin sudah terdaftar');
    }
    if (_userService.getByUsername(username) != null) {
      throw Exception('Username sudah digunakan');
    }

    final admin = UserModel(
      id: DatabaseService.createId('usr'),
      name: ownerName.trim(),
      username: username.trim(),
      password: password,
      role: AppConstants.roleAdmin,
      isActive: true,
      isFirstAdmin: true,
      createdAt: DateTime.now(),
    );
    await _userService.saveUser(admin);

    final setting = StoreSettingModel(
      storeName: storeName.trim(),
      ownerName: ownerName.trim(),
      address: address?.trim().isEmpty == true ? null : address?.trim(),
      whatsapp: whatsapp?.trim().isEmpty == true ? null : whatsapp?.trim(),
      updatedAt: DateTime.now(),
    );
    await _storeBox.put('store', setting.toMap());
    return admin;
  }

  Future<UserModel> login({
    required String username,
    required String password,
  }) async {
    final user = _userService.getByUsername(username);
    if (user == null || user.password != password) {
      throw Exception('Username atau password salah');
    }
    if (!user.isActive) {
      throw Exception('User tidak aktif');
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_sessionKey, user.id);
    return user;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_sessionKey);
  }
}
