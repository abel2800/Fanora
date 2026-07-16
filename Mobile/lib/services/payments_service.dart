import '../core/network/api_client.dart';

class PaymentsService {
  PaymentsService(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> getStatus(String transactionId) async {
    final res = await _client.get('/payments/status/$transactionId');
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> getAnalytics() async {
    final res = await _client.get('/payments/analytics');
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data) as Map);
  }

  Future<Map<String, dynamic>> refund(String transactionId) async {
    final res = await _client.post('/payments/refund/$transactionId');
    return Map<String, dynamic>.from(res.data as Map);
  }
}
