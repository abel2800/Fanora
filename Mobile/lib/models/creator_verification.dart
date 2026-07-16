class CreatorVerificationModel {
  CreatorVerificationModel({
    this.id,
    this.status = 'draft',
    this.currentStep = 1,
    this.idType,
    this.idFrontUrl,
    this.idBackUrl,
    this.selfieUrl,
    this.payoutMethod,
    this.payoutDetails,
    this.livenessChallenge,
    this.analysisStatus,
    this.faceSimilarity,
    this.livenessScore,
    this.automatedChecks,
    this.ocrFields,
    this.manualFallbackAllowed = false,
    this.steps = const ['identity', 'payout', 'profile', 'guidelines'],
    this.submittedAt,
  });

  final String? id;
  final String status;
  final int currentStep;
  final String? idType;
  final String? idFrontUrl;
  final String? idBackUrl;
  final String? selfieUrl;
  final String? payoutMethod;
  final Map<String, dynamic>? payoutDetails;
  final LivenessChallengeModel? livenessChallenge;
  final String? analysisStatus;
  final double? faceSimilarity;
  final double? livenessScore;
  final Map<String, dynamic>? automatedChecks;
  final Map<String, dynamic>? ocrFields;
  final bool manualFallbackAllowed;
  final List<String> steps;
  final DateTime? submittedAt;

  bool get analysisCompleted => analysisStatus?.toLowerCase() == 'completed';
  bool get canSubmit => analysisCompleted || manualFallbackAllowed;

  factory CreatorVerificationModel.fromJson(Map<String, dynamic> json) {
    return CreatorVerificationModel(
      id: json['id']?.toString(),
      status: json['status']?.toString() ?? 'draft',
      currentStep: json['currentStep'] is int
          ? json['currentStep'] as int
          : int.tryParse(json['currentStep']?.toString() ?? '') ?? 1,
      idType: json['idType']?.toString(),
      idFrontUrl: json['idFrontUrl']?.toString(),
      idBackUrl: json['idBackUrl']?.toString(),
      selfieUrl: json['selfieUrl']?.toString(),
      payoutMethod: json['payoutMethod']?.toString(),
      payoutDetails: json['payoutDetails'] != null
          ? Map<String, dynamic>.from(json['payoutDetails'] as Map)
          : null,
      livenessChallenge: json['livenessChallenge'] is Map
          ? LivenessChallengeModel.fromJson(
              Map<String, dynamic>.from(json['livenessChallenge'] as Map),
            )
          : null,
      analysisStatus: json['analysisStatus']?.toString(),
      faceSimilarity: _asDouble(json['faceSimilarity']),
      livenessScore: _asDouble(json['livenessScore']),
      automatedChecks: _asMap(json['automatedChecks']),
      ocrFields: _asMap(
        json['ocrFields'] ??
            (json['automatedChecks'] is Map
                ? (json['automatedChecks'] as Map)['ocrFields']
                : null),
      ),
      manualFallbackAllowed:
          json['manualFallbackAllowed'] == true ||
          json['allowManualFallback'] == true,
      steps:
          (json['steps'] as List?)?.map((e) => e.toString()).toList() ??
          const ['identity', 'payout', 'profile', 'guidelines'],
      submittedAt: DateTime.tryParse(json['submittedAt']?.toString() ?? ''),
    );
  }

  static double? _asDouble(Object? value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '');
  }

  static Map<String, dynamic>? _asMap(Object? value) {
    return value is Map ? Map<String, dynamic>.from(value) : null;
  }
}

class LivenessChallengeModel {
  const LivenessChallengeModel({
    this.type = 'blink_turn',
    this.frameUrls = const [],
  });

  final String type;
  final List<String> frameUrls;

  factory LivenessChallengeModel.fromJson(Map<String, dynamic> json) {
    return LivenessChallengeModel(
      type: json['type']?.toString() ?? 'blink_turn',
      frameUrls:
          (json['frameUrls'] as List?)
              ?.map((value) => value.toString())
              .toList() ??
          const [],
    );
  }
}
