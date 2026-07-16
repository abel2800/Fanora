import '../core/network/api_client.dart';
import '../models/transaction.dart';
import '../models/wallet.dart';

class WalletService {
  WalletService(this._client);

  final ApiClient _client;

  Future<WalletModel> getWallet() async {
    final res = await _client.get('/wallet');
    final data = res.data as Map<String, dynamic>;
    return WalletModel.fromJson(Map<String, dynamic>.from(data['data'] as Map));
  }

  Future<void> setPin(String pin, String confirmPin) async {
    await _client.post('/wallet/set-pin', data: {'pin': pin, 'confirmPin': confirmPin});
  }

  Future<bool> verifyPin(String pin) async {
    final res = await _client.post('/wallet/verify-pin', data: {'pin': pin});
    final data = res.data as Map<String, dynamic>;
    return data['success'] == true || data['valid'] == true;
  }

  Future<void> linkTelebirr(String phoneNumber) async {
    await _client.post('/wallet/link-telebirr', data: {'phoneNumber': phoneNumber});
  }

  Future<void> linkCbe({required String phoneNumber, required String accountNumber}) async {
    await _client.post('/wallet/link-cbe', data: {
      'phoneNumber': phoneNumber,
      'accountNumber': accountNumber,
    });
  }

  Future<Map<String, dynamic>> topupTelebirr(double amount, {required String pin}) async {
    final res = await _client.post('/wallet/topup/telebirr', data: {'amount': amount, 'pin': pin});
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> topupCbe(double amount, {required String pin}) async {
    final res = await _client.post('/wallet/topup/cbe', data: {'amount': amount, 'pin': pin});
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<Map<String, dynamic>> confirmTopup(String transactionId, {String? pin}) async {
    final res = await _client.post('/wallet/topup/confirm/$transactionId', data: {
      if (pin != null) 'pin': pin,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<List<TransactionModel>> getTransactions({int page = 1, int limit = 20}) async {
    final res = await _client.get('/wallet/transactions', queryParameters: {
      'page': page,
      'limit': limit,
    });
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? (data['transactions'] as List?) ?? [];
    return list
        .map((e) => TransactionModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<Map<String, dynamic>> withdraw(double amount, {String? pin}) async {
    final res = await _client.post('/wallet/withdraw', data: {
      'amount': amount,
      if (pin != null) 'pin': pin,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<List<Map<String, dynamic>>> getPaymentMethods() async {
    final res = await _client.get('/wallet/payment-methods');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }
}
