import 'user.dart';

class LiveStreamModel {
  LiveStreamModel({
    required this.id,
    this.title,
    this.description,
    this.status,
    this.streamUrl,
    this.playbackUrl,
    this.ingestUrl,
    this.streamKey,
    this.thumbnailUrl,
    this.viewerCount = 0,
    this.creator,
    this.startedAt,
    this.endedAt,
  });

  final String id;
  final String? title;
  final String? description;
  final String? status;
  final String? streamUrl;
  final String? playbackUrl;
  final String? ingestUrl;
  final String? streamKey;
  final String? thumbnailUrl;
  final int viewerCount;
  final UserModel? creator;
  final DateTime? startedAt;
  final DateTime? endedAt;

  bool get isLive => status == 'live';

  String? get hlsPlaybackUrl => playbackUrl ?? streamUrl;

  factory LiveStreamModel.fromJson(Map<String, dynamic> json) {
    return LiveStreamModel(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString(),
      description: json['description']?.toString(),
      status: json['status']?.toString(),
      streamUrl: json['streamUrl']?.toString(),
      playbackUrl: json['playbackUrl']?.toString() ?? json['hlsUrl']?.toString(),
      ingestUrl: json['ingestUrl']?.toString(),
      streamKey: json['streamKey']?.toString(),
      thumbnailUrl: json['thumbnailUrl']?.toString(),
      viewerCount: json['viewerCount'] is int
          ? json['viewerCount'] as int
          : int.tryParse(json['viewerCount']?.toString() ?? '') ?? 0,
      creator: json['creator'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['creator'] as Map))
          : null,
      startedAt: DateTime.tryParse(json['startedAt']?.toString() ?? ''),
      endedAt: DateTime.tryParse(json['endedAt']?.toString() ?? ''),
    );
  }
}
