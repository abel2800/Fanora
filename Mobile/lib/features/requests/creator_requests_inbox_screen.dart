import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/skeleton.dart';
import '../../l10n/app_localizations.dart';
import '../../models/custom_request.dart';
import '../../providers/services_provider.dart';

class CreatorRequestsInboxScreen extends ConsumerStatefulWidget {
  const CreatorRequestsInboxScreen({super.key});

  @override
  ConsumerState<CreatorRequestsInboxScreen> createState() => _CreatorRequestsInboxScreenState();
}

class _CreatorRequestsInboxScreenState extends ConsumerState<CreatorRequestsInboxScreen> {
  List<CustomRequestModel> _items = [];
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
      final items = await ref.read(requestsServiceProvider).inbox();
      setState(() => _items = items);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _respond(CustomRequestModel request, String action, {double? counter}) async {
    try {
      await ref.read(requestsServiceProvider).respond(request.id, action: action, counterPrice: counter);
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _deliver(CustomRequestModel request) async {
    final ctrl = TextEditingController();
    final contentId = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).colorScheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        final l10n = AppLocalizations.of(ctx);
        return Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.deliver, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              TextField(controller: ctrl, decoration: InputDecoration(labelText: AppLocalizations.of(context).contentId)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx, ctrl.text.trim()),
                child: Text(l10n.deliver),
              ),
            ],
          ),
        );
      },
    );
    if (contentId == null) return;
    try {
      await ref.read(requestsServiceProvider).deliver(request.id, contentId: contentId.isEmpty ? null : contentId);
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _counter(CustomRequestModel request) async {
    final ctrl = TextEditingController(text: request.offeredPrice.toStringAsFixed(0));
    final price = await showDialog<double>(
      context: context,
      builder: (ctx) {
        final l10n = AppLocalizations.of(ctx);
        return AlertDialog(
          title: Text(l10n.counter),
          content: TextField(
            controller: ctrl,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(labelText: l10n.offeredPrice),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: Text(l10n.cancel)),
            TextButton(
              onPressed: () => Navigator.pop(ctx, double.tryParse(ctrl.text.trim())),
              child: Text(l10n.submit),
            ),
          ],
        );
      },
    );
    if (price == null) return;
    await _respond(request, 'counter', counter: price);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.requestInbox,
      showBack: true,
      body: _loading
          ? const SkeletonList()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _items.isEmpty
                  ? EmptyView(message: l10n.requestInbox)
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, i) {
                          final r = _items[i];
                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(r.fan?.username ?? AppLocalizations.of(context).fan, style: const TextStyle(fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 8),
                                  Text(r.description),
                                  const SizedBox(height: 8),
                                  Text(
                                    '${l10n.status}: ${r.status} · ${Formatters.currency(r.offeredPrice)}'
                                    '${r.counterPrice != null ? ' → ${Formatters.currency(r.counterPrice!)}' : ''}',
                                  ),
                                  if (r.status == 'requested' || r.status == 'countered') ...[
                                    const SizedBox(height: 12),
                                    Wrap(
                                      spacing: 8,
                                      children: [
                                        OutlinedButton(
                                          onPressed: () => _respond(r, 'accept'),
                                          child: Text(l10n.accept),
                                        ),
                                        OutlinedButton(
                                          onPressed: () => _counter(r),
                                          child: Text(l10n.counter),
                                        ),
                                        OutlinedButton(
                                          onPressed: () => _respond(r, 'decline'),
                                          child: Text(l10n.decline),
                                        ),
                                      ],
                                    ),
                                  ],
                                  if (r.status == 'accepted') ...[
                                    const SizedBox(height: 12),
                                    ElevatedButton(
                                      onPressed: () => _deliver(r),
                                      child: Text(l10n.deliver),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
