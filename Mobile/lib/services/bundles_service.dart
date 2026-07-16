import '../core/network/api_client.dart';
import '../models/content_bundle.dart';

class BundlesService {
  BundlesService(this._client);

  final ApiClient _client;

  Future<List<ContentBundleModel>> getMyBundles() async {
    final res = await _client.get('/bundles/my');
    return _parseList(res.data);
  }

  Future<List<ContentBundleModel>> getCreatorBundles(String creatorId) async {
    final res = await _client.get('/bundles/creator/$creatorId');
    return _parseList(res.data);
  }

  Future<ContentBundleModel> createBundle({
    required String title,
    String? description,
    required double price,
    required List<String> contentIds,
  }) async {
    final res = await _client.post('/bundles', data: {
      'title': title,
      if (description != null) 'description': description,
      'price': price,
      'contentIds': contentIds,
    });
    final data = res.data as Map<String, dynamic>;
    return ContentBundleModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<ContentBundleModel> updateBundle(String id, Map<String, dynamic> body) async {
    final res = await _client.put('/bundles/$id', data: body);
    final data = res.data as Map<String, dynamic>;
    return ContentBundleModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<void> deleteBundle(String id) async {
    await _client.delete('/bundles/$id');
  }

  Future<Map<String, dynamic>> purchaseBundle(String id, {String? pin}) async {
    final res = await _client.post('/bundles/$id/purchase', data: {
      if (pin != null) 'pin': pin,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  List<ContentBundleModel> _parseList(dynamic raw) {
    final data = raw as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => ContentBundleModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }
}
