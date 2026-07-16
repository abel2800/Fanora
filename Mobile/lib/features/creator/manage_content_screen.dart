import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/content.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';

class ManageContentScreen extends ConsumerStatefulWidget {
  const ManageContentScreen({super.key});

  @override
  ConsumerState<ManageContentScreen> createState() => _ManageContentScreenState();
}

class _ManageContentScreenState extends ConsumerState<ManageContentScreen> {
  List<ContentModel> _items = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final userId = ref.read(authProvider).user?.id;
    if (userId == null) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await ref.read(contentServiceProvider).getByCreator(userId);
      setState(() => _items = result.items);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _delete(String id) async {
    try {
      await ref.read(contentServiceProvider).delete(id);
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.manageContent,
      showBack: true,
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/creator/content/create'),
        child: const Icon(Icons.add),
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _items.isEmpty
                  ? EmptyView(message: l10n.noContentYet)
                  : ListView.builder(
                      itemCount: _items.length,
                      itemBuilder: (_, i) {
                        final item = _items[i];
                        return ListTile(
                          title: Text(item.title),
                          subtitle: Text('${item.status ?? ''} · ${item.type ?? ''}'),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline),
                            onPressed: () => _delete(item.id),
                          ),
                          onTap: () => context.push('/content/${item.id}'),
                        );
                      },
                    ),
    );
  }
}
