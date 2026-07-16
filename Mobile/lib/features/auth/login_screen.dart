import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_exception.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _emailFormKey = GlobalKey<FormState>();
  final _phoneFormKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _phone = TextEditingController();
  final _otp = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  bool _otpSent = false;
  String? _devCode;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    _email.dispose();
    _password.dispose();
    _phone.dispose();
    _otp.dispose();
    super.dispose();
  }

  Future<void> _submitEmail() async {
    if (!_emailFormKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(authProvider.notifier).login(_email.text.trim(), _password.text);
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e is ApiException ? e.message : AppLocalizations.of(context).loginFailed)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _sendOtp() async {
    if (_phone.text.trim().isEmpty) {
      final l10n = AppLocalizations.of(context);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.enterPhone)));
      return;
    }
    setState(() => _loading = true);
    final l10n = AppLocalizations.of(context);
    try {
      final res = await ref.read(authProvider.notifier).sendOtp(
            _phone.text.trim(),
            purpose: 'login',
          );
      setState(() {
        _otpSent = true;
        _devCode = res['devCode']?.toString();
      });
      if (mounted) {
        final msg = _devCode != null ? l10n.otpSentDev(_devCode!) : l10n.otpSent;
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e is ApiException ? e.message : l10n.failedSendOtp)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submitOtp() async {
    if (!_phoneFormKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      await ref.read(authProvider.notifier).loginWithOtp(_phone.text.trim(), _otp.text.trim());
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e is ApiException ? e.message : AppLocalizations.of(context).otpLoginFailed)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 48, 24, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(l10n.appName, style: Theme.of(context).textTheme.headlineMedium),
                  const SizedBox(height: 8),
                  Text(l10n.login),
                ],
              ),
            ),
            TabBar(
              controller: _tabs,
              tabs: [
                Tab(text: l10n.email),
                Tab(text: l10n.phone),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tabs,
                children: [
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Form(
                      key: _emailFormKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextFormField(
                            controller: _email,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(labelText: l10n.email),
                            validator: (v) => v == null || v.isEmpty ? l10n.requiredField : null,
                          ),
                          const SizedBox(height: 16),
                          TextFormField(
                            controller: _password,
                            obscureText: _obscure,
                            decoration: InputDecoration(
                              labelText: l10n.password,
                              suffixIcon: IconButton(
                                icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                                onPressed: () => setState(() => _obscure = !_obscure),
                              ),
                            ),
                            validator: (v) => v == null || v.length < 6 ? l10n.min6Chars : null,
                          ),
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () => context.push('/forgot-password'),
                              child: Text(l10n.forgotPassword),
                            ),
                          ),
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: _loading ? null : _submitEmail,
                            child: _loading ? const InlineSpinner() : Text(l10n.login),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Form(
                      key: _phoneFormKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          TextFormField(
                            controller: _phone,
                            keyboardType: TextInputType.phone,
                            decoration: InputDecoration(labelText: l10n.phone),
                            validator: (v) => v == null || v.isEmpty ? l10n.requiredField : null,
                          ),
                          if (_otpSent) ...[
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _otp,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(labelText: l10n.otp),
                              validator: (v) => v == null || v.length < 4 ? l10n.enterOtp : null,
                            ),
                          ],
                          const SizedBox(height: 16),
                          if (!_otpSent)
                            ElevatedButton(
                              onPressed: _loading ? null : _sendOtp,
                              child: _loading ? const InlineSpinner() : Text(l10n.sendOtp),
                            )
                          else ...[
                            ElevatedButton(
                              onPressed: _loading ? null : _submitOtp,
                              child: _loading ? const InlineSpinner() : Text(l10n.verifyOtp),
                            ),
                            TextButton(
                              onPressed: _loading ? null : _sendOtp,
                              child: Text(l10n.sendOtp),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: TextButton(
                onPressed: () => context.push('/register'),
                child: Text(l10n.register),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
