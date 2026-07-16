import 'subscription_plan.dart';

class GiftVoucherModel {
  GiftVoucherModel({
    required this.id,
    required this.code,
    required this.amount,
    this.status = 'active',
    this.planId,
    this.recipientPhone,
    this.expiresAt,
    this.redeemedAt,
    this.plan,
  });

  final String id;
  final String code;
  final double amount;
  final String status;
  final String? planId;
  final String? recipientPhone;
  final DateTime? expiresAt;
  final DateTime? redeemedAt;
  final SubscriptionPlanModel? plan;

  factory GiftVoucherModel.fromJson(Map<String, dynamic> json) {
    return GiftVoucherModel(
      id: json['id']?.toString() ?? '',
      code: json['code']?.toString() ?? '',
      amount: double.tryParse(json['amount']?.toString() ?? '') ?? 0,
      status: json['status']?.toString() ?? 'active',
      planId: json['planId']?.toString(),
      recipientPhone: json['recipientPhone']?.toString(),
      expiresAt: DateTime.tryParse(json['expiresAt']?.toString() ?? ''),
      redeemedAt: DateTime.tryParse(json['redeemedAt']?.toString() ?? ''),
      plan: json['plan'] != null
          ? SubscriptionPlanModel.fromJson(Map<String, dynamic>.from(json['plan'] as Map))
          : null,
    );
  }
}
