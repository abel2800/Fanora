import '../core/network/api_client.dart';
import '../models/content.dart';

class WishlistService {
  WishlistService(this._client);

  final ApiClient _client;

  Future<List<ContentModel>> getAll() async {
    final response = await _client.get('/wishlist');
    final body = response.data as Map<String, dynamic>;
    final items = (body['data'] as List?) ?? [];
    return items.map((item) {
      final json = Map<String, dynamic>.from(item as Map);
      return ContentModel.fromJson(Map<String, dynamic>.from(json['content'] as Map));
    }).toList();
  }

  Future<bool> status(String contentId) async {
    final response = await _client.get('/wishlist/$contentId/status');
    return (response.data as Map<String, dynamic>)['saved'] == true;
  }

  Future<void> add(String contentId) async {
    await _client.post('/wishlist/$contentId');
  }

  Future<void> remove(String contentId) async {
    await _client.delete('/wishlist/$contentId');
  }
}
