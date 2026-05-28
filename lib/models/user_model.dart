import '../utils/app_constants.dart';

class UserModel {
  final String id;
  final String name;
  final String username;
  final String password;
  final String role;
  final bool isActive;
  final bool isFirstAdmin;
  final DateTime createdAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.username,
    required this.password,
    required this.role,
    required this.isActive,
    required this.isFirstAdmin,
    required this.createdAt,
  });

  bool get isAdmin => role == AppConstants.roleAdmin;
  bool get isCashier => role == AppConstants.roleCashier;

  UserModel copyWith({
    String? id,
    String? name,
    String? username,
    String? password,
    String? role,
    bool? isActive,
    bool? isFirstAdmin,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      username: username ?? this.username,
      password: password ?? this.password,
      role: role ?? this.role,
      isActive: isActive ?? this.isActive,
      isFirstAdmin: isFirstAdmin ?? this.isFirstAdmin,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'username': username,
      'password': password,
      'role': role,
      'isActive': isActive,
      'isFirstAdmin': isFirstAdmin,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory UserModel.fromMap(Map<dynamic, dynamic> map) {
    return UserModel(
      id: map['id'] as String,
      name: map['name'] as String,
      username: map['username'] as String,
      password: map['password'] as String,
      role: map['role'] as String,
      isActive: map['isActive'] as bool? ?? true,
      isFirstAdmin: map['isFirstAdmin'] as bool? ?? false,
      createdAt: DateTime.parse(map['createdAt'] as String),
    );
  }
}
