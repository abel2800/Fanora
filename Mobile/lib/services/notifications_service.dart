import '../core/network/api_client.dart';
import '../models/notification.dart';

class NotificationsService {
  NotificationsService(this._client);

  final ApiClient _client;

  Future<List<NotificationModel>> getAll({int page = 1, int limit = 20}) async {
    final res = await _client.get('/notifications', queryParameters: {
      'page': page,
      'limit': limit,
    });
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? (data['notifications'] as List?) ?? [];
    return list
        .map((e) => NotificationModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<int> getUnreadCount() async {
    final res = await _client.get('/notifications/unread-count');
    final data = res.data as Map<String, dynamic>;
    return data['count'] is int
        ? data['count'] as int
        : int.tryParse(data['count']?.toString() ?? '') ?? 0;
  }

  Future<void> markAllRead() async {
    await _client.post('/notifications/read-all');
  }

  Future<void> markRead(String id) async {
    await _client.post('/notifications/$id/read');
  }

  Future<void> delete(String id) async {
    await _client.delete('/notifications/$id');
  }
}
