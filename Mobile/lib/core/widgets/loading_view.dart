import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'skeleton.dart';

class LoadingView extends StatelessWidget {
  const LoadingView({super.key, this.message, this.variant = LoadingVariant.list});

  final String? message;
  final LoadingVariant variant;

  @override
  Widget build(BuildContext context) {
    switch (variant) {
      case LoadingVariant.feed:
        return const FeedSkeleton();
      case LoadingVariant.explore:
        return const ExploreSkeleton();
      case LoadingVariant.list:
        return const SkeletonList();
      case LoadingVariant.detail:
        return ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            SkeletonBox(height: 220, borderRadius: 16),
            SizedBox(height: 16),
            SkeletonBox(height: 18, width: 200),
            SizedBox(height: 10),
            SkeletonBox(height: 14, width: 140),
            SizedBox(height: 24),
            SkeletonBox(height: 80, borderRadius: 16),
          ],
        );
    }
  }
}

enum LoadingVariant { list, feed, explore, detail }

/// Small inline indicator for button/submit states only.
class InlineSpinner extends StatelessWidget {
  const InlineSpinner({super.key, this.size = 20});

  final double size;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: const CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
    );
  }
}
