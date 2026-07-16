import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class LinkAccountsScreen extends ConsumerStatefulWidget {
  const LinkAccountsScreen({super.key});

  @override
  ConsumerState<LinkAccountsScreen> createState() => _LinkAccountsScreenState();
}

class _LinkAccountsScreenState extends ConsumerState<LinkAccountsScreen> {
  final _telebirrPhone = TextEditingController();
  final _cbePhone = TextEditingController();
  final _cbeAccount = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _telebirrPhone.dispose();
    _cbePhone.dispose();
    _cbeAccount.dispose();
    super.dispose();
  }

  Future<void> _linkTelebirr() async {
    setState(() => _loading = true);
    final l10n = AppLocalizations.of(context);
    try {
      await ref.read(walletServiceProvider).linkTelebirr(_telebirrPhone.text.trim());
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.telebirrLinked)));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _linkCbe() async {
    setState(() => _loading = true);
    final l10n = AppLocalizations.of(context);
    try {
      await ref.read(walletServiceProvider).linkCbe(
            phoneNumber: _cbePhone.text.trim(),
            accountNumber: _cbeAccount.text.trim(),
          );
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.cbeLinked)));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.linkAccounts,
      showBack: true,
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(l10n.telebirr, style: const TextStyle(fontWeight: FontWeight.bold)),
          TextField(controller: _telebirrPhone, decoration: InputDecoration(labelText: l10n.phoneNumber)),
          ElevatedButton(onPressed: _loading ? null : _linkTelebirr, child: Text(l10n.linkTelebirr)),
          const Divider(height: 32),
          Text(l10n.cbe, style: const TextStyle(fontWeight: FontWeight.bold)),
          TextField(controller: _cbePhone, decoration: InputDecoration(labelText: l10n.phoneNumber)),
          TextField(controller: _cbeAccount, decoration: InputDecoration(labelText: l10n.accountNumber)),
          ElevatedButton(onPressed: _loading ? null : _linkCbe, child: Text(l10n.linkCbe)),
        ],
      ),
    );
  }
}
