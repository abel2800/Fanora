import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/conversation.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';

class ChatScreen extends ConsumerStatefulWidget {
  const ChatScreen({super.key, required this.userId});

  final String userId;

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _messageCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  List<MessageModel> _messages = [];
  bool _loading = true;
  bool _paidMode = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _messageCtrl.dispose();
    _priceCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final messages = await ref.read(messagesServiceProvider).getMessages(widget.userId);
      setState(() => _messages = messages.reversed.toList());
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _send() async {
    final text = _messageCtrl.text.trim();
    if (text.isEmpty) return;
    final price = _paidMode ? double.tryParse(_priceCtrl.text.trim()) : null;
    _messageCtrl.clear();
    try {
      final msg = await ref.read(messagesServiceProvider).sendMessage(
            widget.userId,
            text,
            price: price != null && price > 0 ? price : null,
          );
      setState(() => _messages.add(msg));
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent + 80,
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _unlock(MessageModel message, int index) async {
    final pinCtrl = TextEditingController();
    final pin = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        final l10n = AppLocalizations.of(ctx);
        return Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(l10n.unlockMessage, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 8),
              Text(Formatters.currency(message.price ?? 0)),
              const SizedBox(height: 12),
              TextField(controller: pinCtrl, obscureText: true, decoration: InputDecoration(labelText: AppLocalizations.of(context).pin)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(ctx, pinCtrl.text.trim()),
                child: Text(l10n.unlock),
              ),
            ],
          ),
        );
      },
    );
    if (pin == null) return;
    try {
      final unlocked = await ref.read(messagesServiceProvider).unlockMessage(
            message.id,
            pin: pin.isEmpty ? null : pin,
          );
      setState(() => _messages[index] = unlocked);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final myId = ref.watch(authProvider).user?.id;
    final l10n = AppLocalizations.of(context);
    final isCreator = ref.watch(authProvider).user?.isCreator == true;

    return AppScaffold(
      title: l10n.messages,
      showBack: true,
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const LoadingView(variant: LoadingVariant.list)
                : ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (_, i) {
                      final m = _messages[i];
                      final isMe = m.senderId == myId;
                      final locked = m.isLockedPaid && !isMe;
                      return Align(
                        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                          decoration: BoxDecoration(
                            color: isMe ? AppColors.primary.withValues(alpha: 0.2) : AppColors.surfaceLight,
                            borderRadius: BorderRadius.circular(16),
                            border: m.isPaid ? Border.all(color: AppColors.primary.withValues(alpha: 0.4)) : null,
                          ),
                          child: locked
                              ? Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(l10n.paidMessage, style: const TextStyle(fontWeight: FontWeight.w600)),
                                    Text(Formatters.currency(m.price ?? 0), style: const TextStyle(color: AppColors.textSecondary)),
                                    const SizedBox(height: 8),
                                    OutlinedButton(
                                      onPressed: () => _unlock(m, i),
                                      child: Text(l10n.unlockMessage),
                                    ),
                                  ],
                                )
                              : Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (m.isPaid)
                                      Padding(
                                        padding: const EdgeInsets.only(bottom: 4),
                                        child: Text(
                                          '${l10n.paidMessage} · ${Formatters.currency(m.price ?? 0)}',
                                          style: const TextStyle(fontSize: 11, color: AppColors.primary),
                                        ),
                                      ),
                                    Text(m.content),
                                  ],
                                ),
                        ),
                      );
                    },
                  ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                children: [
                  if (isCreator)
                    Row(
                      children: [
                        FilterChip(
                          label: Text(l10n.paidMessage),
                          selected: _paidMode,
                          onSelected: (v) => setState(() => _paidMode = v),
                        ),
                        if (_paidMode) ...[
                          const SizedBox(width: 8),
                          SizedBox(
                            width: 100,
                            child: TextField(
                              controller: _priceCtrl,
                              keyboardType: TextInputType.number,
                              decoration: InputDecoration(hintText: l10n.offeredPrice, isDense: true),
                            ),
                          ),
                        ],
                      ],
                    ),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _messageCtrl,
                          decoration: InputDecoration(hintText: l10n.typeMessage),
                          onSubmitted: (_) => _send(),
                        ),
                      ),
                      IconButton(icon: const Icon(Icons.send), onPressed: _send),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
