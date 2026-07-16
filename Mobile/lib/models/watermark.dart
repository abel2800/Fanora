class WatermarkModel {
  WatermarkModel({
    required this.label,
    this.opacity = 0.14,
    this.rotation = -24,
    this.tile = true,
  });

  final String label;
  final double opacity;
  final double rotation;
  final bool tile;

  factory WatermarkModel.fromJson(Map<String, dynamic> json) {
    return WatermarkModel(
      label: json['label']?.toString() ?? '',
      opacity: double.tryParse(json['opacity']?.toString() ?? '') ?? 0.14,
      rotation: double.tryParse(json['rotation']?.toString() ?? '') ?? -24,
      tile: json['tile'] != false,
    );
  }
}
