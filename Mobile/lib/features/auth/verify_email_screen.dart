import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_exception.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';

class VerifyEmailScreen extends ConsumerStatefulWidget {
  const VerifyEmailScreen({super.key, required this.token});

  final String token;

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen> {
  bool _loading = true;
  String? _error;
  bool _success = false;

  @override
  void initState() {
    super.initState();
    _verify();
  }

  Future<void> _verify() async {
    try {
      await ref.read(authServiceProvider).verifyEmail(widget.token);
      await ref.read(authProvider.notifier).refreshUser();
      setState(() => _success = true);
    } catch (e) {
      final fallback = mounted ? AppLocalizations.of(context).verificationFailed : 'Verification failed';
      setState(() => _error = e is ApiException ? e.message : fallback);
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.verifyEmail,
      body: Center(
        child: _loading
            ? const CircularProgressIndicator()
            : _success
                ? Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.check_circle, color: AppColors.success, size: 64),
                      const SizedBox(height: 16),
                      Text(l10n.emailVerified),
                      const SizedBox(height: 24),
                      ElevatedButton(onPressed: () => context.go('/home'), child: Text(l10n.continueLabel)),
                    ],
                  )
                : Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, size: 64),
                      Text(_error ?? l10n.failed),
                      const SizedBox(height: 16),
                      OutlinedButton(onPressed: _verify, child: Text(l10n.retry)),
                    ],
                  ),
      ),
    );
  }
}
