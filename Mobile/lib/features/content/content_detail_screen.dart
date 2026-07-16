import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/platform/screen_capture_service.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_avatar.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../core/widgets/paywall_sheet.dart';
import '../../core/widgets/tap_to_load_video.dart';
import '../../core/widgets/tiled_watermark.dart';
import '../../l10n/app_localizations.dart';
import '../../models/content.dart';
import '../../models/subscription_plan.dart';
import '../../models/watermark.dart';
import '../../providers/preferences_provider.dart';
import '../../providers/services_provider.dart';

class ContentDetailScreen extends ConsumerStatefulWidget {
  const ContentDetailScreen({super.key, required this.contentId});

  final String contentId;

  @override
  ConsumerState<ContentDetailScreen> createState() => _ContentDetailScreenState();
}

class _ContentDetailScreenState extends ConsumerState<ContentDetailScreen> {
  ContentModel? _content;
  List<CommentModel> _comments = [];
  List<SubscriptionPlanModel> _plans = [];
  WatermarkModel? _watermark;
  bool _loading = true;
  bool _saved = false;
  String? _error;
  final _commentCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
    ScreenCaptureService.startListening(_onCapture);
  }

  @override
  void dispose() {
    ScreenCaptureService.stopListening();
    _commentCtrl.dispose();
    super.dispose();
  }

  void _onCapture(String eventType) {
    final content = _content;
    if (content == null || _needsPaywall) return;
    ref.read(mediaSecurityServiceProvider).reportEvent(
          contentId: content.id,
          eventType: eventType,
          platform: defaultTargetPlatform == TargetPlatform.iOS ? 'ios' : 'android',
        );
  }

  bool get _needsPaywall {
    final content = _content;
    if (content == null) return false;
    if (content.isLocked && !content.isPurchased) return true;
    if (content.isSubscriberOnly && content.isLocked) return true;
    return false;
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final content = await ref.read(contentServiceProvider).getById(widget.contentId);
      final comments = await ref.read(contentServiceProvider).getComments(widget.contentId);
      List<SubscriptionPlanModel> plans = [];
      if (content.creator != null && (content.isSubscriberOnly || content.isLocked)) {
        plans = await ref.read(subscriptionsServiceProvider).getCreatorPlans(content.creator!.id);
      }
      WatermarkModel? watermark;
      var saved = false;
      try {
        saved = await ref.read(wishlistServiceProvider).status(content.id);
      } catch (_) {}
      final lockedOrProtected = content.isPurchased || !content.isLocked;
      if (lockedOrProtected && content.mediaUrl != null) {
        try {
          watermark = await ref.read(mediaSecurityServiceProvider).getWatermark(content.id);
        } catch (_) {}
      }
      setState(() {
        _content = content;
        _comments = comments;
        _plans = plans;
        _watermark = watermark;
        _saved = saved;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _toggleWishlist() async {
    try {
      if (_saved) {
        await ref.read(wishlistServiceProvider).remove(widget.contentId);
      } else {
        await ref.read(wishlistServiceProvider).add(widget.contentId);
      }
      if (mounted) setState(() => _saved = !_saved);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    }
  }

  void _showPaywall() {
    final content = _content!;
    if (content.isSubscriberOnly && _plans.isNotEmpty) {
      PaywallSheet.show(
        context,
        mode: PaywallMode.subscribe,
        plan: _plans.first,
        creatorName: content.creator?.username,
        onSuccess: _load,
      );
    } else {
      PaywallSheet.show(
        context,
        mode: PaywallMode.purchase,
        content: content,
        onSuccess: _load,
      );
    }
  }

  Future<void> _addComment() async {
    if (_commentCtrl.text.trim().isEmpty) return;
    try {
      await ref.read(contentServiceProvider).addComment(widget.contentId, _commentCtrl.text.trim());
      _commentCtrl.clear();
      final comments = await ref.read(contentServiceProvider).getComments(widget.contentId);
      setState(() => _comments = comments);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Widget _media(ContentModel content, AppLocalizations l10n) {
    final dataSaver = ref.watch(preferencesProvider).dataSaver;
    final url = Formatters.resolveMediaUrl(content.mediaUrl);
    final overlay = _watermark != null ? TiledWatermarkOverlay(watermark: _watermark!) : null;

    if (content.type == 'video' && url.isNotEmpty) {
      return TapToLoadVideo(
        url: url,
        autoInitialize: !dataSaver,
        overlay: overlay,
      );
    }

    if (url.isNotEmpty) {
      return Stack(
        children: [
          CachedNetworkImage(
            imageUrl: url,
            width: double.infinity,
            fit: BoxFit.cover,
          ),
          if (overlay != null) Positioned.fill(child: overlay),
        ],
      );
    }
    return const SizedBox.shrink();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    if (_loading) {
      return const AppScaffold(body: LoadingView(variant: LoadingVariant.detail), showBack: true);
    }
    if (_error != null) {
      return AppScaffold(body: ErrorView(message: _error!, onRetry: _load), showBack: true);
    }
    final content = _content!;

    return AppScaffold(
      title: content.title,
      showBack: true,
      actions: [
        IconButton(
          tooltip: l10n.wishlist,
          icon: Icon(_saved ? Icons.bookmark : Icons.bookmark_border),
          onPressed: _toggleWishlist,
        ),
      ],
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_needsPaywall)
              Container(
                height: 200,
                color: AppColors.surfaceLight,
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        content.isSubscriberOnly ? Icons.card_membership : Icons.lock,
                        size: 48,
                        color: AppColors.primary,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        content.isSubscriberOnly ? l10n.subscribersOnly : l10n.lockedContent,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      if (content.price != null && !content.isSubscriberOnly)
                        Text(Formatters.currency(content.price!)),
                      if (content.isSubscriberOnly && _plans.isNotEmpty)
                        Text(l10n.fromPerMonth(Formatters.currency(_plans.first.price ?? 0))),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _showPaywall,
                        child: Text(content.isSubscriberOnly ? l10n.subscribe : l10n.unlock),
                      ),
                    ],
                  ),
                ),
              )
            else
              _media(content, l10n),
            if (content.creator != null)
              ListTile(
                leading: AppAvatar(imageUrl: content.creator!.profileImage, name: content.creator!.username),
                title: Text(content.creator!.username),
                onTap: () => context.push('/creator/${content.creator!.username}'),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(content.description ?? '', style: const TextStyle(color: AppColors.textSecondary)),
            ),
            const Divider(),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(l10n.comments, style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
            ..._comments.map((c) => ListTile(
                  leading: AppAvatar(imageUrl: c.user?.profileImage, name: c.user?.username),
                  title: Text(c.user?.username ?? ''),
                  subtitle: Text(c.content),
                )),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentCtrl,
                      decoration: InputDecoration(hintText: l10n.addComment),
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.send), onPressed: _addComment),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
