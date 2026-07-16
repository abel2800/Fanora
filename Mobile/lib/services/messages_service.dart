import '../core/network/api_client.dart';
import '../models/conversation.dart';

class MessagesService {
  MessagesService(this._client);

  final ApiClient _client;

  Future<List<ConversationModel>> getConversations() async {
    final res = await _client.get('/messages/conversations');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list
        .map((e) => ConversationModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<String> getOrCreateConversation(String userId) async {
    final res = await _client.get('/messages/conversations/$userId');
    final data = res.data as Map<String, dynamic>;
    final inner = data['data'] as Map<String, dynamic>;
    return inner['conversationId']?.toString() ?? '';
  }

  Future<int> getUnreadCount() async {
    final res = await _client.get('/messages/unread/count');
    final data = res.data as Map<String, dynamic>;
    return data['count'] is int
        ? data['count'] as int
        : int.tryParse(data['count']?.toString() ?? '') ?? 0;
  }

  Future<List<MessageModel>> getMessages(String userId, {int page = 1, int limit = 50}) async {
    final res = await _client.get('/messages/$userId', queryParameters: {
      'page': page,
      'limit': limit,
    });
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? (data['messages'] as List?) ?? [];
    return list.map((e) => MessageModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<MessageModel> sendMessage(
    String userId,
    String content, {
    String? mediaUrl,
    double? price,
  }) async {
    final res = await _client.post('/messages/send/$userId', data: {
      'content': content,
      if (mediaUrl != null) 'mediaUrl': mediaUrl,
      if (price != null) 'price': price,
    });
    final data = res.data as Map<String, dynamic>;
    final item = data['data'] ?? data['message'] ?? data;
    return MessageModel.fromJson(Map<String, dynamic>.from(item as Map));
  }

  Future<MessageModel> unlockMessage(String messageId, {String? pin}) async {
    final res = await _client.post('/messages/$messageId/unlock', data: {
      if (pin != null && pin.isNotEmpty) 'pin': pin,
    });
    final data = res.data as Map<String, dynamic>;
    return MessageModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<void> markRead(String conversationId) async {
    await _client.post('/messages/read/$conversationId');
  }

  Future<void> deleteConversation(String userId) async {
    await _client.delete('/messages/conversations/$userId');
  }

  Future<List<ConversationModel>> search(String query) async {
    final res = await _client.get('/messages/search', queryParameters: {'q': query});
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list
        .map((e) => ConversationModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<Map<String, dynamic>> sendBlast({
    required String content,
    String? mediaUrl,
    double? price,
    String segment = 'all',
  }) async {
    final res = await _client.post('/messages/blast', data: {
      'content': content,
      if (mediaUrl != null) 'mediaUrl': mediaUrl,
      if (price != null) 'price': price,
      'segment': segment,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }
}
