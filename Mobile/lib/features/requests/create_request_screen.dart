import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class CreateRequestScreen extends ConsumerStatefulWidget {
  const CreateRequestScreen({super.key, this.creatorId, this.creatorUsername});

  final String? creatorId;
  final String? creatorUsername;

  @override
  ConsumerState<CreateRequestScreen> createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends ConsumerState<CreateRequestScreen> {
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _creatorId = TextEditingController();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    if (widget.creatorId != null) _creatorId.text = widget.creatorId!;
  }

  @override
  void dispose() {
    _description.dispose();
    _price.dispose();
    _creatorId.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final price = double.tryParse(_price.text.trim());
    if (_creatorId.text.trim().isEmpty || _description.text.trim().isEmpty || price == null) {
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(requestsServiceProvider).create(
            creatorId: _creatorId.text.trim(),
            description: _description.text.trim(),
            offeredPrice: price,
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
      title: l10n.newRequest,
      showBack: true,
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          if (widget.creatorUsername != null)
            Text('@${widget.creatorUsername}', style: const TextStyle(fontWeight: FontWeight.w600)),
          if (widget.creatorId == null) ...[
            TextField(
              controller: _creatorId,
              decoration: InputDecoration(labelText: l10n.creatorId),
            ),
            const SizedBox(height: 12),
          ],
          TextField(
            controller: _description,
            maxLines: 4,
            decoration: InputDecoration(labelText: l10n.description),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _price,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(labelText: l10n.offeredPrice),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _loading ? null : _submit,
            child: Text(_loading ? l10n.loading : l10n.submit),
          ),
        ],
      ),
    );
  }
}
