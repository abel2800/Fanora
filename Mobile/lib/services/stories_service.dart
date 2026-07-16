import '../core/network/api_client.dart';
import '../models/story.dart';

class StoriesService {
  StoriesService(this._client);

  final ApiClient _client;

  Future<List<StoryModel>> getFeed() async {
    final res = await _client.get('/stories');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => StoryModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<StoryModel> create({
    required String mediaUrl,
    String? mediaType,
    String? caption,
  }) async {
    final res = await _client.post('/stories', data: {
      'mediaUrl': mediaUrl,
      if (mediaType != null) 'mediaType': mediaType,
      if (caption != null) 'caption': caption,
    });
    final data = res.data as Map<String, dynamic>;
    return StoryModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<List<StoryModel>> getByCreator(String creatorId) async {
    final res = await _client.get('/stories/creator/$creatorId');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => StoryModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<StoryModel> getById(String id) async {
    final res = await _client.get('/stories/$id');
    final data = res.data as Map<String, dynamic>;
    return StoryModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<void> delete(String id) async {
    await _client.delete('/stories/$id');
  }
}
