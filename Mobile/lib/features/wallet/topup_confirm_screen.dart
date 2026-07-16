import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class TopupConfirmScreen extends ConsumerStatefulWidget {
  const TopupConfirmScreen({super.key, required this.transactionId});

  final String transactionId;

  @override
  ConsumerState<TopupConfirmScreen> createState() => _TopupConfirmScreenState();
}

class _TopupConfirmScreenState extends ConsumerState<TopupConfirmScreen> {
  bool _loading = false;
  bool _done = false;

  Future<void> _confirm() async {
    setState(() => _loading = true);
    try {
      await ref.read(walletServiceProvider).confirmTopup(widget.transactionId);
      setState(() => _done = true);
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
      title: l10n.confirmTopup,
      showBack: true,
      body: Center(
        child: _done
            ? Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.check_circle, color: AppColors.success, size: 64),
                  const SizedBox(height: 16),
                  Text(l10n.topupConfirmed),
                  const SizedBox(height: 24),
                  ElevatedButton(onPressed: () => context.go('/wallet'), child: Text(l10n.goToWallet)),
                ],
              )
            : Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(l10n.completePaymentHint),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: _loading ? null : _confirm,
                    child: _loading ? const CircularProgressIndicator() : Text(l10n.confirmPayment),
                  ),
                ],
              ),
      ),
    );
  }
}
