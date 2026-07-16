import '../core/network/api_client.dart';
import '../models/user.dart';

class CreatorsService {
  CreatorsService(this._client);

  final ApiClient _client;

  Future<List<UserModel>> listCreators({int page = 1, int limit = 20, String? category}) async {
    final res = await _client.get('/creators', queryParameters: {
      'page': page,
      'limit': limit,
      if (category != null) 'category': category,
    });
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? (data['creators'] as List?) ?? [];
    return list.map((e) => UserModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }

  Future<Map<String, dynamic>> applyToBeCreator({String? bio, String? category}) async {
    final res = await _client.post('/creators/apply', data: {
      if (bio != null) 'bio': bio,
      if (category != null) 'category': category,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> getDashboard(String creatorId) async {
    final res = await _client.get('/creators/$creatorId/dashboard');
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data) as Map);
  }

  Future<Map<String, dynamic>> getInsights({int days = 30}) async {
    final res = await _client.get('/creators/me/insights', queryParameters: {'days': days});
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data) as Map);
  }

  Future<Map<String, dynamic>> getReferral() async {
    final res = await _client.get('/creators/me/referral');
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data) as Map);
  }
}
