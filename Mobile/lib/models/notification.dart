class NotificationModel {
  NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    this.message,
    this.isRead = false,
    this.data,
    this.createdAt,
  });

  final String id;
  final String type;
  final String title;
  final String? message;
  final bool isRead;
  final Map<String, dynamic>? data;
  final DateTime? createdAt;

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? json['body']?.toString(),
      isRead: json['isRead'] == true,
      data: json['data'] != null
          ? Map<String, dynamic>.from(json['data'] as Map)
          : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}
