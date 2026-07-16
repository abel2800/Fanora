import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/widgets/app_avatar.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class SubscribersScreen extends ConsumerStatefulWidget {
  const SubscribersScreen({super.key});

  @override
  ConsumerState<SubscribersScreen> createState() => _SubscribersScreenState();
}

class _SubscribersScreenState extends ConsumerState<SubscribersScreen> {
  List<Map<String, dynamic>> _subscribers = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final plans = await ref.read(subscriptionsServiceProvider).getMyPlans();
      final all = <Map<String, dynamic>>[];
      for (final plan in plans) {
        final subs = await ref.read(subscriptionsServiceProvider).getSubscribers(plan.id);
        all.addAll(subs);
      }
      setState(() => _subscribers = all);
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.subscribers,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : _subscribers.isEmpty
              ? EmptyView(message: l10n.noSubscribersYet)
              : ListView.builder(
                  itemCount: _subscribers.length,
                  itemBuilder: (_, i) {
                    final s = _subscribers[i];
                    final user = s['subscriber'] as Map<String, dynamic>?;
                    final loyalty = s['loyalty'] as Map<String, dynamic>?;
                    return ListTile(
                      leading: AppAvatar(imageUrl: user?['profileImage']?.toString(), name: user?['username']?.toString()),
                      title: Row(
                        children: [
                          Flexible(child: Text(user?['username']?.toString() ?? l10n.subscriber)),
                          if (loyalty?['badge'] != null) ...[
                            const SizedBox(width: 8),
                            Chip(
                              visualDensity: VisualDensity.compact,
                              label: Text(
                                '${loyalty!['badge']} · ${loyalty['tenureMonths']}m',
                                style: const TextStyle(fontSize: 10),
                              ),
                            ),
                          ],
                        ],
                      ),
                      subtitle: Text(s['status']?.toString() ?? ''),
                    );
                  },
                ),
    );
  }
}
