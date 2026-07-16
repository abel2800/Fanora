import '../core/network/api_client.dart';

class TipsService {
  TipsService(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> sendTip(
    String creatorId, {
    required double amount,
    String? message,
    String? pin,
  }) async {
    final res = await _client.post('/tips/send/$creatorId', data: {
      'amount': amount,
      if (message != null) 'message': message,
      if (pin != null) 'pin': pin,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<List<Map<String, dynamic>>> getSent() async {
    final res = await _client.get('/tips/sent');
    return _parseList(res.data);
  }

  Future<List<Map<String, dynamic>>> getReceived() async {
    final res = await _client.get('/tips/received');
    return _parseList(res.data);
  }

  Future<Map<String, dynamic>> getStats() async {
    final res = await _client.get('/tips/stats');
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data) as Map);
  }

  Future<List<Map<String, dynamic>>> getHistory() async {
    final res = await _client.get('/tips/history');
    return _parseList(res.data);
  }

  List<Map<String, dynamic>> _parseList(dynamic raw) {
    final data = raw as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }
}
