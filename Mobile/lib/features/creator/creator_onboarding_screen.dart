import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/skeleton.dart';
import '../../l10n/app_localizations.dart';
import '../../models/creator_verification.dart';
import '../../providers/services_provider.dart';

class CreatorOnboardingScreen extends ConsumerStatefulWidget {
  const CreatorOnboardingScreen({super.key});

  @override
  ConsumerState<CreatorOnboardingScreen> createState() =>
      _CreatorOnboardingScreenState();
}

class _CreatorOnboardingScreenState
    extends ConsumerState<CreatorOnboardingScreen> {
  CreatorVerificationModel? _status;
  bool _loading = true;
  bool _saving = false;
  String? _error;
  int? _challengeStep;
  double? _uploadProgress;

  final _idType = TextEditingController(text: 'fayda');
  final _idFront = TextEditingController();
  final _idBack = TextEditingController();
  final _selfie = TextEditingController();
  final _payoutMethod = TextEditingController(text: 'telebirr');
  final _payoutAccount = TextEditingController();
  final List<String> _challengeUrls = [];
  final _picker = ImagePicker();
  bool _guidelines = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _idType.dispose();
    _idFront.dispose();
    _idBack.dispose();
    _selfie.dispose();
    _payoutMethod.dispose();
    _payoutAccount.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final status = await ref
          .read(creatorOnboardingServiceProvider)
          .getStatus();
      if (!mounted) return;
      setState(() {
        _applyStatus(status);
        _idType.text = status.idType ?? _idType.text;
        _idFront.text = status.idFrontUrl ?? '';
        _idBack.text = status.idBackUrl ?? '';
        _selfie.text = status.selfieUrl ?? '';
        _payoutMethod.text = status.payoutMethod ?? _payoutMethod.text;
        _payoutAccount.text =
            status.payoutDetails?['account']?.toString() ?? '';
      });
    } catch (error) {
      if (mounted) setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _applyStatus(CreatorVerificationModel status) {
    _status = status;
    final frames = status.livenessChallenge?.frameUrls ?? const <String>[];
    if (frames.isNotEmpty) {
      _challengeUrls
        ..clear()
        ..addAll(frames);
    }
  }

  void _showError(Object error) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(error.toString())));
  }

  Future<String?> _captureAndUpload({
    required ImageSource source,
    required int progressIndex,
    required int progressTotal,
  }) async {
    final uploadFailedMessage = AppLocalizations.of(context).uploadFailed;
    final image = await _picker.pickImage(
      source: source,
      preferredCameraDevice: CameraDevice.front,
      imageQuality: 85,
    );
    if (image == null) return null;
    final result = await ref
        .read(uploadServiceProvider)
        .uploadFile(
          image.path,
          fileName: image.name,
          onProgress: (sent, total) {
            if (!mounted || total <= 0) return;
            setState(() {
              _uploadProgress = (progressIndex + sent / total) / progressTotal;
            });
          },
        );
    final url = result['url']?.toString();
    if (url == null || url.isEmpty) {
      throw StateError(uploadFailedMessage);
    }
    return url;
  }

  Future<void> _pickDocument(TextEditingController controller) async {
    setState(() {
      _saving = true;
      _uploadProgress = 0;
    });
    try {
      final url = await _captureAndUpload(
        source: ImageSource.gallery,
        progressIndex: 0,
        progressTotal: 1,
      );
      if (url != null && mounted) setState(() => controller.text = url);
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
          _uploadProgress = null;
        });
      }
    }
  }

  Future<void> _captureSelfie() async {
    setState(() {
      _saving = true;
      _uploadProgress = 0;
    });
    try {
      final url = await _captureAndUpload(
        source: ImageSource.camera,
        progressIndex: 0,
        progressTotal: 1,
      );
      if (url != null && mounted) setState(() => _selfie.text = url);
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
          _uploadProgress = null;
        });
      }
    }
  }

  Future<void> _captureChallenge() async {
    final cancelledMessage = AppLocalizations.of(context).challengeCancelled;
    setState(() {
      _saving = true;
      _challengeStep = 0;
      _uploadProgress = 0;
      _challengeUrls.clear();
    });
    try {
      for (var index = 0; index < 3; index++) {
        if (!mounted) return;
        setState(() => _challengeStep = index);
        final url = await _captureAndUpload(
          source: ImageSource.camera,
          progressIndex: index,
          progressTotal: 3,
        );
        if (url == null) {
          throw StateError(cancelledMessage);
        }
        _challengeUrls.add(url);
      }
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
          _challengeStep = null;
          _uploadProgress = null;
        });
      }
    }
  }

  bool get _identityReady =>
      _idFront.text.isNotEmpty &&
      _idBack.text.isNotEmpty &&
      _selfie.text.isNotEmpty &&
      _challengeUrls.length == 3;

  Future<void> _saveIdentityAndAnalyze() async {
    final l10n = AppLocalizations.of(context);
    if (!_identityReady) {
      _showError(l10n.completeIdentityImages);
      return;
    }
    setState(() => _saving = true);
    try {
      final service = ref.read(creatorOnboardingServiceProvider);
      final saved = await service.updateIdentity(
        idType: _idType.text.trim(),
        idFrontUrl: _idFront.text,
        idBackUrl: _idBack.text,
        selfieUrl: _selfie.text,
        livenessFrameUrls: List.unmodifiable(_challengeUrls),
      );
      if (mounted) setState(() => _applyStatus(saved));
      final analyzed = await service.analyze();
      if (mounted) setState(() => _applyStatus(analyzed));
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _retryAnalysis() async {
    setState(() => _saving = true);
    try {
      final status = await ref.read(creatorOnboardingServiceProvider).analyze();
      if (mounted) setState(() => _applyStatus(status));
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _savePayout() async {
    setState(() => _saving = true);
    try {
      final status = await ref
          .read(creatorOnboardingServiceProvider)
          .updatePayout(
            payoutMethod: _payoutMethod.text.trim(),
            payoutDetails: {'account': _payoutAccount.text.trim()},
          );
      if (mounted) setState(() => _applyStatus(status));
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _submit() async {
    setState(() => _saving = true);
    try {
      final status = await ref
          .read(creatorOnboardingServiceProvider)
          .submit(guidelinesAccepted: _guidelines);
      if (!mounted) return;
      setState(() => _applyStatus(status));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context).applicationSubmitted),
        ),
      );
    } catch (error) {
      _showError(error);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.creatorOnboarding,
      showBack: true,
      body: _loading
          ? const SkeletonList(itemCount: 4)
          : _error != null
          ? ErrorView(message: _error!, onRetry: _load)
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                Card(
                  child: ListTile(
                    title: Text(
                      '${l10n.status}: ${_status?.status ?? 'draft'}',
                    ),
                    subtitle: Text(
                      l10n.stepProgress(_status?.currentStep ?? 1, 4),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  l10n.identity,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _idType.text,
                  decoration: InputDecoration(labelText: l10n.idType),
                  items: [
                    DropdownMenuItem(value: 'fayda', child: Text(l10n.faydaId)),
                    DropdownMenuItem(
                      value: 'kebele',
                      child: Text(l10n.kebeleId),
                    ),
                    DropdownMenuItem(
                      value: 'passport',
                      child: Text(l10n.passport),
                    ),
                  ],
                  onChanged: (value) => _idType.text = value ?? _idType.text,
                ),
                const SizedBox(height: 8),
                _UploadTile(
                  label: l10n.idFront,
                  uploaded: _idFront.text.isNotEmpty,
                  onTap: _saving ? null : () => _pickDocument(_idFront),
                ),
                const SizedBox(height: 8),
                _UploadTile(
                  label: l10n.idBack,
                  uploaded: _idBack.text.isNotEmpty,
                  onTap: _saving ? null : () => _pickDocument(_idBack),
                ),
                const SizedBox(height: 8),
                _UploadTile(
                  label: l10n.neutralSelfie,
                  uploaded: _selfie.text.isNotEmpty,
                  onTap: _saving ? null : _captureSelfie,
                ),
                const SizedBox(height: 20),
                Text(
                  l10n.livenessChallenge,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 4),
                Text(l10n.livenessAdvisory),
                const SizedBox(height: 8),
                ...[
                  l10n.lookStraight,
                  l10n.blinkNaturally,
                  l10n.turnHead,
                ].asMap().entries.map(
                  (entry) => ListTile(
                    dense: true,
                    leading: Icon(
                      _challengeUrls.length > entry.key
                          ? Icons.check_circle
                          : Icons.camera_alt_outlined,
                    ),
                    title: Text(entry.value),
                  ),
                ),
                if (_challengeStep != null)
                  Text(
                    l10n.capturingStep(
                      _challengeStep! + 1,
                      [
                        l10n.lookStraight,
                        l10n.blinkNaturally,
                        l10n.turnHead,
                      ][_challengeStep!],
                    ),
                  ),
                if (_uploadProgress != null) ...[
                  const SizedBox(height: 8),
                  LinearProgressIndicator(value: _uploadProgress),
                ],
                const SizedBox(height: 8),
                OutlinedButton.icon(
                  onPressed: _saving ? null : _captureChallenge,
                  icon: const Icon(Icons.camera_front_outlined),
                  label: Text(
                    _challengeUrls.length == 3
                        ? l10n.retryChallenge
                        : l10n.startChallenge,
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: _saving ? null : _saveIdentityAndAnalyze,
                  child: Text(l10n.saveAndAnalyze),
                ),
                if (_status?.analysisStatus != null) ...[
                  const SizedBox(height: 20),
                  _AnalysisCard(
                    status: _status!,
                    onRetry: _saving ? null : _retryAnalysis,
                  ),
                ],
                const SizedBox(height: 24),
                Text(
                  l10n.payout,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _payoutMethod,
                  decoration: InputDecoration(labelText: l10n.method),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _payoutAccount,
                  decoration: InputDecoration(labelText: l10n.account),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: _saving ? null : _savePayout,
                  child: Text(l10n.save),
                ),
                const SizedBox(height: 24),
                Text(
                  l10n.guidelines,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                CheckboxListTile(
                  value: _guidelines,
                  contentPadding: EdgeInsets.zero,
                  onChanged: (value) =>
                      setState(() => _guidelines = value == true),
                  title: Text(l10n.acceptGuidelines),
                ),
                if (!(_status?.canSubmit ?? false))
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(l10n.analysisRequired),
                  ),
                ElevatedButton(
                  onPressed:
                      _saving || !_guidelines || !(_status?.canSubmit ?? false)
                      ? null
                      : _submit,
                  child: Text(l10n.submit),
                ),
              ],
            ),
    );
  }
}

class _AnalysisCard extends StatelessWidget {
  const _AnalysisCard({required this.status, required this.onRetry});

  final CreatorVerificationModel status;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final ocr = status.ocrFields ?? const <String, dynamic>{};
    final checks = status.automatedChecks ?? const <String, dynamic>{};
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.automatedAnalysis,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            Text('${l10n.status}: ${status.analysisStatus}'),
            if (status.faceSimilarity != null)
              Text(
                '${l10n.faceSimilarity}: ${_formatScore(status.faceSimilarity!)}',
              ),
            if (status.livenessScore != null)
              Text(
                '${l10n.livenessScore}: ${_formatScore(status.livenessScore!)}',
              ),
            if (ocr.isNotEmpty) ...[
              const Divider(),
              Text(l10n.ocrSummary),
              ...ocr.entries.map(
                (entry) => Text('${entry.key}: ${entry.value}'),
              ),
            ],
            if (checks.isNotEmpty) ...[
              const Divider(),
              Text(l10n.automatedChecks),
              ...checks.entries
                  .where((entry) => entry.key != 'ocrFields')
                  .map((entry) => Text('${entry.key}: ${entry.value}')),
            ],
            const SizedBox(height: 8),
            Text(l10n.analysisAdvisory),
            Text(l10n.manualReviewNotice),
            if (!status.analysisCompleted)
              TextButton(onPressed: onRetry, child: Text(l10n.retryAnalysis)),
          ],
        ),
      ),
    );
  }

  static String _formatScore(double score) {
    final percentage = score <= 1 ? score * 100 : score;
    return '${percentage.toStringAsFixed(1)}%';
  }
}

class _UploadTile extends StatelessWidget {
  const _UploadTile({
    required this.label,
    required this.uploaded,
    required this.onTap,
  });

  final String label;
  final bool uploaded;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return ListTile(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Theme.of(context).dividerColor),
      ),
      leading: Icon(uploaded ? Icons.check_circle : Icons.add_a_photo_outlined),
      title: Text(label),
      subtitle: Text(uploaded ? l10n.uploaded : l10n.tapToUpload),
      onTap: onTap,
    );
  }
}
