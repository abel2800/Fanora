import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/live_stream.dart';
import '../../providers/services_provider.dart';

class LiveStartScreen extends ConsumerStatefulWidget {
  const LiveStartScreen({super.key});

  @override
  ConsumerState<LiveStartScreen> createState() => _LiveStartScreenState();
}

class _LiveStartScreenState extends ConsumerState<LiveStartScreen> {
  final _title = TextEditingController();
  final _description = TextEditingController();
  bool _loading = false;
  LiveStreamModel? _stream;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _start() async {
    if (_title.text.isEmpty) return;
    setState(() => _loading = true);
    try {
      final stream = await ref.read(liveServiceProvider).start(
            title: _title.text.trim(),
            description: _description.text.trim(),
          );
      setState(() => _stream = stream);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _end() async {
    final stream = _stream;
    if (stream == null) return;
    try {
      await ref.read(liveServiceProvider).end(stream.id);
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  void _copy(String label, String value) {
    Clipboard.setData(ClipboardData(text: value));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context).labelCopied(label))),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final stream = _stream;

    return AppScaffold(
      title: stream == null ? l10n.goLive : l10n.studio,
      showBack: true,
      body: stream == null
          ? Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  TextField(controller: _title, decoration: InputDecoration(labelText: l10n.streamTitle)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _description,
                    decoration: InputDecoration(labelText: l10n.description),
                    maxLines: 3,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _loading ? null : _start,
                    icon: _loading ? const InlineSpinner() : const Icon(Icons.videocam),
                    label: Text(l10n.startStreaming),
                  ),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(24),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(stream.title ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text('${l10n.status}: ${stream.status}', style: const TextStyle(color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(l10n.rtmpIngest, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                _copyTile(l10n.rtmpIngest, stream.ingestUrl ?? '—'),
                if (stream.streamKey != null && stream.streamKey!.isNotEmpty)
                  _copyTile(l10n.streamKey, stream.streamKey!),
                const SizedBox(height: 16),
                Text(l10n.playbackUrl, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                _copyTile(l10n.playbackUrl, stream.hlsPlaybackUrl ?? '—'),
                const SizedBox(height: 12),
                Text(
                  l10n.rtmpHint,
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
                const SizedBox(height: 24),
                OutlinedButton(
                  onPressed: () => context.push('/live/${stream.id}'),
                  child: Text(l10n.watchLive),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: _end,
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                  child: Text(l10n.endStream),
                ),
              ],
            ),
    );
  }

  Widget _copyTile(String label, String value) {
    return Card(
      child: ListTile(
        title: Text(label),
        subtitle: SelectableText(value),
        trailing: IconButton(
          icon: const Icon(Icons.copy),
          onPressed: value == '—' ? null : () => _copy(label, value),
        ),
      ),
    );
  }
}
