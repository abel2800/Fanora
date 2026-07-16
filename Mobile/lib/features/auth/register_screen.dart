import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_exception.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  int _step = 0;
  final _phone = TextEditingController();
  final _otp = TextEditingController();
  final _username = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  DateTime? _dob;
  bool _loading = false;
  bool _phoneVerified = false;
  String? _devCode;

  @override
  void dispose() {
    for (final c in [_phone, _otp, _username, _email, _password, _firstName, _lastName]) {
      c.dispose();
    }
    super.dispose();
  }

  bool _isAdult(DateTime dob) {
    final now = DateTime.now();
    var age = now.year - dob.year;
    if (now.month < dob.month || (now.month == dob.month && now.day < dob.day)) {
      age--;
    }
    return age >= 18;
  }

  Future<void> _sendOtp() async {
    final l10n = AppLocalizations.of(context);
    if (_phone.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.enterPhone)));
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await ref.read(authProvider.notifier).sendOtp(_phone.text.trim());
      setState(() {
        _step = 1;
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

  Future<void> _verifyOtp() async {
    final l10n = AppLocalizations.of(context);
    if (_otp.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.enterOtp)));
      return;
    }
    setState(() => _loading = true);
    try {
      final verified = await ref.read(authProvider.notifier).verifyPhoneOtp(_phone.text.trim(), _otp.text.trim());
      if (!verified) throw Exception('Invalid OTP');
      setState(() {
        _phoneVerified = true;
        _step = 2;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e is ApiException ? e.message : l10n.otpVerifyFailed)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _pickDob() async {
    final l10n = AppLocalizations.of(context);
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 18),
      firstDate: DateTime(1950),
      lastDate: now,
    );
    if (picked != null) {
      if (!_isAdult(picked)) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(l10n.mustBe18)),
          );
        }
        return;
      }
      setState(() => _dob = picked);
    }
  }

  Future<void> _submit() async {
    final l10n = AppLocalizations.of(context);
    if (_username.text.trim().length < 3 ||
        !_email.text.contains('@') ||
        _password.text.length < 6 ||
        _firstName.text.trim().isEmpty ||
        _lastName.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.fillAllFields)));
      return;
    }
    if (!_phoneVerified || _dob == null) return;

    setState(() => _loading = true);
    try {
      await ref.read(authProvider.notifier).register(
            username: _username.text.trim(),
            email: _email.text.trim(),
            password: _password.text,
            firstName: _firstName.text.trim(),
            lastName: _lastName.text.trim(),
            phoneNumber: _phone.text.trim(),
            dateOfBirth: _dob!.toIso8601String().split('T').first,
          );
      if (mounted) context.go('/home');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e is ApiException ? e.message : l10n.registrationFailed)),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _stepIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(4, (i) {
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 4),
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: i <= _step ? Theme.of(context).colorScheme.primary : Colors.grey.shade700,
          ),
        );
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.register,
      showBack: true,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _stepIndicator(),
            const SizedBox(height: 24),
            if (_step == 0) ...[
              Text(l10n.step1Phone, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(
                controller: _phone,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(labelText: l10n.phoneHint251),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _sendOtp,
                child: _loading ? const CircularProgressIndicator() : Text(l10n.sendOtp),
              ),
            ] else if (_step == 1) ...[
              Text(l10n.step2Otp, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(
                controller: _otp,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: l10n.otp),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _verifyOtp,
                child: _loading ? const CircularProgressIndicator() : Text(l10n.verify),
              ),
              TextButton(onPressed: _loading ? null : _sendOtp, child: Text(l10n.resendOtp)),
            ] else if (_step == 2) ...[
              Text(l10n.step3Dob, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(l10n.mustBe18Hint, style: const TextStyle(fontSize: 13)),
              const SizedBox(height: 16),
              ListTile(
                title: Text(_dob == null ? l10n.selectDob : _dob!.toIso8601String().split('T').first),
                trailing: const Icon(Icons.calendar_today),
                onTap: _pickDob,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _dob == null ? null : () => setState(() => _step = 3),
                child: Text(l10n.continueLabel),
              ),
            ] else ...[
              Text(l10n.step4Account, style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(controller: _firstName, decoration: InputDecoration(labelText: l10n.firstName)),
              const SizedBox(height: 12),
              TextField(controller: _lastName, decoration: InputDecoration(labelText: l10n.lastName)),
              const SizedBox(height: 12),
              TextField(controller: _username, decoration: InputDecoration(labelText: l10n.username)),
              const SizedBox(height: 12),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: l10n.email),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _password,
                obscureText: true,
                decoration: InputDecoration(labelText: l10n.password),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading ? const CircularProgressIndicator() : Text(l10n.register),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
