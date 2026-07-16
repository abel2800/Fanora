import 'transaction.dart';

class WalletModel {
  WalletModel({
    required this.id,
    required this.balance,
    this.currency = 'ETB',
    this.isActive = true,
    this.hasPinCode = false,
    this.telebirrAccount,
    this.cbeAccount,
    this.limits,
    this.recentTransactions = const [],
  });

  final String id;
  final double balance;
  final String currency;
  final bool isActive;
  final bool hasPinCode;
  final LinkedAccount? telebirrAccount;
  final LinkedAccount? cbeAccount;
  final WalletLimits? limits;
  final List<TransactionModel> recentTransactions;

  factory WalletModel.fromJson(Map<String, dynamic> json) {
    return WalletModel(
      id: json['id']?.toString() ?? '',
      balance: _toDouble(json['balance']) ?? 0,
      currency: json['currency']?.toString() ?? 'ETB',
      isActive: json['isActive'] != false,
      hasPinCode: json['hasPinCode'] == true,
      telebirrAccount: json['telebirrAccount'] != null
          ? LinkedAccount.fromJson(Map<String, dynamic>.from(json['telebirrAccount'] as Map))
          : null,
      cbeAccount: json['cbeAccount'] != null
          ? LinkedAccount.fromJson(Map<String, dynamic>.from(json['cbeAccount'] as Map))
          : null,
      limits: json['limits'] != null
          ? WalletLimits.fromJson(Map<String, dynamic>.from(json['limits'] as Map))
          : null,
      recentTransactions: (json['recentTransactions'] as List?)
              ?.map((e) => TransactionModel.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList() ??
          [],
    );
  }

  static double? _toDouble(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString());
  }
}

class LinkedAccount {
  LinkedAccount({this.isVerified = false, this.phoneNumber, this.accountNumber});

  final bool isVerified;
  final String? phoneNumber;
  final String? accountNumber;

  factory LinkedAccount.fromJson(Map<String, dynamic> json) {
    return LinkedAccount(
      isVerified: json['isVerified'] == true,
      phoneNumber: json['phoneNumber']?.toString(),
      accountNumber: json['accountNumber']?.toString(),
    );
  }
}

class WalletLimits {
  WalletLimits({
    this.dailyLimit,
    this.monthlyLimit,
    this.minTopup,
    this.maxTopup,
  });

  final double? dailyLimit;
  final double? monthlyLimit;
  final double? minTopup;
  final double? maxTopup;

  factory WalletLimits.fromJson(Map<String, dynamic> json) {
    return WalletLimits(
      dailyLimit: _d(json['dailyLimit']),
      monthlyLimit: _d(json['monthlyLimit']),
      minTopup: _d(json['minTopup']),
      maxTopup: _d(json['maxTopup']),
    );
  }

  static double? _d(dynamic v) {
    if (v == null) return null;
    if (v is num) return v.toDouble();
    return double.tryParse(v.toString());
  }
}
