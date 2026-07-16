import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_avatar.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/conversation.dart';
import '../../providers/services_provider.dart';

class MessagesListScreen extends ConsumerStatefulWidget {
  const MessagesListScreen({super.key});

  @override
  ConsumerState<MessagesListScreen> createState() => _MessagesListScreenState();
}

class _MessagesListScreenState extends ConsumerState<MessagesListScreen> {
  List<ConversationModel> _conversations = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(messagesServiceProvider).getConversations();
      setState(() => _conversations = items);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.messages)),
      body: _loading
          ? const LoadingView()
          : _error != null
              ? ErrorView(message: _error!, onRetry: _load)
              : _conversations.isEmpty
                  ? EmptyView(message: l10n.noConversations)
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.builder(
                        itemCount: _conversations.length,
                        itemBuilder: (_, i) {
                          final c = _conversations[i];
                          final other = c.otherUser;
                          return ListTile(
                            leading: AppAvatar(imageUrl: other?.profileImage, name: other?.username),
                            title: Text(other?.username ?? l10n.unknown),
                            subtitle: Text(c.lastMessage?.content ?? ''),
                            trailing: c.unreadCount > 0
                                ? CircleAvatar(radius: 12, child: Text('${c.unreadCount}', style: const TextStyle(fontSize: 10)))
                                : (c.updatedAt != null ? Text(Formatters.timeAgo(c.updatedAt!), style: const TextStyle(fontSize: 12)) : null),
                            onTap: () => context.push('/messages/${other?.id}'),
                          );
                        },
                      ),
                    ),
    );
  }
}
