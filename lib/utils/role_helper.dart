import 'app_constants.dart';

class RoleHelper {
  static bool isAdmin(String? role) => role == AppConstants.roleAdmin;
  static bool isCashier(String? role) => role == AppConstants.roleCashier;

  static bool canManageSettings(String? role) => isAdmin(role);
  static bool canManageUsers(String? role) => isAdmin(role);
  static bool canManageProducts(String? role) => isAdmin(role);
  static bool canDeleteTransactions(String? role) => isAdmin(role);
}
