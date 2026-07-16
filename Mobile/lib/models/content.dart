import 'user.dart';

class ContentModel {
  ContentModel({
    required this.id,
    required this.title,
    this.description,
    this.type,
    this.mediaUrl,
    this.thumbnailUrl,
    this.accessType,
    this.price,
    this.currency,
    this.tags,
    this.category,
    this.status,
    this.likesCount = 0,
    this.commentsCount = 0,
    this.viewsCount = 0,
    this.isLiked = false,
    this.isPurchased = false,
    this.isLocked = false,
    this.creator,
    this.createdAt,
    this.publishedAt,
    this.allowComments = true,
    this.allowTips = true,
  });

  final String id;
  final String title;
  final String? description;
  final String? type;
  final String? mediaUrl;
  final String? thumbnailUrl;
  final String? accessType;
  final double? price;
  final String? currency;
  final List<String>? tags;
  final String? category;
  final String? status;
  final int likesCount;
  final int commentsCount;
  final int viewsCount;
  final bool isLiked;
  final bool isPurchased;
  final bool isLocked;
  final UserModel? creator;
  final DateTime? createdAt;
  final DateTime? publishedAt;
  final bool allowComments;
  final bool allowTips;

  bool get isPayPerView => accessType == 'pay_per_view';
  bool get isSubscriberOnly => accessType == 'subscriber_only';

  factory ContentModel.fromJson(Map<String, dynamic> json) {
    return ContentModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      type: json['type']?.toString(),
      mediaUrl: json['mediaUrl']?.toString(),
      thumbnailUrl: json['thumbnailUrl']?.toString(),
      accessType: json['accessType']?.toString(),
      price: _toDouble(json['price']),
      currency: json['currency']?.toString(),
      tags: (json['tags'] as List?)?.map((e) => e.toString()).toList(),
      category: json['category']?.toString(),
      status: json['status']?.toString(),
      likesCount: _toInt(json['likesCount']) ?? 0,
      commentsCount: _toInt(json['commentsCount']) ?? 0,
      viewsCount: _toInt(json['viewsCount']) ?? 0,
      isLiked: json['isLiked'] == true,
      isPurchased: json['isPurchased'] == true,
      isLocked: json['isLocked'] == true,
      creator: json['creator'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['creator'] as Map))
          : null,
      createdAt: _toDate(json['createdAt']),
      publishedAt: _toDate(json['publishedAt']),
      allowComments: json['allowComments'] != false,
      allowTips: json['allowTips'] != false,
    );
  }

  ContentModel copyWith({
    bool? isLiked,
    int? likesCount,
    int? commentsCount,
    bool? isPurchased,
    bool? isLocked,
  }) {
    return ContentModel(
      id: id,
      title: title,
      description: description,
      type: type,
      mediaUrl: mediaUrl,
      thumbnailUrl: thumbnailUrl,
      accessType: accessType,
      price: price,
      currency: currency,
      tags: tags,
      category: category,
      status: status,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      viewsCount: viewsCount,
      isLiked: isLiked ?? this.isLiked,
      isPurchased: isPurchased ?? this.isPurchased,
      isLocked: isLocked ?? this.isLocked,
      creator: creator,
      createdAt: createdAt,
      publishedAt: publishedAt,
      allowComments: allowComments,
      allowTips: allowTips,
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

  static DateTime? _toDate(dynamic v) {
    if (v == null) return null;
    return DateTime.tryParse(v.toString());
  }
}

class CommentModel {
  CommentModel({
    required this.id,
    required this.content,
    this.user,
    this.createdAt,
  });

  final String id;
  final String content;
  final UserModel? user;
  final DateTime? createdAt;

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      user: json['user'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['user'] as Map))
          : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}

class PaginationMeta {
  PaginationMeta({
    required this.page,
    required this.limit,
    required this.total,
    required this.pages,
  });

  final int page;
  final int limit;
  final int total;
  final int pages;

  bool get hasMore => page < pages;

  factory PaginationMeta.fromJson(Map<String, dynamic> json) {
    return PaginationMeta(
      page: _int(json['page'], 1),
      limit: _int(json['limit'], 20),
      total: _int(json['total'], 0),
      pages: _int(json['pages'], 1),
    );
  }

  static int _int(dynamic v, int fallback) {
    if (v is int) return v;
    return int.tryParse(v?.toString() ?? '') ?? fallback;
  }
}
