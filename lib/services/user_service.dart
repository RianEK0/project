import '../models/user_model.dart';
import 'database_service.dart';

class UserService {
  final _box = DatabaseService.box(DatabaseService.usersBox);

  List<UserModel> getAllUsers() {
    return _box.values
        .map((value) => UserModel.fromMap(value as Map<dynamic, dynamic>))
        .toList()
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));
  }

  bool hasAdmin() {
    return getAllUsers().any((user) => user.isAdmin);
  }

  UserModel? getById(String id) {
    final value = _box.get(id);
    if (value == null) return null;
    return UserModel.fromMap(value as Map<dynamic, dynamic>);
  }

  UserModel? getByUsername(String username) {
    final normalized = username.trim().toLowerCase();
    for (final user in getAllUsers()) {
      if (user.username.toLowerCase() == normalized) return user;
    }
    return null;
  }

  Future<void> saveUser(UserModel user) async {
    await _box.put(user.id, user.toMap());
  }

  Future<void> deleteUser(String id) async {
    final user = getById(id);
    if (user == null || user.isFirstAdmin) {
      throw Exception('Admin pertama tidak boleh dihapus');
    }
    await _box.delete(id);
  }
}
