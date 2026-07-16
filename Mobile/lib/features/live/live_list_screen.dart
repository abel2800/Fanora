import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_avatar.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/live_stream.dart';
import '../../providers/services_provider.dart';

class LiveListScreen extends ConsumerStatefulWidget {
  const LiveListScreen({super.key});

  @override
  ConsumerState<LiveListScreen> createState() => _LiveListScreenState();
}

class _LiveListScreenState extends ConsumerState<LiveListScreen> {
  List<LiveStreamModel> _streams = [];
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
      final streams = await ref.read(liveServiceProvider).listLive();
      setState(() => _streams = streams);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.live),
        actions: [
          IconButton(icon: const Icon(Icons.videocam), onPressed: () => context.push('/live/start')),
        ],
      ),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _streams.isEmpty
                  ? EmptyView(message: l10n.noLiveStreams)
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        itemCount: _streams.length,
                        itemBuilder: (_, i) {
                          final s = _streams[i];
                          return ListTile(
                            leading: AppAvatar(imageUrl: s.creator?.profileImage, name: s.creator?.username),
                            title: Text(s.title ?? l10n.liveStream),
                            subtitle: Text(s.creator?.username ?? ''),
                            trailing: s.isLive
                                ? Chip(label: Text(l10n.liveBadge), backgroundColor: AppColors.error)
                                : null,
                            onTap: () => context.push('/live/${s.id}'),
                          );
                        },
                      ),
                    ),
    );
  }
}
