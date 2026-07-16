import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class TopupTelebirrScreen extends ConsumerStatefulWidget {
  const TopupTelebirrScreen({super.key});

  @override
  ConsumerState<TopupTelebirrScreen> createState() => _TopupTelebirrScreenState();
}

class _TopupTelebirrScreenState extends ConsumerState<TopupTelebirrScreen> {
  final _amount = TextEditingController();
  final _pin = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _amount.dispose();
    _pin.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final amount = double.tryParse(_amount.text);
    if (amount == null) return;
    final l10n = AppLocalizations.of(context);
    if (_pin.text.length != 4) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.enterWalletPin)));
      return;
    }
    setState(() => _loading = true);
    try {
      final result = await ref.read(walletServiceProvider).topupTelebirr(amount, pin: _pin.text);
      final txId = result['transactionId']?.toString() ?? result['data']?['transactionId']?.toString();
      if (mounted && txId != null) context.push('/wallet/confirm/$txId');
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
      title: l10n.topupTelebirr,
      showBack: true,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextField(
              controller: _amount,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(labelText: l10n.amountEtb),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _pin,
              obscureText: true,
              keyboardType: TextInputType.number,
              maxLength: 4,
              decoration: InputDecoration(labelText: l10n.walletPin),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const CircularProgressIndicator() : Text(l10n.continueLabel),
            ),
          ],
        ),
      ),
    );
  }
}
