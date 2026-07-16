import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/transaction.dart';
import '../../providers/services_provider.dart';

class TransactionsScreen extends ConsumerStatefulWidget {
  const TransactionsScreen({super.key});

  @override
  ConsumerState<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends ConsumerState<TransactionsScreen> {
  List<TransactionModel> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final items = await ref.read(walletServiceProvider).getTransactions();
      setState(() => _items = items);
    } catch (_) {}
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.transactions,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : _items.isEmpty
              ? EmptyView(message: l10n.noTransactions)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    itemCount: _items.length,
                    itemBuilder: (_, i) {
                      final t = _items[i];
                      return ListTile(
                        title: Text(t.description ?? t.type),
                        subtitle: Text(Formatters.dateTime(t.createdAt ?? DateTime.now())),
                        trailing: Text(Formatters.currency(t.amount)),
                      );
                    },
                  ),
                ),
    );
  }
}
