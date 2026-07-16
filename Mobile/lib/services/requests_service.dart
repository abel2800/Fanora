import '../core/network/api_client.dart';
import '../models/custom_request.dart';

class RequestsService {
  RequestsService(this._client);

  final ApiClient _client;

  Future<List<CustomRequestModel>> mine() async {
    final res = await _client.get('/requests/mine');
    return _parse(res.data);
  }

  Future<List<CustomRequestModel>> inbox() async {
    final res = await _client.get('/requests/inbox');
    return _parse(res.data);
  }

  Future<CustomRequestModel> create({
    required String creatorId,
    required String description,
    required double offeredPrice,
    DateTime? dueAt,
  }) async {
    final res = await _client.post('/requests', data: {
      'creatorId': creatorId,
      'description': description,
      'offeredPrice': offeredPrice,
      if (dueAt != null) 'dueAt': dueAt.toIso8601String(),
    });
    final data = res.data as Map<String, dynamic>;
    return CustomRequestModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<CustomRequestModel> respond(
    String id, {
    required String action,
    double? counterPrice,
  }) async {
    final res = await _client.patch('/requests/$id/respond', data: {
      'action': action,
      if (counterPrice != null) 'counterPrice': counterPrice,
    });
    final data = res.data as Map<String, dynamic>;
    return CustomRequestModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<CustomRequestModel> deliver(String id, {String? contentId}) async {
    final res = await _client.patch('/requests/$id/deliver', data: {
      if (contentId != null) 'contentId': contentId,
    });
    final data = res.data as Map<String, dynamic>;
    return CustomRequestModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<CustomRequestModel> pay(String id, {String? pin}) async {
    final res = await _client.post('/requests/$id/pay', data: {
      if (pin != null) 'pin': pin,
    });
    final data = res.data as Map<String, dynamic>;
    return CustomRequestModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  List<CustomRequestModel> _parse(dynamic raw) {
    final data = raw as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list
        .map((e) => CustomRequestModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}
