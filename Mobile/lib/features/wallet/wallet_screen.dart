import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/wallet.dart';
import '../../providers/services_provider.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({super.key});

  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  WalletModel? _wallet;
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
      final wallet = await ref.read(walletServiceProvider).getWallet();
      setState(() => _wallet = wallet);
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
      title: l10n.wallet,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            children: [
                              Text(l10n.availableBalance),
                              const SizedBox(height: 8),
                              Text(
                                Formatters.currency(_wallet!.balance),
                                style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => context.push('/wallet/topup/telebirr'),
                              icon: const Icon(Icons.phone_android),
                              label: Text(l10n.telebirr),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => context.push('/wallet/topup/cbe'),
                              icon: const Icon(Icons.account_balance),
                              label: Text(l10n.cbe),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ListTile(
                        leading: const Icon(Icons.lock_outline),
                        title: Text(l10n.walletPin),
                        subtitle: Text(_wallet!.hasPinCode ? l10n.pinIsSet : l10n.setYourPin),
                        onTap: () => context.push('/wallet/pin'),
                      ),
                      ListTile(
                        leading: const Icon(Icons.link),
                        title: Text(l10n.linkAccounts),
                        onTap: () => context.push('/wallet/link-accounts'),
                      ),
                      ListTile(
                        leading: const Icon(Icons.receipt_long),
                        title: Text(l10n.transactions),
                        onTap: () => context.push('/wallet/transactions'),
                      ),
                      if (_wallet!.recentTransactions.isNotEmpty) ...[
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(l10n.recent, style: const TextStyle(fontWeight: FontWeight.bold)),
                        ),
                        ..._wallet!.recentTransactions.take(5).map(
                              (t) => ListTile(
                                title: Text(t.description ?? t.type),
                                subtitle: Text(t.status ?? ''),
                                trailing: Text(Formatters.currency(t.amount)),
                              ),
                            ),
                      ],
                    ],
                  ),
                ),
    );
  }
}
