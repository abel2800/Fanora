import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/subscription_plan.dart';
import '../../providers/services_provider.dart';

class SubscriptionPlansScreen extends ConsumerStatefulWidget {
  const SubscriptionPlansScreen({super.key});

  @override
  ConsumerState<SubscriptionPlansScreen> createState() => _SubscriptionPlansScreenState();
}

class _SubscriptionPlansScreenState extends ConsumerState<SubscriptionPlansScreen> {
  List<SubscriptionPlanModel> _plans = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final plans = await ref.read(subscriptionsServiceProvider).getMyPlans();
      setState(() => _plans = plans);
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _createPlan() async {
    final l10n = AppLocalizations.of(context);
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.newPlan),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: nameCtrl, decoration: InputDecoration(labelText: l10n.name)),
            TextField(
              controller: priceCtrl,
              decoration: InputDecoration(labelText: l10n.priceEtb),
              keyboardType: TextInputType.number,
            ),
            TextField(controller: descCtrl, decoration: InputDecoration(labelText: l10n.description)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l10n.cancel)),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l10n.create)),
        ],
      ),
    );
    if (ok == true) {
      try {
        await ref.read(subscriptionsServiceProvider).createPlan({
          'name': nameCtrl.text,
          'price': double.tryParse(priceCtrl.text) ?? 0,
          'description': descCtrl.text,
          'billingPeriod': 'monthly',
        });
        await _load();
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
    nameCtrl.dispose();
    priceCtrl.dispose();
    descCtrl.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.subscriptionPlans,
      showBack: true,
      floatingActionButton: FloatingActionButton(onPressed: _createPlan, child: const Icon(Icons.add)),
      body: _loading
          ? const LoadingView()
          : _plans.isEmpty
              ? EmptyView(message: l10n.noPlansYet)
              : ListView.builder(
                  itemCount: _plans.length,
                  itemBuilder: (_, i) {
                    final p = _plans[i];
                    return ListTile(
                      title: Text(p.name),
                      subtitle: Text(p.description ?? ''),
                      trailing: Text(Formatters.currency(p.price ?? 0)),
                    );
                  },
                ),
    );
  }
}
