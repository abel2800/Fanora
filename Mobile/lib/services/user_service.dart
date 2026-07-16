import '../core/network/api_client.dart';
import '../models/user.dart';

class UserService {
  UserService(this._client);

  final ApiClient _client;

  Future<UserModel> getProfile(String username) async {
    final res = await _client.get('/users/profile/$username');
    final data = res.data as Map<String, dynamic>;
    final user = data['user'] ?? data['data'] ?? data;
    return UserModel.fromJson(Map<String, dynamic>.from(user as Map));
  }

  Future<UserModel> updateProfile(Map<String, dynamic> body) async {
    final res = await _client.put('/users/profile', data: body);
    final data = res.data as Map<String, dynamic>;
    final user = data['user'] ?? data['data'] ?? data;
    return UserModel.fromJson(Map<String, dynamic>.from(user as Map));
  }

  Future<void> follow(String userId) async {
    await _client.post('/users/follow/$userId');
  }

  Future<void> unfollow(String userId) async {
    await _client.post('/users/unfollow/$userId');
  }

  Future<List<UserModel>> getFollowing(String userId) async {
    final res = await _client.get('/users/following/$userId');
    return _parseUsers(res.data);
  }

  Future<List<UserModel>> getFollowers(String userId) async {
    final res = await _client.get('/users/followers/$userId');
    return _parseUsers(res.data);
  }

  Future<List<UserModel>> getMyFollowing() async {
    final res = await _client.get('/users/me/following');
    return _parseUsers(res.data);
  }

  Future<Map<String, dynamic>> getSettings() async {
    final res = await _client.get('/users/me/settings');
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data['settings'] ?? data) as Map);
  }

  Future<Map<String, dynamic>> updateSettings(Map<String, dynamic> settings) async {
    final res = await _client.put('/users/me/settings', data: settings);
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data['settings'] ?? data) as Map);
  }

  Future<void> registerDeviceToken(String token) async {
    await _client.post('/users/me/device-token', data: {'deviceToken': token});
  }

  List<UserModel> _parseUsers(dynamic raw) {
    final data = raw as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? (data['users'] as List?) ?? [];
    return list.map((e) => UserModel.fromJson(Map<String, dynamic>.from(e as Map))).toList();
  }
}
