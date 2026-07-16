import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_exception.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _email = TextEditingController();
  bool _loading = false;
  bool _sent = false;

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      await ref.read(authServiceProvider).forgotPassword(_email.text.trim());
      setState(() => _sent = true);
    } catch (e) {
      final l10n = AppLocalizations.of(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e is ApiException ? e.message : l10n.failed)),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.forgotPasswordTitle,
      showBack: true,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: _sent
            ? Column(
                children: [
                  const Icon(Icons.mark_email_read, size: 64),
                  const SizedBox(height: 16),
                  Text(l10n.checkEmailReset),
                  const SizedBox(height: 24),
                  ElevatedButton(onPressed: () => context.go('/login'), child: Text(l10n.backToLogin)),
                ],
              )
            : Column(
                children: [
                  Text(l10n.enterEmailReset),
                  const SizedBox(height: 16),
                  TextField(controller: _email, decoration: InputDecoration(labelText: l10n.email)),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    child: _loading ? const CircularProgressIndicator() : Text(l10n.sendResetLink),
                  ),
                ],
              ),
      ),
    );
  }
}
