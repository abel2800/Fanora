import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/skeleton.dart';
import '../../l10n/app_localizations.dart';
import '../../models/gift_voucher.dart';
import '../../providers/services_provider.dart';

class GiftsScreen extends ConsumerStatefulWidget {
  const GiftsScreen({super.key});

  @override
  ConsumerState<GiftsScreen> createState() => _GiftsScreenState();
}

class _GiftsScreenState extends ConsumerState<GiftsScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  List<GiftVoucherModel> _mine = [];
  bool _loading = true;
  String? _error;

  final _code = TextEditingController();
  final _planId = TextEditingController();
  final _phone = TextEditingController();
  final _pin = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    _code.dispose();
    _planId.dispose();
    _phone.dispose();
    _pin.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(giftsServiceProvider).mine();
      setState(() => _mine = items);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _redeem() async {
    if (_code.text.trim().isEmpty) return;
    final l10n = AppLocalizations.of(context);
    try {
      await ref.read(giftsServiceProvider).redeem(_code.text.trim());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.giftRedeemed)));
        _code.clear();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _create() async {
    final planId = _planId.text.trim();
    if (planId.isEmpty) return;
    final l10n = AppLocalizations.of(context);
    try {
      final voucher = await ref.read(giftsServiceProvider).create(
            planId: planId,
            recipientPhone: _phone.text.trim().isEmpty ? null : _phone.text.trim(),
            pin: _pin.text.trim().isEmpty ? null : _pin.text.trim(),
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.createdGift(voucher.code))));
        await _load();
        _tabs.animateTo(0);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.giftSubscriptions,
      showBack: true,
      body: Column(
        children: [
          TabBar(
            controller: _tabs,
            tabs: [
              Tab(text: l10n.myGifts),
              Tab(text: l10n.createGift),
              Tab(text: l10n.redeemGift),
            ],
          ),
          Expanded(
            child: TabBarView(
              controller: _tabs,
              children: [
                _loading
                    ? const SkeletonList()
                    : _error != null
                        ? ErrorView(message: _error!, onRetry: _load)
                        : _mine.isEmpty
                            ? EmptyView(message: l10n.myGifts)
                            : RefreshIndicator(
                                onRefresh: _load,
                                child: ListView.separated(
                                  padding: const EdgeInsets.all(16),
                                  itemCount: _mine.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                                  itemBuilder: (_, i) {
                                    final g = _mine[i];
                                    return Card(
                                      child: ListTile(
                                        title: Text(g.code),
                                        subtitle: Text(
                                          '${g.status} · ${Formatters.currency(g.amount)}'
                                          '${g.plan != null ? ' · ${g.plan!.name}' : ''}',
                                        ),
                                        trailing: IconButton(
                                          icon: const Icon(Icons.copy),
                                          onPressed: () {
                                            Clipboard.setData(ClipboardData(text: g.code));
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              SnackBar(content: Text(l10n.copy)),
                                            );
                                          },
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    TextField(
                      controller: _planId,
                      decoration: InputDecoration(labelText: l10n.planId),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _phone,
                      decoration: InputDecoration(labelText: l10n.recipientPhone),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: _pin,
                      obscureText: true,
                      decoration: InputDecoration(labelText: l10n.pin),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(onPressed: _create, child: Text(l10n.createGift)),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      TextField(
                        controller: _code,
                        decoration: InputDecoration(labelText: l10n.giftCode),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(onPressed: _redeem, child: Text(l10n.redeem)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
