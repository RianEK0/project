import 'package:flutter/foundation.dart';

import '../models/store_setting_model.dart';
import '../services/store_setting_service.dart';

class StoreSettingProvider extends ChangeNotifier {
  final StoreSettingService _service = StoreSettingService();

  StoreSettingModel _setting = StoreSettingModel.empty();
  StoreSettingModel get setting => _setting;

  void loadStoreSetting() {
    _setting = _service.getStoreSetting();
    notifyListeners();
  }

  Future<void> saveStoreSetting(StoreSettingModel setting) async {
    _setting = setting.copyWith(updatedAt: DateTime.now());
    await _service.saveStoreSetting(_setting);
    notifyListeners();
  }
}
