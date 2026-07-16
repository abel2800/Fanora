import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class SkeletonBox extends StatefulWidget {
  const SkeletonBox({
    super.key,
    this.height = 16,
    this.width,
    this.borderRadius = 12,
  });

  final double height;
  final double? width;
  final double borderRadius;

  @override
  State<SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<SkeletonBox> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = _controller.value;
        return Container(
          height: widget.height,
          width: widget.width,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(widget.borderRadius),
            gradient: LinearGradient(
              begin: Alignment(-1.0 + 2 * t, 0),
              end: Alignment(1.0 + 2 * t, 0),
              colors: const [
                AppColors.surfaceLight,
                Color(0xFF2A2F3A),
                AppColors.surfaceLight,
              ],
            ),
          ),
        );
      },
    );
  }
}

class SkeletonList extends StatelessWidget {
  const SkeletonList({super.key, this.itemCount = 6, this.cardHeight = 120});

  final int itemCount;
  final double cardHeight;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: itemCount,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, __) => SkeletonBox(height: cardHeight, borderRadius: 16),
    );
  }
}

class FeedSkeleton extends StatelessWidget {
  const FeedSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SkeletonBox(height: 72, borderRadius: 16),
        const SizedBox(height: 16),
        for (var i = 0; i < 4; i++) ...[
          const SkeletonBox(height: 220, borderRadius: 16),
          const SizedBox(height: 12),
          const SkeletonBox(height: 16, width: 180),
          const SizedBox(height: 8),
          const SkeletonBox(height: 14, width: 120),
          const SizedBox(height: 20),
        ],
      ],
    );
  }
}

class ExploreSkeleton extends StatelessWidget {
  const ExploreSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        SizedBox(
          height: 36,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: const [
              SkeletonBox(width: 72, height: 32, borderRadius: 16),
              SizedBox(width: 8),
              SkeletonBox(width: 72, height: 32, borderRadius: 16),
              SizedBox(width: 8),
              SkeletonBox(width: 72, height: 32, borderRadius: 16),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const SkeletonBox(height: 88, borderRadius: 16),
        const SizedBox(height: 16),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.75,
          children: List.generate(6, (_) => const SkeletonBox(borderRadius: 16)),
        ),
      ],
    );
  }
}
