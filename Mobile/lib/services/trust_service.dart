import '../core/network/api_client.dart';
import '../models/user.dart';

class TrustService {
  TrustService(this._client);

  final ApiClient _client;

  Future<List<Map<String, dynamic>>> getMyReports() async {
    final res = await _client.get('/trust/reports');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  Future<Map<String, dynamic>> submitReport({
    required String type,
    required String reason,
    String? targetUserId,
    String? targetContentId,
  }) async {
    final res = await _client.post('/trust/report', data: {
      'type': type,
      'reason': reason,
      if (targetUserId != null) 'targetUserId': targetUserId,
      if (targetContentId != null) 'targetContentId': targetContentId,
    });
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data) as Map);
  }

  Future<List<UserModel>> getBlockedUsers() async {
    final res = await _client.get('/trust/blocked');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => UserModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<void> blockUser(String userId) async {
    await _client.post('/trust/block/$userId');
  }

  Future<void> unblockUser(String userId) async {
    await _client.delete('/trust/block/$userId');
  }
}
