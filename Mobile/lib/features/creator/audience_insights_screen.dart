import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class AudienceInsightsScreen extends ConsumerStatefulWidget {
  const AudienceInsightsScreen({super.key});

  @override
  ConsumerState<AudienceInsightsScreen> createState() => _AudienceInsightsScreenState();
}

class _AudienceInsightsScreenState extends ConsumerState<AudienceInsightsScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await ref.read(creatorsServiceProvider).getInsights();
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
      title: l10n.audienceInsights,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _card(l10n.activeSubscribers, '${_data?['activeSubscribers'] ?? 0}'),
                    _card(l10n.tipsRevenue30d, Formatters.currency(_data?['tipsRevenue'] ?? 0)),
                    _card(l10n.bestContentType, '${_data?['bestContentType'] ?? '—'}'),
                    const SizedBox(height: 16),
                    Text(l10n.topContent, style: const TextStyle(fontWeight: FontWeight.bold)),
                    ...((_data?['topContent'] as List?) ?? []).map((c) {
                      final item = Map<String, dynamic>.from(c as Map);
                      return ListTile(
                        title: Text(item['title']?.toString() ?? ''),
                        subtitle: Text('${l10n.viewsLabel(item['viewsCount'] ?? 0)} · ${item['type'] ?? ''}'),
                      );
                    }),
                    const SizedBox(height: 16),
                    Text(l10n.churnReasons, style: const TextStyle(fontWeight: FontWeight.bold)),
                    ...((_data?['churnReasons'] as Map?) ?? {}).entries.map(
                          (e) => ListTile(title: Text(e.key.toString()), trailing: Text('${e.value}')),
                        ),
                  ],
                ),
    );
  }

  Widget _card(String title, String value) => Card(
        child: ListTile(
          title: Text(title),
          trailing: Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ),
      );
}
