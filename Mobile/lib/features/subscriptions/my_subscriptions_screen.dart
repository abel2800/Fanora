import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/subscription_plan.dart';
import '../../providers/services_provider.dart';

class MySubscriptionsScreen extends ConsumerStatefulWidget {
  const MySubscriptionsScreen({super.key});

  @override
  ConsumerState<MySubscriptionsScreen> createState() => _MySubscriptionsScreenState();
}

class _MySubscriptionsScreenState extends ConsumerState<MySubscriptionsScreen> {
  List<UserSubscriptionModel> _subs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final subs = await ref.read(subscriptionsServiceProvider).getMySubscriptions();
      setState(() => _subs = subs);
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _cancel(String id) async {
    try {
      await ref.read(subscriptionsServiceProvider).cancel(id);
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _pause(String id) async {
    final l10n = AppLocalizations.of(context);
    try {
      await ref.read(subscriptionsServiceProvider).pause(id);
      await _load();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.subscriptionPaused)));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.subscriptions,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : _subs.isEmpty
              ? EmptyView(message: l10n.noActiveSubscriptions)
              : ListView.builder(
                  itemCount: _subs.length,
                  itemBuilder: (_, i) {
                    final s = _subs[i];
                    return ListTile(
                      title: Text(s.plan?.name ?? l10n.subscription),
                      subtitle: Text('${s.status} · ${s.endDate != null ? Formatters.date(s.endDate!) : ''}'),
                      trailing: s.status == 'active'
                          ? Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                TextButton(onPressed: () => _pause(s.id), child: Text(l10n.pause)),
                                TextButton(onPressed: () => _cancel(s.id), child: Text(l10n.cancel)),
                              ],
                            )
                          : null,
                    );
                  },
                ),
    );
  }
}
