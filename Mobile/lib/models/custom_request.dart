import 'user.dart';

class CustomRequestModel {
  CustomRequestModel({
    required this.id,
    required this.description,
    required this.offeredPrice,
    this.counterPrice,
    this.status = 'requested',
    this.paymentStatus = 'unpaid',
    this.fanId,
    this.creatorId,
    this.deliveryContentId,
    this.dueAt,
    this.createdAt,
    this.fan,
    this.creator,
  });

  final String id;
  final String description;
  final double offeredPrice;
  final double? counterPrice;
  final String status;
  final String paymentStatus;
  final String? fanId;
  final String? creatorId;
  final String? deliveryContentId;
  final DateTime? dueAt;
  final DateTime? createdAt;
  final UserModel? fan;
  final UserModel? creator;

  factory CustomRequestModel.fromJson(Map<String, dynamic> json) {
    return CustomRequestModel(
      id: json['id']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      offeredPrice: double.tryParse(json['offeredPrice']?.toString() ?? '') ?? 0,
      counterPrice: json['counterPrice'] != null
          ? double.tryParse(json['counterPrice'].toString())
          : null,
      status: json['status']?.toString() ?? 'requested',
      paymentStatus: json['paymentStatus']?.toString() ?? 'unpaid',
      fanId: json['fanId']?.toString(),
      creatorId: json['creatorId']?.toString(),
      deliveryContentId: json['deliveryContentId']?.toString(),
      dueAt: DateTime.tryParse(json['dueAt']?.toString() ?? ''),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      fan: json['fan'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['fan'] as Map))
          : null,
      creator: json['creator'] != null
          ? UserModel.fromJson(Map<String, dynamic>.from(json['creator'] as Map))
          : null,
    );
  }
}
