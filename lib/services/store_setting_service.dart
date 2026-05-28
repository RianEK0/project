import '../models/store_setting_model.dart';
import 'database_service.dart';

class StoreSettingService {
  final _box = DatabaseService.box(DatabaseService.storeSettingsBox);

  StoreSettingModel getStoreSetting() {
    final value = _box.get('store');
    if (value == null) return StoreSettingModel.empty();
    return StoreSettingModel.fromMap(value as Map<dynamic, dynamic>);
  }

  Future<void> saveStoreSetting(StoreSettingModel setting) async {
    await _box.put('store', setting.toMap());
  }
}
