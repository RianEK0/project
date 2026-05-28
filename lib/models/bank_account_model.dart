class BankAccountModel {
  final String id;
  final String bankName;
  final String accountNumber;
  final String accountHolder;
  final bool isActive;

  const BankAccountModel({
    required this.id,
    required this.bankName,
    required this.accountNumber,
    required this.accountHolder,
    required this.isActive,
  });

  BankAccountModel copyWith({
    String? id,
    String? bankName,
    String? accountNumber,
    String? accountHolder,
    bool? isActive,
  }) {
    return BankAccountModel(
      id: id ?? this.id,
      bankName: bankName ?? this.bankName,
      accountNumber: accountNumber ?? this.accountNumber,
      accountHolder: accountHolder ?? this.accountHolder,
      isActive: isActive ?? this.isActive,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'bankName': bankName,
      'accountNumber': accountNumber,
      'accountHolder': accountHolder,
      'isActive': isActive,
    };
  }

  factory BankAccountModel.fromMap(Map<dynamic, dynamic> map) {
    return BankAccountModel(
      id: map['id'] as String,
      bankName: map['bankName'] as String,
      accountNumber: map['accountNumber'] as String,
      accountHolder: map['accountHolder'] as String,
      isActive: map['isActive'] as bool? ?? true,
    );
  }
}
