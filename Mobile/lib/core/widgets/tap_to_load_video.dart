import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../../l10n/app_localizations.dart';
import '../theme/app_theme.dart';

class TapToLoadVideo extends StatefulWidget {
  const TapToLoadVideo({
    super.key,
    required this.url,
    this.autoInitialize = true,
    this.aspectRatio,
    this.overlay,
  });

  final String url;
  final bool autoInitialize;
  final double? aspectRatio;
  final Widget? overlay;

  @override
  State<TapToLoadVideo> createState() => _TapToLoadVideoState();
}

class _TapToLoadVideoState extends State<TapToLoadVideo> {
  VideoPlayerController? _controller;
  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.autoInitialize && widget.url.isNotEmpty) {
      _load();
    }
  }

  @override
  void didUpdateWidget(covariant TapToLoadVideo oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.url != widget.url) {
      _controller?.dispose();
      _controller = null;
      if (widget.autoInitialize && widget.url.isNotEmpty) {
        _load();
      } else {
        setState(() {});
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (widget.url.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final controller = VideoPlayerController.networkUrl(Uri.parse(widget.url));
      await controller.initialize();
      await controller.play();
      if (!mounted) {
        controller.dispose();
        return;
      }
      setState(() {
        _controller = controller;
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final controller = _controller;

    if (controller != null && controller.value.isInitialized) {
      return AspectRatio(
        aspectRatio: widget.aspectRatio ?? controller.value.aspectRatio,
        child: Stack(
          fit: StackFit.expand,
          children: [
            VideoPlayer(controller),
            if (widget.overlay != null) widget.overlay!,
            Align(
              alignment: Alignment.bottomCenter,
              child: VideoProgressIndicator(controller, allowScrubbing: true),
            ),
          ],
        ),
      );
    }

    return AspectRatio(
      aspectRatio: widget.aspectRatio ?? 16 / 9,
      child: Material(
        color: AppColors.surfaceLight,
        child: InkWell(
          onTap: _loading ? null : _load,
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (widget.overlay != null) widget.overlay!,
              Center(
                child: _loading
                    ? const SizedBox(
                        width: 28,
                        height: 28,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                      )
                    : Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.play_circle_outline, size: 48, color: AppColors.primary),
                          const SizedBox(height: 8),
                          Text(
                            _error ?? l10n.tapToLoadVideo,
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: AppColors.textSecondary),
                          ),
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
