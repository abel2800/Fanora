import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';

class CreatorDashboardScreen extends ConsumerStatefulWidget {
  const CreatorDashboardScreen({super.key});

  @override
  ConsumerState<CreatorDashboardScreen> createState() => _CreatorDashboardScreenState();
}

class _CreatorDashboardScreenState extends ConsumerState<CreatorDashboardScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final userId = ref.read(authProvider).user?.id;
      if (userId == null) throw Exception('Not logged in');
      final data = await ref.read(creatorsServiceProvider).getDashboard(userId);
      setState(() => _data = data);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.creatorDashboard,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _card(l10n.totalEarnings, Formatters.currency(_data?['totalEarnings'] ?? 0)),
                    _card(l10n.subscribers, '${_data?['subscriberCount'] ?? 0}'),
                    _card(l10n.contentViews, '${_data?['totalViews'] ?? 0}'),
                    const SizedBox(height: 16),
                    ListTile(
                      leading: const Icon(Icons.add_circle_outline),
                      title: Text(l10n.createContent),
                      onTap: () => context.push('/creator/content/create'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.video_library_outlined),
                      title: Text(l10n.manageContent),
                      onTap: () => context.push('/creator/content/manage'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.people_outline),
                      title: Text(l10n.subscribers),
                      onTap: () => context.push('/creator/subscribers'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.card_membership),
                      title: Text(l10n.subscriptionPlans),
                      onTap: () => context.push('/creator/plans'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.payments_outlined),
                      title: Text(l10n.earnings),
                      onTap: () => context.push('/creator/earnings'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.campaign_outlined),
                      title: Text(l10n.massMessage),
                      onTap: () => context.push('/creator/mass-message'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.inventory_2_outlined),
                      title: Text(l10n.contentBundles),
                      onTap: () => context.push('/creator/bundles'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.insights_outlined),
                      title: Text(l10n.audienceInsights),
                      onTap: () => context.push('/creator/insights'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.share_outlined),
                      title: Text(l10n.referralProgram),
                      onTap: () => context.push('/creator/referral'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.request_page_outlined),
                      title: Text(l10n.requestInbox),
                      onTap: () => context.push('/creator/requests'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.calendar_month_outlined),
                      title: Text(l10n.contentCalendar),
                      onTap: () => context.push('/creator/calendar'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.verified_user_outlined),
                      title: Text(l10n.creatorOnboarding),
                      onTap: () => context.push('/creator/onboarding'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.live_tv),
                      title: Text(l10n.goLive),
                      onTap: () => context.push('/live/start'),
                    ),
                  ],
                ),
    );
  }

  Widget _card(String title, String value) => Card(
        child: ListTile(title: Text(title), trailing: Text(value, style: const TextStyle(fontWeight: FontWeight.bold))),
      );
}
