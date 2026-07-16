import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class MassMessageScreen extends ConsumerStatefulWidget {
  const MassMessageScreen({super.key});

  @override
  ConsumerState<MassMessageScreen> createState() => _MassMessageScreenState();
}

class _MassMessageScreenState extends ConsumerState<MassMessageScreen> {
  final _content = TextEditingController();
  final _price = TextEditingController();
  String _segment = 'all';
  bool _loading = false;

  @override
  void dispose() {
    _content.dispose();
    _price.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final l10n = AppLocalizations.of(context);
    if (_content.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.enterMessageContent)));
      return;
    }
    setState(() => _loading = true);
    try {
      final res = await ref.read(messagesServiceProvider).sendBlast(
            content: _content.text.trim(),
            price: double.tryParse(_price.text.trim()),
            segment: _segment,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(res['message']?.toString() ?? l10n.messageSent)),
        );
        Navigator.of(context).pop();
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
    return AppScaffold(
      title: l10n.massMessage,
      showBack: true,
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(l10n.sendToSubscribers),
          const SizedBox(height: 16),
          TextField(
            controller: _content,
            maxLines: 5,
            decoration: InputDecoration(labelText: l10n.messageLabel, hintText: l10n.writeMessageHint),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _price,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: l10n.priceOptional,
              hintText: l10n.freeMessageHint,
            ),
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _segment,
            decoration: InputDecoration(labelText: l10n.audience),
            items: [
              DropdownMenuItem(value: 'all', child: Text(l10n.allSubscribers)),
              DropdownMenuItem(value: 'new', child: Text(l10n.newSubscribers)),
              DropdownMenuItem(value: 'loyal', child: Text(l10n.loyalSubscribers)),
            ],
            onChanged: (v) => setState(() => _segment = v ?? 'all'),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _loading ? null : _send,
            child: _loading ? const CircularProgressIndicator() : Text(l10n.sendBlast),
          ),
        ],
      ),
    );
  }
}
