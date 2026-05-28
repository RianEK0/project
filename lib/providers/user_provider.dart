import 'package:flutter/foundation.dart';

import '../models/user_model.dart';
import '../services/database_service.dart';
import '../services/user_service.dart';
import '../utils/app_constants.dart';

class UserProvider extends ChangeNotifier {
  final UserService _service = UserService();

  List<UserModel> _users = [];
  List<UserModel> get users => _users;

  void loadUsers() {
    _users = _service.getAllUsers();
    notifyListeners();
  }

  UserModel? getById(String id) => _service.getById(id);

  Future<void> saveUser({
    String? id,
    required String name,
    required String username,
    required String password,
    required String role,
    required bool isActive,
  }) async {
    final existingUsername = _service.getByUsername(username);
    if (existingUsername != null && existingUsername.id != id) {
      throw Exception('Username sudah digunakan');
    }

    final current = id == null ? null : _service.getById(id);
    final user = UserModel(
      id: id ?? DatabaseService.createId('usr'),
      name: name.trim(),
      username: username.trim(),
      password: password,
      role: current?.isFirstAdmin == true ? AppConstants.roleAdmin : role,
      isActive: current?.isFirstAdmin == true ? true : isActive,
      isFirstAdmin: current?.isFirstAdmin ?? false,
      createdAt: current?.createdAt ?? DateTime.now(),
    );
    await _service.saveUser(user);
    loadUsers();
  }

  Future<void> deleteUser(String id) async {
    await _service.deleteUser(id);
    loadUsers();
  }

  Future<void> toggleActive(UserModel user) async {
    if (user.isFirstAdmin) {
      throw Exception('Admin pertama tidak boleh dinonaktifkan');
    }
    await _service.saveUser(user.copyWith(isActive: !user.isActive));
    loadUsers();
  }
}
