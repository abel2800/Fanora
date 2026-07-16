import '../core/network/api_client.dart';
import '../models/subscription_plan.dart';

class SubscriptionsService {
  SubscriptionsService(this._client);

  final ApiClient _client;

  Future<SubscriptionPlanModel> createPlan(Map<String, dynamic> body) async {
    final res = await _client.post('/subscriptions/plans', data: body);
    final data = res.data as Map<String, dynamic>;
    return SubscriptionPlanModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<List<SubscriptionPlanModel>> getCreatorPlans(String creatorId) async {
    final res = await _client.get('/subscriptions/plans/creator/$creatorId');
    return _parsePlans(res.data);
  }

  Future<List<SubscriptionPlanModel>> getMyPlans() async {
    final res = await _client.get('/subscriptions/plans/my');
    return _parsePlans(res.data);
  }

  Future<SubscriptionPlanModel> updatePlan(String planId, Map<String, dynamic> body) async {
    final res = await _client.put('/subscriptions/plans/$planId', data: body);
    final data = res.data as Map<String, dynamic>;
    return SubscriptionPlanModel.fromJson(Map<String, dynamic>.from((data['data'] ?? data) as Map));
  }

  Future<void> deletePlan(String planId) async {
    await _client.delete('/subscriptions/plans/$planId');
  }

  Future<Map<String, dynamic>> subscribe(String planId, {String? pin}) async {
    final res = await _client.post('/subscriptions/subscribe/$planId', data: {
      if (pin != null) 'pin': pin,
    });
    return Map<String, dynamic>.from(res.data as Map);
  }

  Future<void> cancel(String subscriptionId) async {
    await _client.post('/subscriptions/cancel/$subscriptionId');
  }

  Future<void> pause(String subscriptionId) async {
    await _client.post('/subscriptions/pause/$subscriptionId');
  }

  Future<List<UserSubscriptionModel>> getMySubscriptions() async {
    final res = await _client.get('/subscriptions/my');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list
        .map((e) => UserSubscriptionModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<List<Map<String, dynamic>>> getSubscribers(String planId) async {
    final res = await _client.get('/subscriptions/subscribers/$planId');
    final data = res.data as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? [];
    return list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
  }

  Future<Map<String, dynamic>> getEarnings() async {
    final res = await _client.get('/subscriptions/earnings');
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data) as Map);
  }

  Future<List<SubscriptionPlanModel>> getPopular() async {
    final res = await _client.get('/subscriptions/popular');
    return _parsePlans(res.data);
  }

  List<SubscriptionPlanModel> _parsePlans(dynamic raw) {
    final data = raw as Map<String, dynamic>;
    final list = (data['data'] as List?) ?? (data['plans'] as List?) ?? [];
    return list
        .map((e) => SubscriptionPlanModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }
}
