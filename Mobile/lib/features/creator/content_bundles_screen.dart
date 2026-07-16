import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/content_bundle.dart';
import '../../providers/services_provider.dart';

class ContentBundlesScreen extends ConsumerStatefulWidget {
  const ContentBundlesScreen({super.key});

  @override
  ConsumerState<ContentBundlesScreen> createState() => _ContentBundlesScreenState();
}

class _ContentBundlesScreenState extends ConsumerState<ContentBundlesScreen> {
  List<ContentBundleModel> _bundles = [];
  bool _loading = true;
  bool _creating = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final bundles = await ref.read(bundlesServiceProvider).getMyBundles();
      setState(() => _bundles = bundles);
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _createBundle() async {
    final l10n = AppLocalizations.of(context);
    final titleCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final contentIdsCtrl = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.newBundle),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: titleCtrl, decoration: InputDecoration(labelText: l10n.title)),
              TextField(controller: descCtrl, decoration: InputDecoration(labelText: l10n.description)),
              TextField(
                controller: priceCtrl,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: l10n.priceEtb),
              ),
              TextField(
                controller: contentIdsCtrl,
                decoration: InputDecoration(labelText: l10n.contentIdsHint),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l10n.cancel)),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l10n.create)),
        ],
      ),
    );

    if (ok != true) return;
    final price = double.tryParse(priceCtrl.text.trim());
    final ids = contentIdsCtrl.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    if (titleCtrl.text.trim().isEmpty || price == null || ids.isEmpty) return;

    setState(() => _creating = true);
    try {
      await ref.read(bundlesServiceProvider).createBundle(
            title: titleCtrl.text.trim(),
            description: descCtrl.text.trim(),
            price: price,
            contentIds: ids,
          );
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _creating = false);
    }
  }

  Future<void> _toggleActive(ContentBundleModel bundle) async {
    try {
      await ref.read(bundlesServiceProvider).updateBundle(bundle.id, {'isActive': !bundle.isActive});
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _delete(ContentBundleModel bundle) async {
    final l10n = AppLocalizations.of(context);
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.deleteBundle),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l10n.cancel)),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l10n.delete)),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await ref.read(bundlesServiceProvider).deleteBundle(bundle.id);
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.contentBundles,
      showBack: true,
      floatingActionButton: FloatingActionButton(
        onPressed: _creating ? null : _createBundle,
        child: const Icon(Icons.add),
      ),
      body: _loading
          ? const LoadingView()
          : _bundles.isEmpty
              ? EmptyView(message: l10n.noBundlesYet)
              : ListView.builder(
                  itemCount: _bundles.length,
                  itemBuilder: (_, i) {
                    final b = _bundles[i];
                    return ListTile(
                      title: Text(b.title),
                      subtitle: Text(l10n.itemsSales(b.contentIds.length, b.purchaseCount)),
                      trailing: Text(Formatters.currency(b.price)),
                      onTap: () => _toggleActive(b),
                      onLongPress: () => _delete(b),
                    );
                  },
                ),
    );
  }
}
