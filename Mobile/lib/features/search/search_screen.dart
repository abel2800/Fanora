import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/widgets/app_avatar.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _query = TextEditingController();
  bool _loading = false;
  dynamic _results;

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    if (_query.text.trim().isEmpty) return;
    setState(() => _loading = true);
    try {
      final results = await ref.read(searchServiceProvider).search(_query.text.trim());
      setState(() => _results = results);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.search,
      showBack: true,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _query,
                    decoration: InputDecoration(hintText: l10n.searchHint),
                    onSubmitted: (_) => _search(),
                  ),
                ),
                IconButton(icon: const Icon(Icons.search), onPressed: _search),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const LoadingView()
                : _results == null
                    ? EmptyView(message: l10n.searchEmpty)
                    : ListView(
                        children: [
                          if (_results.users.isNotEmpty) ...[
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Text(l10n.creators, style: const TextStyle(fontWeight: FontWeight.bold)),
                            ),
                            ..._results.users.map((u) => ListTile(
                                  leading: AppAvatar(imageUrl: u.profileImage, name: u.username),
                                  title: Text(u.username),
                                  onTap: () => context.push('/creator/${u.username}'),
                                )),
                          ],
                          if (_results.content.isNotEmpty) ...[
                            Padding(
                              padding: const EdgeInsets.all(16),
                              child: Text(l10n.content, style: const TextStyle(fontWeight: FontWeight.bold)),
                            ),
                            ..._results.content.map((c) => ListTile(
                                  title: Text(c.title),
                                  subtitle: Text(c.creator?.username ?? ''),
                                  onTap: () => context.push('/content/${c.id}'),
                                )),
                          ],
                          if (_results.users.isEmpty && _results.content.isEmpty)
                            EmptyView(message: l10n.noResults),
                        ],
                      ),
          ),
        ],
      ),
    );
  }
}
