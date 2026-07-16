import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/widgets/app_avatar.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/user.dart';
import '../../providers/services_provider.dart';

class TrustCenterScreen extends ConsumerStatefulWidget {
  const TrustCenterScreen({super.key});

  @override
  ConsumerState<TrustCenterScreen> createState() => _TrustCenterScreenState();
}

class _TrustCenterScreenState extends ConsumerState<TrustCenterScreen> {
  List<Map<String, dynamic>> _reports = [];
  List<UserModel> _blocked = [];
  bool _loading = true;

  final _reason = TextEditingController();
  String _reportType = 'spam';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final reports = await ref.read(trustServiceProvider).getMyReports();
      final blocked = await ref.read(trustServiceProvider).getBlockedUsers();
      setState(() {
        _reports = reports;
        _blocked = blocked;
      });
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _submitReport() async {
    if (_reason.text.trim().isEmpty) return;
    final l10n = AppLocalizations.of(context);
    try {
      await ref.read(trustServiceProvider).submitReport(
            type: _reportType,
            reason: _reason.text.trim(),
          );
      _reason.clear();
      await _load();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.reportSubmitted)));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _unblock(UserModel user) async {
    try {
      await ref.read(trustServiceProvider).unblockUser(user.id);
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.trustSafety,
      showBack: true,
      body: _loading
          ? const LoadingView()
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(l10n.submitReport, style: const TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _reportType,
                  decoration: InputDecoration(labelText: l10n.type),
                  items: [
                    DropdownMenuItem(value: 'spam', child: Text(l10n.spam)),
                    DropdownMenuItem(value: 'harassment', child: Text(l10n.harassment)),
                    DropdownMenuItem(value: 'scam', child: Text(l10n.scam)),
                    DropdownMenuItem(value: 'other', child: Text(l10n.other)),
                  ],
                  onChanged: (v) => setState(() => _reportType = v ?? 'spam'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _reason,
                  maxLines: 3,
                  decoration: InputDecoration(labelText: l10n.reason),
                ),
                const SizedBox(height: 8),
                ElevatedButton(onPressed: _submitReport, child: Text(l10n.submitReportAction)),
                const Divider(height: 32),
                Text(l10n.blockedUsers, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (_blocked.isEmpty)
                  EmptyView(message: l10n.noBlockedUsers)
                else
                  ..._blocked.map(
                    (u) => ListTile(
                      leading: AppAvatar(imageUrl: u.profileImage, name: u.username),
                      title: Text(u.username),
                      trailing: TextButton(onPressed: () => _unblock(u), child: Text(l10n.unblock)),
                    ),
                  ),
                const Divider(height: 32),
                Text(l10n.myReports, style: const TextStyle(fontWeight: FontWeight.bold)),
                if (_reports.isEmpty)
                  EmptyView(message: l10n.noReports)
                else
                  ..._reports.map(
                    (r) => ListTile(
                      title: Text(r['type']?.toString() ?? ''),
                      subtitle: Text(r['reason']?.toString() ?? ''),
                      trailing: Text(r['status']?.toString() ?? 'pending'),
                    ),
                  ),
              ],
            ),
    );
  }
}
