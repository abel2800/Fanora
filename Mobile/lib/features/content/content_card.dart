import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_avatar.dart';
import '../../models/content.dart';
import '../../l10n/app_localizations.dart';

class ContentCard extends StatelessWidget {
  const ContentCard({
    super.key,
    required this.content,
    this.onLike,
    this.onUnlike,
  });

  final ContentModel content;
  final VoidCallback? onLike;
  final VoidCallback? onUnlike;

  @override
  Widget build(BuildContext context) {
    final mediaUrl = Formatters.resolveMediaUrl(content.thumbnailUrl ?? content.mediaUrl);
    final isLocked = content.isLocked && !content.isPurchased;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: () => context.push('/content/${content.id}'),
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (content.creator != null)
              ListTile(
                leading: AppAvatar(
                  imageUrl: content.creator!.profileImage,
                  name: content.creator!.username,
                  onTap: () => context.push('/creator/${content.creator!.username}'),
                ),
                title: Text(content.creator!.username),
                subtitle: content.publishedAt != null
                    ? Text(Formatters.timeAgo(content.publishedAt!))
                    : null,
                dense: true,
              ),
            if (mediaUrl.isNotEmpty)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    ClipRRect(
                      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(0)),
                      child: CachedNetworkImage(
                        imageUrl: mediaUrl,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => const ColoredBox(
                          color: AppColors.surfaceLight,
                          child: Icon(Icons.broken_image, color: AppColors.textSecondary),
                        ),
                      ),
                    ),
                    if (isLocked)
                      Container(
                        color: Colors.black54,
                        child: Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.lock, color: Colors.white, size: 32),
                              if (content.price != null)
                                Text(
                                  Formatters.currency(content.price!),
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(content.title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                  if (content.description != null && content.description!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        content.description!,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                    ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      IconButton(
                        icon: Icon(
                          content.isLiked ? Icons.favorite : Icons.favorite_border,
                          color: content.isLiked ? AppColors.primary : null,
                        ),
                        onPressed: content.isLiked ? onUnlike : onLike,
                      ),
                      Text(Formatters.compact(content.likesCount)),
                      const SizedBox(width: 16),
                      const Icon(Icons.chat_bubble_outline, size: 20, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(Formatters.compact(content.commentsCount)),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.share_outlined),
                        onPressed: () => Share.share(AppLocalizations.of(context).shareContent(content.title)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
