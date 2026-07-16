import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class CreateStoryScreen extends ConsumerStatefulWidget {
  const CreateStoryScreen({super.key});

  @override
  ConsumerState<CreateStoryScreen> createState() => _CreateStoryScreenState();
}

class _CreateStoryScreenState extends ConsumerState<CreateStoryScreen> {
  final _caption = TextEditingController();
  String? _mediaUrl;
  bool _loading = false;

  @override
  void dispose() {
    _caption.dispose();
    super.dispose();
  }

  Future<void> _pickAndUpload() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image);
    if (result == null || result.files.single.path == null) return;
    setState(() => _loading = true);
    try {
      final upload = await ref.read(uploadServiceProvider).uploadFile(result.files.single.path!);
      setState(() => _mediaUrl = upload['url']?.toString());
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    if (_mediaUrl == null) return;
    setState(() => _loading = true);
    try {
      await ref.read(storiesServiceProvider).create(
            mediaUrl: _mediaUrl!,
            mediaType: 'image',
            caption: _caption.text.trim(),
          );
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.createStory,
      showBack: true,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            OutlinedButton.icon(
              onPressed: _loading ? null : _pickAndUpload,
              icon: const Icon(Icons.image),
              label: Text(_mediaUrl == null ? l10n.selectImage : l10n.imageUploaded),
            ),
            const SizedBox(height: 16),
            TextField(controller: _caption, decoration: InputDecoration(labelText: l10n.caption)),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading || _mediaUrl == null ? null : _submit,
              child: _loading ? const CircularProgressIndicator() : Text(l10n.postStory),
            ),
          ],
        ),
      ),
    );
  }
}
