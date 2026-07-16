import 'package:intl/intl.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../config/api_config.dart';

class Formatters {
  static final _currency = NumberFormat.currency(
    locale: 'en_ET',
    symbol: 'ETB ',
    decimalDigits: 2,
  );

  static String currency(num amount) => _currency.format(amount);

  static String compact(num n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }

  static String date(DateTime dt) => DateFormat.yMMMd().format(dt);

  static String dateTime(DateTime dt) => DateFormat.yMMMd().add_jm().format(dt);

  static String timeAgo(DateTime dt) => timeago.format(dt);

  static String resolveMediaUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http')) return url;
    final base = Uri.parse(ApiConfig.uploadsBaseUrl);
    if (url.startsWith('/')) return '${base.scheme}://${base.host}:${base.port}$url';
    return url;
  }
}
