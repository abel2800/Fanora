import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';

class CreateContentScreen extends ConsumerStatefulWidget {
  const CreateContentScreen({super.key});

  @override
  ConsumerState<CreateContentScreen> createState() => _CreateContentScreenState();
}

class _CreateContentScreenState extends ConsumerState<CreateContentScreen> {
  final _title = TextEditingController();
  final _description = TextEditingController();
  final _price = TextEditingController();
  String _type = 'image';
  String _accessType = 'free';
  String? _filePath;
  bool _loading = false;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    _price.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(type: FileType.media);
    if (result != null && result.files.single.path != null) {
      setState(() => _filePath = result.files.single.path);
    }
  }

  Future<void> _submit() async {
    if (_title.text.isEmpty) return;
    setState(() => _loading = true);
    final l10n = AppLocalizations.of(context);
    try {
      await ref.read(contentServiceProvider).create(
            title: _title.text.trim(),
            description: _description.text.trim(),
            type: _type,
            accessType: _accessType,
            price: _accessType == 'pay_per_view' ? double.tryParse(_price.text) : null,
            filePath: _filePath,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.contentCreated)));
        context.go('/home');
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final user = ref.watch(authProvider).user;
    if (user?.isCreator != true) {
      return AppScaffold(
        title: l10n.create,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.becomeCreator),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () async {
                  try {
                    await ref.read(creatorsServiceProvider).applyToBeCreator();
                    await ref.read(authProvider.notifier).refreshUser();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.applicationSubmitted)));
                    }
                  } catch (e) {
                    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                  }
                },
                child: Text(l10n.applyCreator),
              ),
            ],
          ),
        ),
      );
    }

    return AppScaffold(
      title: l10n.createContent,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _title, decoration: InputDecoration(labelText: l10n.title)),
            const SizedBox(height: 12),
            TextField(controller: _description, decoration: InputDecoration(labelText: l10n.description), maxLines: 3),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _type,
              decoration: InputDecoration(labelText: l10n.type),
              items: [
                DropdownMenuItem(value: 'image', child: Text(l10n.image)),
                DropdownMenuItem(value: 'video', child: Text(l10n.video)),
                DropdownMenuItem(value: 'audio', child: Text(l10n.audio)),
              ],
              onChanged: (v) => setState(() => _type = v ?? 'image'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _accessType,
              decoration: InputDecoration(labelText: l10n.access),
              items: [
                DropdownMenuItem(value: 'free', child: Text(l10n.free)),
                DropdownMenuItem(value: 'pay_per_view', child: Text(l10n.payPerView)),
                DropdownMenuItem(value: 'subscriber_only', child: Text(l10n.subscribersOnly)),
              ],
              onChanged: (v) => setState(() => _accessType = v ?? 'free'),
            ),
            if (_accessType == 'pay_per_view') ...[
              const SizedBox(height: 12),
              TextField(
                controller: _price,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(labelText: l10n.priceEtb),
              ),
            ],
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: _pickFile,
              icon: const Icon(Icons.attach_file),
              label: Text(_filePath == null ? l10n.attachMedia : l10n.fileSelected),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading ? const CircularProgressIndicator() : Text(l10n.publish),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
