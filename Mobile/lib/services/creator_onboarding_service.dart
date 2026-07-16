import '../core/network/api_client.dart';
import '../models/creator_verification.dart';

class CreatorOnboardingService {
  CreatorOnboardingService(this._client);

  final ApiClient _client;

  Future<CreatorVerificationModel> getStatus() async {
    final res = await _client.get('/creator-onboarding');
    final data = res.data as Map<String, dynamic>;
    return CreatorVerificationModel.fromJson(
      Map<String, dynamic>.from((data['data'] ?? data) as Map),
    );
  }

  Future<CreatorVerificationModel> updateIdentity({
    required String idType,
    required String idFrontUrl,
    required String idBackUrl,
    required String selfieUrl,
    required List<String> livenessFrameUrls,
  }) async {
    final res = await _client.put(
      '/creator-onboarding/identity',
      data: {
        'idType': idType,
        'idFrontUrl': idFrontUrl,
        'idBackUrl': idBackUrl,
        'selfieUrl': selfieUrl,
        'livenessChallenge': {
          'type': 'blink_turn',
          'frameUrls': livenessFrameUrls,
        },
      },
    );
    final data = res.data as Map<String, dynamic>;
    return CreatorVerificationModel.fromJson(
      Map<String, dynamic>.from((data['data'] ?? data) as Map),
    );
  }

  Future<CreatorVerificationModel> analyze() async {
    final res = await _client.post('/creator-onboarding/analyze');
    final data = res.data as Map<String, dynamic>;
    return CreatorVerificationModel.fromJson(
      Map<String, dynamic>.from((data['data'] ?? data) as Map),
    );
  }

  Future<CreatorVerificationModel> updatePayout({
    required String payoutMethod,
    required Map<String, dynamic> payoutDetails,
  }) async {
    final res = await _client.put(
      '/creator-onboarding/payout',
      data: {'payoutMethod': payoutMethod, 'payoutDetails': payoutDetails},
    );
    final data = res.data as Map<String, dynamic>;
    return CreatorVerificationModel.fromJson(
      Map<String, dynamic>.from((data['data'] ?? data) as Map),
    );
  }

  Future<CreatorVerificationModel> submit({
    required bool guidelinesAccepted,
  }) async {
    final res = await _client.post(
      '/creator-onboarding/submit',
      data: {'guidelinesAccepted': guidelinesAccepted},
    );
    final data = res.data as Map<String, dynamic>;
    return CreatorVerificationModel.fromJson(
      Map<String, dynamic>.from((data['data'] ?? data) as Map),
    );
  }
}
