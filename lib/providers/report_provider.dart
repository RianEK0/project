import 'package:flutter/foundation.dart';

import '../services/report_service.dart';

enum ReportPeriod { today, week, month, custom }

class ReportProvider extends ChangeNotifier {
  final ReportService _service = ReportService();

  ReportPeriod _period = ReportPeriod.today;
  DateTime? _customStart;
  DateTime? _customEnd;
  SalesReport? _report;
  Map<DateTime, int> _lastSevenDays = {};

  ReportPeriod get period => _period;
  DateTime? get customStart => _customStart;
  DateTime? get customEnd => _customEnd;
  SalesReport? get report => _report;
  Map<DateTime, int> get lastSevenDays => _lastSevenDays;

  void loadReport() {
    final range = _rangeForPeriod();
    _report = _service.buildReport(startDate: range.$1, endDate: range.$2);
    _lastSevenDays = _service.lastSevenDaysSales();
    notifyListeners();
  }

  void setPeriod(ReportPeriod period) {
    _period = period;
    loadReport();
  }

  void setCustomRange(DateTime start, DateTime end) {
    _period = ReportPeriod.custom;
    _customStart = start;
    _customEnd = end;
    loadReport();
  }

  (DateTime?, DateTime?) _rangeForPeriod() {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    switch (_period) {
      case ReportPeriod.today:
        return (today, today);
      case ReportPeriod.week:
        return (today.subtract(Duration(days: today.weekday - 1)), today);
      case ReportPeriod.month:
        return (DateTime(now.year, now.month), today);
      case ReportPeriod.custom:
        return (_customStart, _customEnd);
    }
  }
}
