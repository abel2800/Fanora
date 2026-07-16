import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../core/widgets/tap_to_load_video.dart';
import '../../l10n/app_localizations.dart';
import '../../models/live_stream.dart';
import '../../providers/auth_provider.dart';
import '../../providers/preferences_provider.dart';
import '../../providers/services_provider.dart';

class LiveWatchScreen extends ConsumerStatefulWidget {
  const LiveWatchScreen({super.key, required this.streamId});

  final String streamId;

  @override
  ConsumerState<LiveWatchScreen> createState() => _LiveWatchScreenState();
}

class _LiveWatchScreenState extends ConsumerState<LiveWatchScreen> {
  LiveStreamModel? _stream;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final stream = await ref.read(liveServiceProvider).getById(widget.streamId);
      setState(() => _stream = stream);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _end() async {
    try {
      await ref.read(liveServiceProvider).end(widget.streamId);
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final myId = ref.watch(authProvider).user?.id;
    final dataSaver = ref.watch(preferencesProvider).dataSaver;

    if (_loading) return const AppScaffold(body: LoadingView(variant: LoadingVariant.detail), showBack: true);
    if (_error != null) {
      return AppScaffold(body: ErrorView(message: _error!, onRetry: _load), showBack: true);
    }

    final stream = _stream!;
    final playback = Formatters.resolveMediaUrl(stream.hlsPlaybackUrl);
    final isOwner = stream.creator?.id == myId;

    return AppScaffold(
      title: stream.title ?? l10n.live,
      showBack: true,
      actions: [
        if (isOwner && stream.isLive)
          TextButton(
            onPressed: _end,
            child: Text(l10n.endStream, style: const TextStyle(color: AppColors.error)),
          ),
      ],
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (playback.isNotEmpty)
            TapToLoadVideo(
              url: playback,
              autoInitialize: !dataSaver && stream.isLive,
            )
          else
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const Icon(Icons.live_tv, size: 64, color: AppColors.primary),
                    const SizedBox(height: 12),
                    Text(stream.title ?? l10n.live),
                    const SizedBox(height: 8),
                    Text(
                      l10n.hlsUnavailable,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 16),
          if (stream.creator != null)
            Text('@${stream.creator!.username}', style: const TextStyle(fontWeight: FontWeight.w600)),
          if (stream.description != null && stream.description!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text(stream.description!, style: const TextStyle(color: AppColors.textSecondary)),
            ),
          if (playback.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(l10n.playbackUrl, style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            SelectableText(playback, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          ],
        ],
      ),
    );
  }
}
