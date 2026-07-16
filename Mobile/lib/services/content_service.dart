import 'package:dio/dio.dart';

import '../core/network/api_client.dart';
import '../models/content.dart';

class ContentService {
  ContentService(this._client);

  final ApiClient _client;

  Future<({List<ContentModel> items, PaginationMeta? pagination})> getFeed({
    int page = 1,
    int limit = 20,
    String? category,
    String? type,
    bool followingOnly = false,
    String mode = 'for-you',
  }) async {
    final feedMode = followingOnly ? 'following' : mode;
    final res = await _client.get('/content/feed', queryParameters: {
      'page': page,
      'limit': limit,
      'mode': feedMode,
      if (category != null) 'category': category,
      if (type != null) 'type': type,
      if (followingOnly || feedMode == 'following') 'followingOnly': 'true',
    });
    return _parseList(res.data);
  }

  Future<List<Map<String, dynamic>>> getCalendar({DateTime? from, DateTime? to}) async {
    final res = await _client.get('/content/calendar/mine', queryParameters: {
      if (from != null) 'from': from.toIso8601String(),
      if (to != null) 'to': to.toIso8601String(),
    });
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  Future<Map<String, dynamic>> updateCalendar(String id, DateTime scheduledPublishDate) async {
    final res = await _client.patch('/content/calendar/$id', data: {
      'scheduledPublishDate': scheduledPublishDate.toIso8601String(),
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<List<ContentModel>> getTrending({int limit = 10}) async {
    final res = await _client.get('/content/trending', queryParameters: {'limit': limit});
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => ContentModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<ContentModel> getById(String id) async {
    final res = await _client.get('/content/$id');
    final data = res.data as Map<String, dynamic>;
    final item = data['data'] ?? data;
    return ContentModel.fromJson(Map<String, dynamic>.from(item as Map));
  }

  Future<ContentModel> create({
    required String title,
    String? description,
    required String type,
    String? accessType,
    double? price,
    String? category,
    List<String>? tags,
    String? filePath,
    String? fileName,
  }) async {
    final formData = FormData.fromMap({
      'title': title,
      if (description != null) 'description': description,
      'type': type,
      if (accessType != null) 'accessType': accessType,
      if (price != null) 'price': price,
      if (category != null) 'category': category,
      if (tags != null) 'tags': tags,
      if (filePath != null)
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });
    final res = await _client.upload('/content', formData: formData);
    final data = res.data as Map<String, dynamic>;
    return ContentModel.fromJson(Map<String, dynamic>.from(data['data'] as Map));
  }

  Future<ContentModel> update(String id, Map<String, dynamic> body) async {
    final res = await _client.put('/content/$id', data: body);
    final data = res.data as Map<String, dynamic>;
    return ContentModel.fromJson(Map<String, dynamic>.from(data['data'] as Map));
  }

  Future<void> delete(String id) async {
    await _client.delete('/content/$id');
  }

  Future<({List<ContentModel> items, PaginationMeta? pagination})> getByCreator(
    String creatorId, {
    int page = 1,
    int limit = 20,
  }) async {
    final res = await _client.get('/content/creator/$creatorId', queryParameters: {
      'page': page,
      'limit': limit,
    });
    return _parseList(res.data);
  }

  Future<void> like(String id) async {
    await _client.post('/content/$id/like');
  }

  Future<void> unlike(String id) async {
    await _client.delete('/content/$id/like');
  }

  Future<List<CommentModel>> getComments(String id, {int page = 1}) async {
    final res = await _client.get('/content/$id/comments', queryParameters: {'page': page});
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? (data['comments'] as List?) ?? [];
    return list.map((e) => CommentModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<CommentModel> addComment(String id, String content) async {
    final res = await _client.post('/content/$id/comments', data: {'content': content});
    final data = res.data as Map<String, dynamic>;
    final item = data['data'] ?? data['comment'] ?? data;
    return CommentModel.fromJson(Map<String, dynamic>.from(item as Map));
  }

  Future<Map<String, dynamic>> purchase(String id, {String? pin}) async {
    final res = await _client.post('/content/$id/purchase', data: {
      if (pin != null) 'pin': pin,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<List<ContentModel>> myPurchases() async {
    final res = await _client.get('/content/purchases/my');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => ContentModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  ({List<ContentModel> items, PaginationMeta? pagination}) _parseList(dynamic raw) {
    final data = raw as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    final pagination = data['pagination'] != null
        ? PaginationMeta.fromJson(Map<String, dynamic>.from(data['pagination'] as Map))
        : null;
    return (
      items: list.map((e) => ContentModel.fromJson(Map<String, dynamic>.from(e as Map))).toList(),
      pagination: pagination,
    );
  }
}
