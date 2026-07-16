import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../l10n/app_localizations.dart';
import '../../models/content.dart';
import '../../models/content_bundle.dart';
import '../../models/subscription_plan.dart';
import '../../providers/services_provider.dart';

enum PaywallMode { subscribe, purchase, bundle }

class PaywallSheet extends ConsumerStatefulWidget {
  const PaywallSheet({
    super.key,
    required this.mode,
    this.plan,
    this.content,
    this.bundle,
    this.creatorName,
    this.onSuccess,
  });

  final PaywallMode mode;
  final SubscriptionPlanModel? plan;
  final ContentModel? content;
  final ContentBundleModel? bundle;
  final String? creatorName;
  final VoidCallback? onSuccess;

  static Future<void> show(
    BuildContext context, {
    required PaywallMode mode,
    SubscriptionPlanModel? plan,
    ContentModel? content,
    ContentBundleModel? bundle,
    String? creatorName,
    VoidCallback? onSuccess,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => PaywallSheet(
        mode: mode,
        plan: plan,
        content: content,
        bundle: bundle,
        creatorName: creatorName,
        onSuccess: onSuccess,
      ),
    );
  }

  @override
  ConsumerState<PaywallSheet> createState() => _PaywallSheetState();
}

class _PaywallSheetState extends ConsumerState<PaywallSheet> {
  bool _loading = false;
  bool _unlocked = false;

  double get _price {
    if (widget.mode == PaywallMode.subscribe) return widget.plan?.price ?? 0;
    if (widget.mode == PaywallMode.bundle) return widget.bundle?.price ?? 0;
    return widget.content?.price ?? 0;
  }

  Future<void> _confirm() async {
    setState(() => _loading = true);
    final l10n = AppLocalizations.of(context);
    try {
      final wallet = await ref.read(walletServiceProvider).getWallet();
      final balance = wallet.balance;
      if (balance < _price) {
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l10n.insufficientBalance)),
          );
          context.push('/wallet');
        }
        return;
      }

      if (widget.mode == PaywallMode.subscribe && widget.plan != null) {
        await ref.read(subscriptionsServiceProvider).subscribe(widget.plan!.id);
      } else if (widget.mode == PaywallMode.bundle && widget.bundle != null) {
        await ref.read(bundlesServiceProvider).purchaseBundle(widget.bundle!.id);
      } else if (widget.content != null) {
        await ref.read(contentServiceProvider).purchase(widget.content!.id);
      }

      setState(() => _unlocked = true);
      await Future.delayed(const Duration(milliseconds: 1200));
      if (mounted) {
        widget.onSuccess?.call();
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final String title;
    switch (widget.mode) {
      case PaywallMode.subscribe:
        title = l10n.subscribeTo(widget.creatorName ?? l10n.creator);
      case PaywallMode.bundle:
        title = widget.bundle?.title ?? l10n.unlockBundle;
      case PaywallMode.purchase:
        title = l10n.unlockContent;
    }

    final String subtitle;
    if (widget.mode == PaywallMode.subscribe) {
      subtitle = l10n.planSubtitle(widget.plan?.name ?? '');
    } else if (widget.mode == PaywallMode.purchase) {
      subtitle = l10n.oneTimeUnlock;
    } else {
      subtitle = l10n.itemsIncluded(widget.bundle?.contentIds.length ?? 0);
    }

    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 24),
          if (_unlocked)
            Column(
              children: [
                const Text('✨', style: TextStyle(fontSize: 48)),
                const SizedBox(height: 8),
                Text(
                  l10n.unlocked,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primary),
                ),
              ],
            )
          else ...[
            Text(
              Formatters.currency(_price),
              style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppColors.primary),
            ),
            const SizedBox(height: 8),
            Text(subtitle, style: const TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 24),
            ListTile(
              tileColor: AppColors.surfaceLight,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: const BorderSide(color: AppColors.primary),
              ),
              title: Text(l10n.fanoraWallet),
              subtitle: Text(l10n.payFromBalance),
              leading: const Icon(Icons.account_balance_wallet, color: AppColors.primary),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _confirm,
              child: _loading
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : Text(l10n.confirmAmount(Formatters.currency(_price))),
            ),
            const SizedBox(height: 8),
            Text(
              l10n.securePayment,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ],
        ],
      ),
    );
  }
}
