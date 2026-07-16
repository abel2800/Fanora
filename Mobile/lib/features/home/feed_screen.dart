import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pull_to_refresh_flutter3/pull_to_refresh_flutter3.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/content.dart';
import '../../providers/services_provider.dart';
import '../content/content_card.dart';
import '../stories/stories_row.dart';

class FeedScreen extends ConsumerStatefulWidget {
  const FeedScreen({super.key});

  @override
  ConsumerState<FeedScreen> createState() => _FeedScreenState();
}

class _FeedScreenState extends ConsumerState<FeedScreen> {
  final _refreshController = RefreshController();
  final _items = <ContentModel>[];
  int _page = 1;
  bool _loading = true;
  String? _error;
  bool _hasMore = true;
  String _mode = 'for-you';

  @override
  void initState() {
    super.initState();
    _load(refresh: true);
  }

  @override
  void dispose() {
    _refreshController.dispose();
    super.dispose();
  }

  Future<void> _load({bool refresh = false}) async {
    if (refresh) {
      _page = 1;
      _hasMore = true;
    }
    if (!_hasMore && !refresh) return;

    setState(() {
      _loading = refresh;
      _error = null;
    });

    try {
      final result = await ref.read(contentServiceProvider).getFeed(
            page: _page,
            mode: _mode,
          );
      setState(() {
        if (refresh) _items.clear();
        _items.addAll(result.items);
        _hasMore = result.pagination?.hasMore ?? result.items.isNotEmpty;
        if (_hasMore) _page++;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
      if (refresh) {
        _refreshController.refreshCompleted();
      } else {
        _refreshController.loadComplete();
      }
    }
  }

  void _setMode(String mode) {
    if (_mode == mode) return;
    setState(() => _mode = mode);
    _load(refresh: true);
  }

  Future<void> _toggleLike(ContentModel item, int index) async {
    try {
      if (item.isLiked) {
        await ref.read(contentServiceProvider).unlike(item.id);
        setState(() {
          _items[index] = item.copyWith(isLiked: false, likesCount: item.likesCount - 1);
        });
      } else {
        await ref.read(contentServiceProvider).like(item.id);
        setState(() {
          _items[index] = item.copyWith(isLiked: true, likesCount: item.likesCount + 1);
        });
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.appName),
        actions: [
          IconButton(icon: const Icon(Icons.live_tv), onPressed: () => context.push('/live')),
          IconButton(icon: const Icon(Icons.notifications_outlined), onPressed: () => context.push('/notifications')),
          IconButton(icon: const Icon(Icons.search), onPressed: () => context.push('/search')),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: SegmentedButton<String>(
                    segments: [
                      ButtonSegment(value: 'for-you', label: Text(l10n.forYou)),
                      ButtonSegment(value: 'following', label: Text(l10n.following)),
                    ],
                    selected: {_mode},
                    onSelectionChanged: (v) => _setMode(v.first),
                    style: ButtonStyle(
                      foregroundColor: WidgetStateProperty.resolveWith(
                        (s) => s.contains(WidgetState.selected) ? AppColors.background : AppColors.textSecondary,
                      ),
                      backgroundColor: WidgetStateProperty.resolveWith(
                        (s) => s.contains(WidgetState.selected) ? AppColors.primary : AppColors.surfaceLight,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: _loading && _items.isEmpty
          ? const LoadingView(variant: LoadingVariant.feed)
          : _error != null && _items.isEmpty
              ? ErrorView(message: _error!, onRetry: () => _load(refresh: true))
              : SmartRefresher(
                  controller: _refreshController,
                  enablePullUp: _hasMore,
                  onRefresh: () => _load(refresh: true),
                  onLoading: () => _load(),
                  child: _items.isEmpty
                      ? ListView(
                          children: [
                            const StoriesRow(),
                            EmptyView(message: l10n.noContent),
                          ],
                        )
                      : ListView.builder(
                          itemCount: _items.length + 1,
                          itemBuilder: (context, index) {
                            if (index == 0) return const StoriesRow();
                            final item = _items[index - 1];
                            return ContentCard(
                              content: item,
                              onLike: () => _toggleLike(item, index - 1),
                              onUnlike: () => _toggleLike(item, index - 1),
                            );
                          },
                        ),
                ),
    );
  }
}
