import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class ReferralScreen extends ConsumerStatefulWidget {
  const ReferralScreen({super.key});

  @override
  ConsumerState<ReferralScreen> createState() => _ReferralScreenState();
}

class _ReferralScreenState extends ConsumerState<ReferralScreen> {
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
      final data = await ref.read(creatorsServiceProvider).getReferral();
      setState(() => _data = data);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  void _copy(String text) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context).copied)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.referralProgram,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(l10n.yourReferralCode, style: const TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    _data?['referralCode']?.toString() ?? '',
                                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.copy),
                                  onPressed: () => _copy(_data?['referralCode']?.toString() ?? ''),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            TextButton(
                              onPressed: () => _copy(_data?['referralLink']?.toString() ?? ''),
                              child: Text(l10n.copyReferralLink),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    _stat(l10n.totalBonus, Formatters.currency(_data?['totalBonus'] ?? 0)),
                    _stat(l10n.qualifiedReferrals, '${_data?['qualifiedCount'] ?? 0}'),
                    const SizedBox(height: 16),
                    Text(l10n.referrals, style: const TextStyle(fontWeight: FontWeight.bold)),
                    ...((_data?['referrals'] as List?) ?? []).map((r) {
                      final item = Map<String, dynamic>.from(r as Map);
                      final referred = item['referredCreator'] as Map?;
                      return ListTile(
                        title: Text(referred?['username']?.toString() ?? l10n.creator),
                        subtitle: Text(item['status']?.toString() ?? ''),
                        trailing: Text(Formatters.currency(item['bonusEarned'] ?? 0)),
                      );
                    }),
                  ],
                ),
    );
  }

  Widget _stat(String label, String value) => Card(
        child: ListTile(title: Text(label), trailing: Text(value, style: const TextStyle(fontWeight: FontWeight.bold))),
      );
}
