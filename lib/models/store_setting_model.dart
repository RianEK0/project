import '../utils/app_constants.dart';

class StoreSettingModel {
  final String storeName;
  final String ownerName;
  final String? address;
  final String? whatsapp;
  final String? logoPath;
  final DateTime updatedAt;

  const StoreSettingModel({
    required this.storeName,
    required this.ownerName,
    this.address,
    this.whatsapp,
    this.logoPath,
    required this.updatedAt,
  });

  factory StoreSettingModel.empty() {
    return StoreSettingModel(
      storeName: AppConstants.appName,
      ownerName: '',
      updatedAt: DateTime.now(),
    );
  }

  StoreSettingModel copyWith({
    String? storeName,
    String? ownerName,
    String? address,
    String? whatsapp,
    String? logoPath,
    bool clearLogo = false,
    DateTime? updatedAt,
  }) {
    return StoreSettingModel(
      storeName: storeName ?? this.storeName,
      ownerName: ownerName ?? this.ownerName,
      address: address ?? this.address,
      whatsapp: whatsapp ?? this.whatsapp,
      logoPath: clearLogo ? null : (logoPath ?? this.logoPath),
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'storeName': storeName,
      'ownerName': ownerName,
      'address': address,
      'whatsapp': whatsapp,
      'logoPath': logoPath,
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory StoreSettingModel.fromMap(Map<dynamic, dynamic> map) {
    return StoreSettingModel(
      storeName: map['storeName'] as String? ?? AppConstants.appName,
      ownerName: map['ownerName'] as String? ?? '',
      address: map['address'] as String?,
      whatsapp: map['whatsapp'] as String?,
      logoPath: map['logoPath'] as String?,
      updatedAt: DateTime.parse(map['updatedAt'] as String),
    );
  }
}
