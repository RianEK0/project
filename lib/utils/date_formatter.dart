import 'package:intl/intl.dart';

class DateFormatter {
  static final DateFormat date = DateFormat('dd MMM yyyy', 'id_ID');
  static final DateFormat time = DateFormat('HH:mm', 'id_ID');
  static final DateFormat dateTime = DateFormat('dd MMM yyyy, HH:mm', 'id_ID');
  static final DateFormat inputDate = DateFormat('yyyy-MM-dd');

  static String formatDate(DateTime value) => date.format(value);
  static String formatTime(DateTime value) => time.format(value);
  static String formatDateTime(DateTime value) => dateTime.format(value);
  static String formatInputDate(DateTime value) => inputDate.format(value);

  static bool isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}
