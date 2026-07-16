import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_avatar.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/content.dart';
import '../../models/user.dart';
import '../../providers/services_provider.dart';

class ExploreScreen extends ConsumerStatefulWidget {
  const ExploreScreen({super.key});

  @override
  ConsumerState<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends ConsumerState<ExploreScreen> {
  List<UserModel> _creators = [];
  List<ContentModel> _trending = [];
  List<ContentModel> _rising = [];
  bool _loading = true;
  String? _error;
  String _filter = 'all';

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
      final creators = await ref.read(creatorsServiceProvider).listCreators();
      final trending = await ref.read(contentServiceProvider).getTrending(limit: 24);
      final rising = await ref.read(contentServiceProvider).getTrending(limit: 8);
      setState(() {
        _creators = creators;
        _trending = trending;
        _rising = rising.take(8).toList();
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  List<ContentModel> get _filtered {
    switch (_filter) {
      case 'video':
        return _trending.where((c) => c.type == 'video').toList();
      case 'image':
        return _trending.where((c) => c.type == 'image').toList();
      default:
        return _trending;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final filtered = _filtered;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.explore),
        actions: [
          IconButton(icon: const Icon(Icons.search), onPressed: () => context.push('/search')),
        ],
      ),
      body: _loading
          ? const LoadingView(variant: LoadingVariant.explore)
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: CustomScrollView(
                    slivers: [
                      SliverToBoxAdapter(
                        child: SizedBox(
                          height: 40,
                          child: ListView(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            children: [
                              _chip(l10n.all, 'all'),
                              _chip(l10n.videos, 'video'),
                              _chip(l10n.images, 'image'),
                              _chip(l10n.creators, 'creators'),
                            ],
                          ),
                        ),
                      ),
                      if (_filter != 'creators') ...[
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                            child: Text(l10n.rising, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ),
                        if (_rising.isEmpty)
                          const SliverToBoxAdapter(child: EmptyView(message: '—'))
                        else
                          SliverToBoxAdapter(
                            child: SizedBox(
                              height: 108,
                              child: ListView.separated(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                scrollDirection: Axis.horizontal,
                                itemCount: _rising.length,
                                separatorBuilder: (_, __) => const SizedBox(width: 12),
                                itemBuilder: (_, i) {
                                  final c = _rising[i];
                                  final url = Formatters.resolveMediaUrl(c.thumbnailUrl ?? c.mediaUrl);
                                  return InkWell(
                                    onTap: () => context.push('/content/${c.id}'),
                                    borderRadius: BorderRadius.circular(16),
                                    child: Container(
                                      width: 160,
                                      decoration: BoxDecoration(
                                        color: AppColors.surface,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(color: AppColors.border),
                                      ),
                                      clipBehavior: Clip.antiAlias,
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Expanded(
                                            child: url.isEmpty
                                                ? const ColoredBox(color: AppColors.surfaceLight)
                                                : CachedNetworkImage(imageUrl: url, fit: BoxFit.cover, width: double.infinity),
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(8),
                                            child: Text(c.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ),
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                            child: Text(l10n.trending, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ),
                        if (filtered.isEmpty)
                          SliverFillRemaining(child: EmptyView(message: l10n.noTrendingContent))
                        else
                          SliverPadding(
                            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                            sliver: SliverGrid(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                mainAxisSpacing: 12,
                                crossAxisSpacing: 12,
                                childAspectRatio: 0.72,
                              ),
                              delegate: SliverChildBuilderDelegate(
                                (context, i) {
                                  final c = filtered[i];
                                  final tall = i.isOdd;
                                  final url = Formatters.resolveMediaUrl(c.thumbnailUrl ?? c.mediaUrl);
                                  return InkWell(
                                    onTap: () => context.push('/content/${c.id}'),
                                    borderRadius: BorderRadius.circular(16),
                                    child: Container(
                                      decoration: BoxDecoration(
                                        color: AppColors.surface,
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(color: AppColors.border),
                                      ),
                                      clipBehavior: Clip.antiAlias,
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Expanded(
                                            flex: tall ? 5 : 4,
                                            child: url.isEmpty
                                                ? ColoredBox(
                                                    color: AppColors.surfaceLight,
                                                    child: Center(child: Icon(c.type == 'video' ? Icons.play_circle : Icons.image, color: AppColors.primary)),
                                                  )
                                                : CachedNetworkImage(imageUrl: url, fit: BoxFit.cover, width: double.infinity),
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.all(10),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(c.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600)),
                                                if (c.creator != null)
                                                  Text('@${c.creator!.username}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                                childCount: filtered.length,
                              ),
                            ),
                          ),
                      ] else
                        SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, i) {
                              final c = _creators[i];
                              return ListTile(
                                leading: AppAvatar(imageUrl: c.profileImage, name: c.username),
                                title: Text(c.username),
                                subtitle: Text(c.bio ?? ''),
                                trailing: c.isVerified ? const Icon(Icons.verified, color: AppColors.primary, size: 18) : null,
                                onTap: () => context.push('/creator/${c.username}'),
                              );
                            },
                            childCount: _creators.length,
                          ),
                        ),
                    ],
                  ),
                ),
    );
  }

  Widget _chip(String label, String value) {
    final selected = _filter == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => setState(() => _filter = value),
        selectedColor: AppColors.primary.withValues(alpha: 0.25),
        checkmarkColor: AppColors.primary,
        side: BorderSide(color: selected ? AppColors.primary : AppColors.border),
      ),
    );
  }
}
