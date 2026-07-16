import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/loading_view.dart';
import '../../models/story.dart';
import '../../providers/services_provider.dart';

class StoryViewerScreen extends ConsumerStatefulWidget {
  const StoryViewerScreen({super.key, required this.storyIds, this.initialIndex = 0});

  final List<String> storyIds;
  final int initialIndex;

  @override
  ConsumerState<StoryViewerScreen> createState() => _StoryViewerScreenState();
}

class _StoryViewerScreenState extends ConsumerState<StoryViewerScreen> {
  late final PageController _pageCtrl;
  final _stories = <StoryModel>[];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _pageCtrl = PageController(initialPage: widget.initialIndex);
    _load();
  }

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    for (final id in widget.storyIds) {
      try {
        final story = await ref.read(storiesServiceProvider).getById(id);
        _stories.add(story);
      } catch (_) {}
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      body: _loading
          ? const LoadingView()
          : PageView.builder(
              controller: _pageCtrl,
              itemCount: _stories.length,
              itemBuilder: (_, i) {
                final story = _stories[i];
                return Stack(
                  fit: StackFit.expand,
                  children: [
                    if (story.mediaUrl != null)
                      CachedNetworkImage(
                        imageUrl: Formatters.resolveMediaUrl(story.mediaUrl),
                        fit: BoxFit.cover,
                      ),
                    if (story.caption != null)
                      Positioned(
                        bottom: 48,
                        left: 16,
                        right: 16,
                        child: Text(story.caption!, style: const TextStyle(color: Colors.white, fontSize: 16)),
                      ),
                  ],
                );
              },
            ),
    );
  }
}
