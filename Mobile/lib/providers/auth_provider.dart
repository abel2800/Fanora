import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import 'services_provider.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.error,
  });

  final AuthStatus status;
  final UserModel? user;
  final String? error;

  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;

  AuthState copyWith({AuthStatus? status, UserModel? user, String? error, bool clearError = false}) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._ref) : super(const AuthState());

  final Ref _ref;

  Future<void> init() async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);
    try {
      final auth = _ref.read(authServiceProvider);
      await auth.restoreSession();
      final token = await auth.getStoredToken();
      if (token == null || token.isEmpty) {
        state = const AuthState(status: AuthStatus.unauthenticated);
        return;
      }
      final user = await auth.getMe();
      state = AuthState(status: AuthStatus.authenticated, user: user);
    } catch (_) {
      await _ref.read(authServiceProvider).clearToken();
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);
    try {
      final result = await _ref.read(authServiceProvider).login(email: email, password: password);
      state = AuthState(status: AuthStatus.authenticated, user: result.user);
    } catch (e) {
      state = AuthState(status: AuthStatus.unauthenticated, error: e.toString());
      rethrow;
    }
  }

  Future<Map<String, dynamic>> sendOtp(String phoneNumber, {String purpose = 'register'}) async {
    return _ref.read(authServiceProvider).sendOtp(phoneNumber, purpose: purpose);
  }

  Future<void> loginWithOtp(String phoneNumber, String code) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);
    try {
      final result = await _ref.read(authServiceProvider).verifyOtp(
            phoneNumber: phoneNumber,
            code: code,
            purpose: 'login',
          );
      if (result.user == null) throw Exception('Login failed');
      state = AuthState(status: AuthStatus.authenticated, user: result.user);
    } catch (e) {
      state = AuthState(status: AuthStatus.unauthenticated, error: e.toString());
      rethrow;
    }
  }

  Future<bool> verifyPhoneOtp(String phoneNumber, String code) async {
    final result = await _ref.read(authServiceProvider).verifyOtp(
          phoneNumber: phoneNumber,
          code: code,
          purpose: 'register',
        );
    return result.phoneVerified;
  }

  Future<void> register({
    required String username,
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    required String phoneNumber,
    required String dateOfBirth,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, clearError: true);
    try {
      final result = await _ref.read(authServiceProvider).register(
            username: username,
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            dateOfBirth: dateOfBirth,
          );
      state = AuthState(status: AuthStatus.authenticated, user: result.user);
    } catch (e) {
      state = AuthState(status: AuthStatus.unauthenticated, error: e.toString());
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _ref.read(authServiceProvider).logout();
    } catch (_) {}
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> refreshUser() async {
    if (!state.isAuthenticated) return;
    try {
      final user = await _ref.read(authServiceProvider).getMe();
      state = state.copyWith(user: user);
    } catch (_) {}
  }

  Future<void> handleUnauthorized() async {
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});
