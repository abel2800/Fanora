class SubscriptionPlanModel {
  SubscriptionPlanModel({
    required this.id,
    required this.name,
    this.description,
    this.price,
    this.currency = 'ETB',
    this.billingPeriod,
    this.benefits,
    this.isActive = true,
    this.subscriberCount,
    this.creatorId,
  });

  final String id;
  final String name;
  final String? description;
  final double? price;
  final String currency;
  final String? billingPeriod;
  final List<String>? benefits;
  final bool isActive;
  final int? subscriberCount;
  final String? creatorId;

  factory SubscriptionPlanModel.fromJson(Map<String, dynamic> json) {
    return SubscriptionPlanModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      price: _toDouble(json['price']),
      currency: json['currency']?.toString() ?? 'ETB',
      billingPeriod: json['billingPeriod']?.toString(),
      benefits: (json['benefits'] as List?)?.map((e) => e.toString()).toList(),
      isActive: json['isActive'] != false,
      subscriberCount: json['subscriberCount'] is int
          ? json['subscriberCount'] as int
          : int.tryParse(json['subscriberCount']?.toString() ?? ''),
      creatorId: json['creatorId']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
        'name': name,
        'description': description,
        'price': price,
        'billingPeriod': billingPeriod,
        'benefits': benefits,
      };

  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString());
  }
}

class UserSubscriptionModel {
  UserSubscriptionModel({
    required this.id,
    required this.status,
    this.plan,
    this.startDate,
    this.endDate,
    this.creator,
  });

  final String id;
  final String status;
  final SubscriptionPlanModel? plan;
  final DateTime? startDate;
  final DateTime? endDate;
  final dynamic creator;

  factory UserSubscriptionModel.fromJson(Map<String, dynamic> json) {
    return UserSubscriptionModel(
      id: json['id']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      plan: json['plan'] != null || json['SubscriptionPlan'] != null
          ? SubscriptionPlanModel.fromJson(
              Map<String, dynamic>.from(
                (json['plan'] ?? json['SubscriptionPlan']) as Map,
              ),
            )
          : null,
      startDate: DateTime.tryParse(json['startDate']?.toString() ?? ''),
      endDate: DateTime.tryParse(json['endDate']?.toString() ?? ''),
      creator: json['creator'],
    );
  }
}
