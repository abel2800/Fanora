class ContentBundleModel {
  ContentBundleModel({
    required this.id,
    required this.title,
    this.description,
    required this.price,
    this.currency = 'ETB',
    this.contentIds = const [],
    this.isActive = true,
    this.purchaseCount = 0,
    this.creatorId,
  });

  final String id;
  final String title;
  final String? description;
  final double price;
  final String currency;
  final List<String> contentIds;
  final bool isActive;
  final int purchaseCount;
  final String? creatorId;

  factory ContentBundleModel.fromJson(Map<String, dynamic> json) {
    return ContentBundleModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      price: _toDouble(json['price']) ?? 0,
      currency: json['currency']?.toString() ?? 'ETB',
      contentIds: (json['contentIds'] as List?)?.map((e) => e.toString()).toList() ?? [],
      isActive: json['isActive'] != false,
      purchaseCount: _toInt(json['purchaseCount']) ?? 0,
      creatorId: json['creatorId']?.toString(),
    );
  }

  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString());
  }

  static int? _toInt(dynamic v) {
    if (v == null) return null;
    if (v is int) return v;
    return int.tryParse(v.toString());
  }
}
