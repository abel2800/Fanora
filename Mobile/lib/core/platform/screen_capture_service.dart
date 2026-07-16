import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

typedef ScreenCaptureHandler = void Function(String eventType);

class ScreenCaptureService {
  ScreenCaptureService._();

  static const _channel = MethodChannel('com.fanora.fanora/screen_capture');
  static ScreenCaptureHandler? _handler;
  static bool? _supported;

  static Future<bool> isSupported() async {
    if (_supported != null) return _supported!;
    final supportedPlatform = defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;
    if (kIsWeb || !supportedPlatform) {
      _supported = false;
      return false;
    }
    try {
      final result = await _channel.invokeMethod<bool>('isSupported');
      _supported = result == true;
    } catch (_) {
      _supported = false;
    }
    return _supported!;
  }

  static Future<void> startListening(ScreenCaptureHandler handler) async {
    _handler = handler;
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'onCaptureEvent') {
        final args = call.arguments;
        String type = 'screenshot';
        if (args is Map) {
          type = args['type']?.toString() ?? 'screenshot';
        } else if (args is String) {
          type = args;
        }
        if (type == 'screenshot' || type == 'screen_recording') {
          _handler?.call(type);
        }
      }
    });
    if (await isSupported()) {
      try {
        await _channel.invokeMethod('startListening');
      } catch (_) {}
    }
  }

  static Future<void> stopListening() async {
    _handler = null;
    try {
      await _channel.invokeMethod('stopListening');
    } catch (_) {}
    _channel.setMethodCallHandler(null);
  }
}
