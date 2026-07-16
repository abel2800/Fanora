import 'user.dart';

class ConversationModel {
  ConversationModel({
    required this.id,
    this.otherUser,
    this.lastMessage,
    this.unreadCount = 0,
    this.updatedAt,
  });

  final String id;
  final UserModel? otherUser;
  final MessagePreview? lastMessage;
  final int unreadCount;
  final DateTime? updatedAt;

  factory ConversationModel.fromJson(Map<String, dynamic> json) {
    return ConversationModel(
      id: json['id']?.toString() ?? '',
      otherUser: json['otherUser'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['otherUser'] as Map))
          : null,
      lastMessage: json['lastMessage'] != null
          ? MessagePreview.fromJson(Map<String, dynamic>.from(json['lastMessage'] as Map))
          : null,
      unreadCount: json['unreadCount'] is int
          ? json['unreadCount'] as int
          : int.tryParse(json['unreadCount']?.toString() ?? '') ?? 0,
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? ''),
    );
  }
}

class MessagePreview {
  MessagePreview({
    required this.id,
    required this.content,
    this.senderId,
    this.createdAt,
  });

  final String id;
  final String content;
  final String? senderId;
  final DateTime? createdAt;

  factory MessagePreview.fromJson(Map<String, dynamic> json) {
    return MessagePreview(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      senderId: json['senderId']?.toString(),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
    );
  }
}

class MessageModel {
  MessageModel({
    required this.id,
    required this.content,
    this.senderId,
    this.recipientId,
    this.conversationId,
    this.isRead = false,
    this.isPaid = false,
    this.isUnlocked = true,
    this.price,
    this.mediaUrl,
    this.createdAt,
    this.sender,
  });

  final String id;
  final String content;
  final String? senderId;
  final String? recipientId;
  final String? conversationId;
  final bool isRead;
  final bool isPaid;
  final bool isUnlocked;
  final double? price;
  final String? mediaUrl;
  final DateTime? createdAt;
  final UserModel? sender;

  bool get isLockedPaid => isPaid && !isUnlocked;

  MessageModel copyWith({
    String? content,
    bool? isUnlocked,
    bool? isPaid,
    double? price,
  }) {
    return MessageModel(
      id: id,
      content: content ?? this.content,
      senderId: senderId,
      recipientId: recipientId,
      conversationId: conversationId,
      isRead: isRead,
      isPaid: isPaid ?? this.isPaid,
      isUnlocked: isUnlocked ?? this.isUnlocked,
      price: price ?? this.price,
      mediaUrl: mediaUrl,
      createdAt: createdAt,
      sender: sender,
    );
  }

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    final price = json['price'] != null ? double.tryParse(json['price'].toString()) : null;
    final isPaid = json['isPaid'] == true || (price != null && price > 0);
    return MessageModel(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      senderId: json['senderId']?.toString(),
      recipientId: json['recipientId']?.toString(),
      conversationId: json['conversationId']?.toString(),
      isRead: json['isRead'] == true,
      isPaid: isPaid,
      isUnlocked: json['isUnlocked'] == true || !isPaid,
      price: price,
      mediaUrl: json['mediaUrl']?.toString(),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      sender: json['sender'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['sender'] as Map))
          : null,
    );
  }
}
