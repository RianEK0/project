class Validators {
  static String? required(String? value, String label) {
    if (value == null || value.trim().isEmpty) {
      return '$label wajib diisi';
    }
    return null;
  }

  static String? minPassword(String? value) {
    final requiredError = required(value, 'Password');
    if (requiredError != null) return requiredError;
    if (value!.length < 6) return 'Password minimal 6 karakter';
    return null;
  }

  static String? confirmPassword(String? value, String password) {
    final requiredError = required(value, 'Konfirmasi password');
    if (requiredError != null) return requiredError;
    if (value != password) return 'Password dan konfirmasi password harus sama';
    return null;
  }

  static String? number(String? value, String label, {bool allowZero = true}) {
    final requiredError = required(value, label);
    if (requiredError != null) return requiredError;
    final parsed = int.tryParse(value!.replaceAll(RegExp(r'[^0-9]'), ''));
    if (parsed == null) return '$label wajib angka';
    if (!allowZero && parsed <= 0) return '$label harus lebih dari 0';
    return null;
  }

  static String? nonNegativeNumber(String? value, String label) {
    final requiredError = required(value, label);
    if (requiredError != null) return requiredError;
    final parsed = int.tryParse(value!.trim());
    if (parsed == null) return '$label wajib angka';
    if (parsed < 0) return '$label tidak boleh minus';
    return null;
  }

  static String? bankNumber(String? value) {
    final requiredError = required(value, 'Nomor rekening');
    if (requiredError != null) return requiredError;
    if (!RegExp(r'^[0-9]+$').hasMatch(value!.trim())) {
      return 'Nomor rekening hanya angka';
    }
    return null;
  }
}
