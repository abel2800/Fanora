import '../core/network/api_client.dart';
import '../models/live_stream.dart';

class LiveService {
  LiveService(this._client);

  final ApiClient _client;

  Future<LiveStreamModel> start({required String title, String? description}) async {
    final res = await _client.post('/live/start', data: {
      'title': title,
      if (description != null) 'description': description,
    });
    final data = res.data as Map<String, dynamic>;
    return LiveStreamModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<List<LiveStreamModel>> listLive({String? status}) async {
    final res = await _client.get('/live', queryParameters: {
      if (status != null) 'status': status,
    });
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list
        .map((e) => LiveStreamModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<LiveStreamModel> getById(String id) async {
    final res = await _client.get('/live/$id');
    final data = res.data as Map<String, dynamic>;
    return LiveStreamModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<void> end(String id) async {
    await _client.post('/live/$id/end');
  }
}
