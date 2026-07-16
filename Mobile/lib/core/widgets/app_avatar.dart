import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../utils/formatters.dart';

class AppAvatar extends StatelessWidget {
  const AppAvatar({
    super.key,
    this.imageUrl,
    this.name,
    this.radius = 20,
    this.onTap,
  });

  final String? imageUrl;
  final String? name;
  final double radius;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final resolved = Formatters.resolveMediaUrl(imageUrl);
    final initial = (name?.isNotEmpty == true) ? name![0].toUpperCase() : '?';

    Widget avatar;
    if (resolved.isNotEmpty) {
      avatar = CircleAvatar(
        radius: radius,
        backgroundColor: AppColors.surfaceLight,
        backgroundImage: CachedNetworkImageProvider(resolved),
      );
    } else {
      avatar = CircleAvatar(
        radius: radius,
        backgroundColor: AppColors.surfaceLight,
        child: Text(initial, style: TextStyle(fontSize: radius * 0.8)),
      );
    }

    if (onTap != null) {
      return GestureDetector(onTap: onTap, child: avatar);
    }
    return avatar;
  }
}
