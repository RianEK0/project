import 'package:flutter/foundation.dart';

import '../models/user_model.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  UserModel? _currentUser;
  bool _hasAdmin = false;
  bool _isLoading = true;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get hasAdmin => _hasAdmin;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isLoggedIn => _currentUser != null;

  Future<void> bootstrap() async {
    _isLoading = true;
    notifyListeners();
    _hasAdmin = await _authService.hasAdmin();
    _currentUser = await _authService.currentUser();
    _isLoading = false;
    notifyListeners();
  }

  Future<void> refreshUser() async {
    _currentUser = await _authService.currentUser();
    notifyListeners();
  }

  Future<bool> registerFirstAdmin({
    required String ownerName,
    required String storeName,
    required String username,
    required String password,
    String? whatsapp,
    String? address,
  }) async {
    try {
      _errorMessage = null;
      await _authService.registerFirstAdmin(
        ownerName: ownerName,
        storeName: storeName,
        username: username,
        password: password,
        whatsapp: whatsapp,
        address: address,
      );
      _hasAdmin = true;
      notifyListeners();
      return true;
    } catch (error) {
      _errorMessage = error.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  Future<bool> login({
    required String username,
    required String password,
  }) async {
    try {
      _errorMessage = null;
      _currentUser = await _authService.login(
        username: username,
        password: password,
      );
      notifyListeners();
      return true;
    } catch (error) {
      _errorMessage = error.toString().replaceFirst('Exception: ', '');
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _currentUser = null;
    notifyListeners();
  }
}
