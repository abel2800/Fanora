import '../core/network/api_client.dart';
import '../models/gift_voucher.dart';

class GiftsService {
  GiftsService(this._client);

  final ApiClient _client;

  Future<List<GiftVoucherModel>> mine() async {
    final res = await _client.get('/gifts/mine');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list
        .map((e) => GiftVoucherModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<GiftVoucherModel> create({
    required String planId,
    String? recipientPhone,
    String? pin,
  }) async {
    final res = await _client.post('/gifts', data: {
      'planId': planId,
      if (recipientPhone != null && recipientPhone.isNotEmpty) 'recipientPhone': recipientPhone,
      if (pin != null && pin.isNotEmpty) 'pin': pin,
    });
    final data = res.data as Map<String, dynamic>;
    return GiftVoucherModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<Map<String, dynamic>> redeem(String code) async {
    final res = await _client.post('/gifts/redeem', data: {'code': code.trim().toUpperCase()});
    return Map<String, dynamic>.from(res.data as Map);
  }
}
