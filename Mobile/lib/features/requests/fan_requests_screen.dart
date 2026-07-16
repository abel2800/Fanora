import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/skeleton.dart';
import '../../l10n/app_localizations.dart';
import '../../models/custom_request.dart';
import '../../providers/services_provider.dart';

class FanRequestsScreen extends ConsumerStatefulWidget {
  const FanRequestsScreen({super.key});

  @override
  ConsumerState<FanRequestsScreen> createState() => _FanRequestsScreenState();
}

class _FanRequestsScreenState extends ConsumerState<FanRequestsScreen> {
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
      final items = await ref.read(requestsServiceProvider).mine();
      setState(() => _items = items);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _pay(CustomRequestModel request) async {
    try {
      await ref.read(requestsServiceProvider).pay(request.id);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context).requestPaymentDone)),
      );
      await _load();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.customRequests,
      showBack: true,
      actions: [
        IconButton(
          icon: const Icon(Icons.add),
          onPressed: () async {
            await context.push('/requests/create');
            _load();
          },
        ),
      ],
      body: _loading
          ? const SkeletonList()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _items.isEmpty
                  ? EmptyView(message: l10n.customRequests)
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, i) {
                          final r = _items[i];
                          return Card(
                            child: ListTile(
                              title: Text(r.description, maxLines: 2, overflow: TextOverflow.ellipsis),
                              subtitle: Text(
                                '${r.creator?.username ?? ''} · ${r.status} · ${Formatters.currency(r.offeredPrice)}',
                              ),
                              trailing: r.deliveryContentId != null
                                  ? IconButton(
                                      icon: const Icon(Icons.open_in_new),
                                      onPressed: () => context.push('/content/${r.deliveryContentId}'),
                                    )
                                  : ['accepted', 'countered'].contains(r.status) &&
                                          r.paymentStatus != 'paid'
                                      ? FilledButton(
                                          onPressed: () => _pay(r),
                                          child: Text(
                                            AppLocalizations.of(context).payAmount(Formatters.currency(r.counterPrice ?? r.offeredPrice)),
                                          ),
                                        )
                                      : null,
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
