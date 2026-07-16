import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/forgot_password_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/auth/register_screen.dart';
import '../features/auth/reset_password_screen.dart';
import '../features/auth/splash_screen.dart';
import '../features/auth/verify_email_screen.dart';
import '../features/content/content_detail_screen.dart';
import '../features/creator/audience_insights_screen.dart';
import '../features/creator/content_bundles_screen.dart';
import '../features/creator/content_calendar_screen.dart';
import '../features/creator/create_content_screen.dart';
import '../features/creator/creator_dashboard_screen.dart';
import '../features/creator/creator_earnings_screen.dart';
import '../features/creator/creator_onboarding_screen.dart';
import '../features/creator/creator_profile_screen.dart';
import '../features/creator/manage_content_screen.dart';
import '../features/creator/mass_message_screen.dart';
import '../features/creator/referral_screen.dart';
import '../features/creator/subscribers_screen.dart';
import '../features/creator/subscription_plans_screen.dart';
import '../features/following/following_screen.dart';
import '../features/gifts/gifts_screen.dart';
import '../features/home/home_shell.dart';
import '../features/live/live_list_screen.dart';
import '../features/live/live_start_screen.dart';
import '../features/live/live_watch_screen.dart';
import '../features/messages/chat_screen.dart';
import '../features/notifications/notifications_screen.dart';
import '../features/profile/change_password_screen.dart';
import '../features/profile/edit_profile_screen.dart';
import '../features/profile/settings_screen.dart';
import '../features/profile/trust_center_screen.dart';
import '../features/requests/create_request_screen.dart';
import '../features/requests/creator_requests_inbox_screen.dart';
import '../features/requests/fan_requests_screen.dart';
import '../features/search/search_screen.dart';
import '../features/stories/create_story_screen.dart';
import '../features/stories/story_viewer_screen.dart';
import '../features/subscriptions/my_subscriptions_screen.dart';
import '../features/tips/tips_screen.dart';
import '../features/wallet/link_accounts_screen.dart';
import '../features/wallet/set_pin_screen.dart';
import '../features/wallet/topup_cbe_screen.dart';
import '../features/wallet/topup_confirm_screen.dart';
import '../features/wallet/topup_telebirr_screen.dart';
import '../features/wallet/transactions_screen.dart';
import '../features/wallet/wallet_screen.dart';
import '../features/wishlist/wishlist_screen.dart';
import 'auth_provider.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/splash',
    refreshListenable: _RouterRefresh(ref),
    redirect: (context, state) {
      final loc = state.matchedLocation;
      final isAuthRoute = loc.startsWith('/login') ||
          loc.startsWith('/register') ||
          loc.startsWith('/forgot-password') ||
          loc.startsWith('/reset-password') ||
          loc.startsWith('/verify-email') ||
          loc == '/splash';

      if (authState.status == AuthStatus.initial) {
        return loc == '/splash' ? null : '/splash';
      }

      if (authState.status == AuthStatus.loading && loc != '/splash') {
        return '/splash';
      }

      final isLoggedIn = authState.isAuthenticated;

      if (!isLoggedIn && !isAuthRoute) {
        return '/login';
      }

      if (isLoggedIn && (loc == '/login' || loc == '/register' || loc == '/splash')) {
        return '/home';
      }

      const creatorRoutes = [
        '/creator-dashboard',
        '/creator/content/create',
        '/creator/content/manage',
        '/creator/earnings',
        '/creator/subscribers',
        '/creator/plans',
        '/creator/mass-message',
        '/creator/bundles',
        '/creator/insights',
        '/creator/referral',
        '/creator/requests',
        '/creator/calendar',
        '/live/start',
      ];

      if (isLoggedIn && creatorRoutes.any((route) => loc.startsWith(route))) {
        if (authState.user?.isCreator != true) {
          return '/home';
        }
      }

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
      GoRoute(
        path: '/reset-password/:token',
        builder: (_, state) => ResetPasswordScreen(token: state.pathParameters['token']!),
      ),
      GoRoute(
        path: '/verify-email/:token',
        builder: (_, state) => VerifyEmailScreen(token: state.pathParameters['token']!),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (_, __, child) => HomeShell(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/explore', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/create', builder: (_, __) => const CreateContentScreen()),
          GoRoute(path: '/messages', builder: (_, __) => const SizedBox.shrink()),
          GoRoute(path: '/profile', builder: (_, __) => const SizedBox.shrink()),
        ],
      ),
      GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
      GoRoute(
        path: '/content/:id',
        builder: (_, state) => ContentDetailScreen(contentId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/creator/:username',
        builder: (_, state) => CreatorProfileScreen(username: state.pathParameters['username']!),
      ),
      GoRoute(path: '/creator-dashboard', builder: (_, __) => const CreatorDashboardScreen()),
      GoRoute(path: '/creator/content/create', builder: (_, __) => const CreateContentScreen()),
      GoRoute(path: '/creator/content/manage', builder: (_, __) => const ManageContentScreen()),
      GoRoute(path: '/creator/earnings', builder: (_, __) => const CreatorEarningsScreen()),
      GoRoute(path: '/creator/subscribers', builder: (_, __) => const SubscribersScreen()),
      GoRoute(path: '/creator/plans', builder: (_, __) => const SubscriptionPlansScreen()),
      GoRoute(path: '/creator/mass-message', builder: (_, __) => const MassMessageScreen()),
      GoRoute(path: '/creator/bundles', builder: (_, __) => const ContentBundlesScreen()),
      GoRoute(path: '/creator/insights', builder: (_, __) => const AudienceInsightsScreen()),
      GoRoute(path: '/creator/referral', builder: (_, __) => const ReferralScreen()),
      GoRoute(path: '/creator/requests', builder: (_, __) => const CreatorRequestsInboxScreen()),
      GoRoute(path: '/creator/calendar', builder: (_, __) => const ContentCalendarScreen()),
      GoRoute(path: '/creator/onboarding', builder: (_, __) => const CreatorOnboardingScreen()),
      GoRoute(path: '/following', builder: (_, __) => const FollowingScreen()),
      GoRoute(path: '/requests', builder: (_, __) => const FanRequestsScreen()),
      GoRoute(
        path: '/requests/create',
        builder: (_, state) => CreateRequestScreen(
          creatorId: state.uri.queryParameters['creatorId'],
          creatorUsername: state.uri.queryParameters['username'],
        ),
      ),
      GoRoute(path: '/gifts', builder: (_, __) => const GiftsScreen()),
      GoRoute(path: '/wishlist', builder: (_, __) => const WishlistScreen()),
      GoRoute(path: '/wallet', builder: (_, __) => const WalletScreen()),
      GoRoute(path: '/wallet/pin', builder: (_, __) => const SetPinScreen()),
      GoRoute(path: '/wallet/link-accounts', builder: (_, __) => const LinkAccountsScreen()),
      GoRoute(path: '/wallet/topup/telebirr', builder: (_, __) => const TopupTelebirrScreen()),
      GoRoute(path: '/wallet/topup/cbe', builder: (_, __) => const TopupCbeScreen()),
      GoRoute(path: '/wallet/transactions', builder: (_, __) => const TransactionsScreen()),
      GoRoute(
        path: '/wallet/confirm/:id',
        builder: (_, state) => TopupConfirmScreen(transactionId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/tips', builder: (_, __) => const TipsScreen()),
      GoRoute(
        path: '/messages/:userId',
        builder: (_, state) => ChatScreen(userId: state.pathParameters['userId']!),
      ),
      GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
      GoRoute(path: '/stories/create', builder: (_, __) => const CreateStoryScreen()),
      GoRoute(
        path: '/stories/view',
        builder: (_, state) => StoryViewerScreen(
          storyIds: (state.uri.queryParameters['ids'] ?? '').split(',').where((e) => e.isNotEmpty).toList(),
          initialIndex: int.tryParse(state.uri.queryParameters['index'] ?? '0') ?? 0,
        ),
      ),
      GoRoute(path: '/live', builder: (_, __) => const LiveListScreen()),
      GoRoute(path: '/live/start', builder: (_, __) => const LiveStartScreen()),
      GoRoute(
        path: '/live/:id',
        builder: (_, state) => LiveWatchScreen(streamId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/profile/edit', builder: (_, __) => const EditProfileScreen()),
      GoRoute(path: '/profile/settings', builder: (_, __) => const SettingsScreen()),
      GoRoute(path: '/profile/change-password', builder: (_, __) => const ChangePasswordScreen()),
      GoRoute(path: '/trust-center', builder: (_, __) => const TrustCenterScreen()),
      GoRoute(path: '/subscriptions', builder: (_, __) => const MySubscriptionsScreen()),
    ],
  );
});

class _RouterRefresh extends ChangeNotifier {
  _RouterRefresh(this._ref) {
    _ref.listen<AuthState>(authProvider, (_, __) => notifyListeners());
  }

  final Ref _ref;
}
