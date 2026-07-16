import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_avatar.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final l10n = AppLocalizations.of(context);

    if (user == null) {
      return Scaffold(body: Center(child: Text(l10n.login)));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.profile),
        actions: [
          IconButton(icon: const Icon(Icons.settings), onPressed: () => context.push('/profile/settings')),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Center(
            child: Column(
              children: [
                AppAvatar(imageUrl: user.profileImage, name: user.username, radius: 48),
                const SizedBox(height: 12),
                Text(user.displayName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Text('@${user.username}', style: const TextStyle(color: AppColors.textSecondary)),
                if (!user.isEmailVerified)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Chip(
                      label: Text(l10n.emailNotVerified),
                      avatar: const Icon(Icons.warning_amber, size: 16),
                      onDeleted: () async {
                        try {
                          await ref.read(authServiceProvider).resendVerification();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.verificationEmailSent)));
                          }
                        } catch (e) {
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                          }
                        }
                      },
                      deleteIcon: const Icon(Icons.refresh, size: 16),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.edit_outlined),
                  title: Text(l10n.editProfile),
                  onTap: () => context.push('/profile/edit'),
                ),
                ListTile(
                  leading: const Icon(Icons.account_balance_wallet_outlined),
                  title: Text(l10n.wallet),
                  onTap: () => context.push('/wallet'),
                ),
                ListTile(
                  leading: const Icon(Icons.card_membership),
                  title: Text(l10n.subscriptions),
                  onTap: () => context.push('/subscriptions'),
                ),
                ListTile(
                  leading: const Icon(Icons.card_giftcard_outlined),
                  title: Text(l10n.giftSubscriptions),
                  onTap: () => context.push('/gifts'),
                ),
                ListTile(
                  leading: const Icon(Icons.request_page_outlined),
                  title: Text(l10n.customRequests),
                  onTap: () => context.push('/requests'),
                ),
                ListTile(
                  leading: const Icon(Icons.bookmark_outline),
                  title: Text(l10n.wishlist),
                  onTap: () => context.push('/wishlist'),
                ),
                ListTile(
                  leading: const Icon(Icons.people_outline),
                  title: Text(l10n.following),
                  onTap: () => context.push('/following'),
                ),
                ListTile(
                  leading: const Icon(Icons.volunteer_activism_outlined),
                  title: Text(l10n.tips),
                  onTap: () => context.push('/tips'),
                ),
                ListTile(
                  leading: const Icon(Icons.shield_outlined),
                  title: Text(l10n.trustSafety),
                  onTap: () => context.push('/trust-center'),
                ),
                if (user.isCreator)
                  ListTile(
                    leading: const Icon(Icons.dashboard_outlined),
                    title: Text(l10n.creatorDashboard),
                    onTap: () => context.push('/creator-dashboard'),
                  )
                else
                  ListTile(
                    leading: const Icon(Icons.verified_user_outlined),
                    title: Text(l10n.creatorOnboarding),
                    onTap: () => context.push('/creator/onboarding'),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.error),
            title: Text(l10n.logout, style: const TextStyle(color: AppColors.error)),
            onTap: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
    );
  }
}
