import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/network/api_client.dart';
import '../services/auth_service.dart';
import '../services/bundles_service.dart';
import '../services/content_service.dart';
import '../services/creator_onboarding_service.dart';
import '../services/creators_service.dart';
import '../services/gifts_service.dart';
import '../services/live_service.dart';
import '../services/media_security_service.dart';
import '../services/messages_service.dart';
import '../services/notifications_service.dart';
import '../services/payments_service.dart';
import '../services/requests_service.dart';
import '../services/search_service.dart';
import '../services/stories_service.dart';
import '../services/subscriptions_service.dart';
import '../services/tips_service.dart';
import '../services/trust_service.dart';
import '../services/upload_service.dart';
import '../services/user_service.dart';
import '../services/wallet_service.dart';
import '../services/wishlist_service.dart';
import 'auth_provider.dart';

const _storage = FlutterSecureStorage();
const _tokenKey = 'fanora_jwt';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) => _storage);

final apiClientProvider = Provider<ApiClient>((ref) {
  late final ApiClient client;
  client = ApiClient(
    onUnauthorized: () async {
      client.setToken(null);
      await ref.read(secureStorageProvider).delete(key: _tokenKey);
      await ref.read(authProvider.notifier).handleUnauthorized();
    },
  );
  return client;
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.watch(apiClientProvider), ref.watch(secureStorageProvider));
});

final contentServiceProvider = Provider<ContentService>((ref) {
  return ContentService(ref.watch(apiClientProvider));
});

final userServiceProvider = Provider<UserService>((ref) {
  return UserService(ref.watch(apiClientProvider));
});

final creatorsServiceProvider = Provider<CreatorsService>((ref) {
  return CreatorsService(ref.watch(apiClientProvider));
});

final walletServiceProvider = Provider<WalletService>((ref) {
  return WalletService(ref.watch(apiClientProvider));
});

final paymentsServiceProvider = Provider<PaymentsService>((ref) {
  return PaymentsService(ref.watch(apiClientProvider));
});

final messagesServiceProvider = Provider<MessagesService>((ref) {
  return MessagesService(ref.watch(apiClientProvider));
});

final notificationsServiceProvider = Provider<NotificationsService>((ref) {
  return NotificationsService(ref.watch(apiClientProvider));
});

final tipsServiceProvider = Provider<TipsService>((ref) {
  return TipsService(ref.watch(apiClientProvider));
});

final storiesServiceProvider = Provider<StoriesService>((ref) {
  return StoriesService(ref.watch(apiClientProvider));
});

final subscriptionsServiceProvider = Provider<SubscriptionsService>((ref) {
  return SubscriptionsService(ref.watch(apiClientProvider));
});

final searchServiceProvider = Provider<SearchService>((ref) {
  return SearchService(ref.watch(apiClientProvider));
});

final uploadServiceProvider = Provider<UploadService>((ref) {
  return UploadService(ref.watch(apiClientProvider));
});

final liveServiceProvider = Provider<LiveService>((ref) {
  return LiveService(ref.watch(apiClientProvider));
});

final bundlesServiceProvider = Provider<BundlesService>((ref) {
  return BundlesService(ref.watch(apiClientProvider));
});

final trustServiceProvider = Provider<TrustService>((ref) {
  return TrustService(ref.watch(apiClientProvider));
});

final requestsServiceProvider = Provider<RequestsService>((ref) {
  return RequestsService(ref.watch(apiClientProvider));
});

final giftsServiceProvider = Provider<GiftsService>((ref) {
  return GiftsService(ref.watch(apiClientProvider));
});

final creatorOnboardingServiceProvider = Provider<CreatorOnboardingService>((ref) {
  return CreatorOnboardingService(ref.watch(apiClientProvider));
});

final mediaSecurityServiceProvider = Provider<MediaSecurityService>((ref) {
  return MediaSecurityService(ref.watch(apiClientProvider));
});

final wishlistServiceProvider = Provider<WishlistService>((ref) {
  return WishlistService(ref.watch(apiClientProvider));
});
