import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../models/watermark.dart';

class TiledWatermarkOverlay extends StatelessWidget {
  const TiledWatermarkOverlay({super.key, required this.watermark});

  final WatermarkModel watermark;

  @override
  Widget build(BuildContext context) {
    if (watermark.label.isEmpty) return const SizedBox.shrink();

    return IgnorePointer(
      child: LayoutBuilder(
        builder: (context, constraints) {
          final w = constraints.maxWidth;
          final h = constraints.maxHeight;
          if (w <= 0 || h <= 0) return const SizedBox.shrink();

          final radians = watermark.rotation * math.pi / 180;
          final tiles = <Widget>[];
          const stepX = 160.0;
          const stepY = 90.0;

          for (var y = -h; y < h * 2; y += stepY) {
            for (var x = -w; x < w * 2; x += stepX) {
              tiles.add(
                Positioned(
                  left: x,
                  top: y,
                  child: Transform.rotate(
                    angle: radians,
                    child: Text(
                      watermark.label,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: watermark.opacity),
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.4,
                      ),
                    ),
                  ),
                ),
              );
            }
          }

          return ClipRect(
            child: Stack(children: tiles),
          );
        },
      ),
    );
  }
}
