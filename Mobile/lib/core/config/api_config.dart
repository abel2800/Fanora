import 'dart:io';

class ApiConfig {
  static const String _androidEmulatorHost = 'http://10.0.2.2:5000/api';
  static const String _desktopHost = 'http://localhost:5000/api';

  static String get baseUrl {
    if (Platform.isAndroid) return _androidEmulatorHost;
    return _desktopHost;
  }

  static String get uploadsBaseUrl {
    final uri = Uri.parse(baseUrl);
    return '${uri.scheme}://${uri.host}:${uri.port}';
  }
}
