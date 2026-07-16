class TransactionModel {
  TransactionModel({
    required this.id,
    required this.type,
    required this.amount,
    this.currency = 'ETB',
    this.status,
    this.description,
    this.reference,
    this.paymentMethod,
    this.createdAt,
    this.metadata,
  });

  final String id;
  final String type;
  final double amount;
  final String currency;
  final String? status;
  final String? description;
  final String? reference;
  final String? paymentMethod;
  final DateTime? createdAt;
  final Map<String, dynamic>? metadata;

  factory TransactionModel.fromJson(Map<String, dynamic> json) {
    return TransactionModel(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      amount: _toDouble(json['amount']) ?? 0,
      currency: json['currency']?.toString() ?? 'ETB',
      status: json['status']?.toString(),
      description: json['description']?.toString(),
      reference: json['reference']?.toString(),
      paymentMethod: json['paymentMethod']?.toString(),
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? ''),
      metadata: json['metadata'] != null
          ? Map<String, dynamic>.from(json['metadata'] as Map)
          : null,
    );
  }

  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString());
  }
}
