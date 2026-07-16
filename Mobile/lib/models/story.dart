import 'user.dart';

class StoryModel {
  StoryModel({
    required this.id,
    this.mediaUrl,
    this.mediaType,
    this.caption,
    this.creator,
    this.expiresAt,
    this.createdAt,
    this.viewCount = 0,
    this.hasViewed = false,
  });

  final String id;
  final String? mediaUrl;
  final String? mediaType;
  final String? caption;
  final UserModel? creator;
  final DateTime? expiresAt;
  final DateTime? createdAt;
  final int viewCount;
  final bool hasViewed;

  factory StoryModel.fromJson(Map<String, dynamic> json) {
    return StoryModel(
      id: json['id']?.toString() ?? '',
      mediaUrl: json['mediaUrl']?.toString(),
      mediaType: json['mediaType']?.toString(),
      caption: json['caption']?.toString(),
      creator: json['creator'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['creator'] as Map))
          : null,
      expiresAt: DateTime.tryParse(json['expiresAt']?.toString() ?? ''),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      viewCount: json['viewCount'] is int
          ? json['viewCount'] as int
          : int.tryParse(json['viewCount']?.toString() ?? '') ?? 0,
      hasViewed: json['hasViewed'] == true,
    );
  }
}

class StoryGroup {
  StoryGroup({required this.creator, required this.stories});

  final UserModel creator;
  final List<StoryModel> stories;
}
