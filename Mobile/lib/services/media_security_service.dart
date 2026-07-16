import '../core/network/api_client.dart';
import '../models/watermark.dart';

class MediaSecurityService {
  MediaSecurityService(this._client);

  final ApiClient _client;

  Future<WatermarkModel> getWatermark(String contentId) async {
    final res = await _client.get('/media-security/watermark/$contentId');
    final data = res.data as Map<String, dynamic>;
    return WatermarkModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<void> reportEvent({
    required String contentId,
    required String eventType,
    String platform = 'android',
    Map<String, dynamic>? metadata,
  }) async {
    await _client.post('/media-security/event', data: {
      'contentId': contentId,
      'eventType': eventType,
      'platform': platform,
      if (metadata != null) 'metadata': metadata,
    });
  }
}
