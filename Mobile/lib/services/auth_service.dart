import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/network/api_client.dart';
import '../models/user.dart';

class AuthService {
  AuthService(this._client, this._storage);

  final ApiClient _client;
  final FlutterSecureStorage _storage;

  static const _tokenKey = 'fanora_jwt';

  Future<String?> getStoredToken() => _storage.read(key: _tokenKey);

  Future<void> _saveToken(String token) async {
    await _storage.write(key: _tokenKey, value: token);
    _client.setToken(token);
  }

  Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
    _client.setToken(null);
  }

  Future<void> restoreSession() async {
    final token = await getStoredToken();
    _client.setToken(token);
  }

  Future<({String token, UserModel user})> login({
    required String email,
    required String password,
  }) async {
    final res = await _client.post('/auth/login', data: {
      'email': email,
      'password': password,
    });
    final data = res.data as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map));
    await _saveToken(token);
    return (token: token, user: user);
  }

  Future<({String token, UserModel user})> register({
    required String username,
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
    required String dateOfBirth,
  }) async {
    final res = await _client.post('/auth/register', data: {
      'username': username,
      'email': email,
      'password': password,
      'firstName': firstName,
      'lastName': lastName,
      'phoneNumber': phoneNumber,
      'dateOfBirth': dateOfBirth,
    });
    final data = res.data as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map));
    await _saveToken(token);
    return (token: token, user: user);
  }

  Future<void> logout() async {
    try {
      await _client.post('/auth/logout');
    } finally {
      await clearToken();
    }
  }

  Future<UserModel> getMe() async {
    final res = await _client.get('/auth/me');
    final data = res.data as Map<String, dynamic>;
    final userJson = data['user'] ?? data['data'] ?? data;
    return UserModel.fromJson(Map<String, dynamic>.from(userJson as Map));
  }

  Future<void> forgotPassword(String email) async {
    await _client.post('/auth/forgot-password', data: {'email': email});
  }

  Future<void> resetPassword(String token, String password) async {
    await _client.post('/auth/reset-password/$token', data: {'password': password});
  }

  Future<void> verifyEmail(String token) async {
    await _client.post('/auth/verify-email/$token');
  }

  Future<void> resendVerification() async {
    await _client.post('/auth/resend-verification');
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _client.post('/auth/change-password', data: {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    });
  }

  Future<Map<String, dynamic>> sendOtp(String phoneNumber, {String purpose = 'register'}) async {
    final res = await _client.post('/auth/send-otp', data: {
      'phoneNumber': phoneNumber,
      'purpose': purpose,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<({String? token, UserModel? user, bool phoneVerified})> verifyOtp({
    required String phoneNumber,
    required String code,
    String purpose = 'register',
  }) async {
    final res = await _client.post('/auth/verify-otp', data: {
      'phoneNumber': phoneNumber,
      'code': code,
      'purpose': purpose,
    });
    final data = Map<String, dynamic>.from(res.data as Map);

    if (purpose == 'login') {
      final token = data['token'] as String;
      final user = UserModel.fromJson(Map<String, dynamic>.from(data['user'] as Map));
      await _saveToken(token);
      return (token: token, user: user, phoneVerified: true);
    }

    return (token: null, user: null, phoneVerified: data['phoneVerified'] == true);
  }
}
