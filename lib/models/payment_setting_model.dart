class PaymentSettingModel {
  final String? qrisImagePath;
  final DateTime? updatedAt;

  const PaymentSettingModel({this.qrisImagePath, this.updatedAt});

  bool get hasQris => qrisImagePath != null && qrisImagePath!.isNotEmpty;

  PaymentSettingModel copyWith({
    String? qrisImagePath,
    bool clearQris = false,
    DateTime? updatedAt,
  }) {
    return PaymentSettingModel(
      qrisImagePath: clearQris ? null : (qrisImagePath ?? this.qrisImagePath),
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'qrisImagePath': qrisImagePath,
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  factory PaymentSettingModel.fromMap(Map<dynamic, dynamic>? map) {
    if (map == null) return const PaymentSettingModel();
    return PaymentSettingModel(
      qrisImagePath: map['qrisImagePath'] as String?,
      updatedAt: map['updatedAt'] == null
          ? null
          : DateTime.parse(map['updatedAt'] as String),
    );
  }
}
