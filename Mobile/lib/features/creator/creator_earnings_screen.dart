import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class CreatorEarningsScreen extends ConsumerStatefulWidget {
  const CreatorEarningsScreen({super.key});

  @override
  ConsumerState<CreatorEarningsScreen> createState() => _CreatorEarningsScreenState();
}

class _CreatorEarningsScreenState extends ConsumerState<CreatorEarningsScreen> {
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
      final data = await ref.read(subscriptionsServiceProvider).getEarnings();
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
      title: l10n.earnings,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Card(
                      child: ListTile(
                        title: Text(l10n.totalEarnings),
                        trailing: Text(Formatters.currency(_data?['totalEarnings'] ?? 0)),
                      ),
                    ),
                    Card(
                      child: ListTile(
                        title: Text(l10n.thisMonth),
                        trailing: Text(Formatters.currency(_data?['monthlyEarnings'] ?? 0)),
                      ),
                    ),
                    Card(
                      child: ListTile(
                        title: Text(l10n.tipsReceived),
                        trailing: Text(Formatters.currency(_data?['tipsEarnings'] ?? 0)),
                      ),
                    ),
                  ],
                ),
    );
  }
}
