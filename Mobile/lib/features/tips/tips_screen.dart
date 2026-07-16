import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class TipsScreen extends ConsumerStatefulWidget {
  const TipsScreen({super.key});

  @override
  ConsumerState<TipsScreen> createState() => _TipsScreenState();
}

class _TipsScreenState extends ConsumerState<TipsScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  List<Map<String, dynamic>> _sent = [];
  List<Map<String, dynamic>> _received = [];
  Map<String, dynamic>? _stats;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final sent = await ref.read(tipsServiceProvider).getSent();
      final received = await ref.read(tipsServiceProvider).getReceived();
      final stats = await ref.read(tipsServiceProvider).getStats();
      setState(() {
        _sent = sent;
        _received = received;
        _stats = stats;
      });
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.tips,
      showBack: true,
      bottom: TabBar(controller: _tabs, tabs: [Tab(text: l10n.sent), Tab(text: l10n.received)]),
      body: _loading
          ? const LoadingView()
          : Column(
              children: [
                if (_stats != null)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        Text(l10n.sentAmount(Formatters.currency(_stats!['totalSent'] ?? 0))),
                        Text(l10n.receivedAmount(Formatters.currency(_stats!['totalReceived'] ?? 0))),
                      ],
                    ),
                  ),
                Expanded(
                  child: TabBarView(
                    controller: _tabs,
                    children: [
                      _buildList(_sent, l10n.noTipsSent),
                      _buildList(_received, l10n.noTipsReceived),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildList(List<Map<String, dynamic>> items, String empty) {
    if (items.isEmpty) return EmptyView(message: empty);
    return ListView.builder(
      itemCount: items.length,
      itemBuilder: (_, i) {
        final t = items[i];
        return ListTile(
          title: Text(Formatters.currency(t['amount'] ?? 0)),
          subtitle: Text(t['message']?.toString() ?? t['createdAt']?.toString() ?? ''),
        );
      },
    );
  }
}
