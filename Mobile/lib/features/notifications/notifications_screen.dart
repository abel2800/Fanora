import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/utils/formatters.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/notification.dart';
import '../../providers/services_provider.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  List<NotificationModel> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final items = await ref.read(notificationsServiceProvider).getAll();
      setState(() => _items = items);
    } catch (_) {}
    setState(() => _loading = false);
  }

  String? _resolveDeepLink(NotificationModel n) {
    final data = n.data;
    if (data == null) return null;
    final deepLink = data['deepLink']?.toString();
    if (deepLink != null && deepLink.isNotEmpty) return deepLink;

    final contentId = data['contentId']?.toString() ?? data['relatedContentId']?.toString();
    if (contentId != null && contentId.isNotEmpty) return '/content/$contentId';

    final userId = data['userId']?.toString() ?? data['relatedUserId']?.toString();
    if (n.type.contains('message') && userId != null) return '/messages/$userId';

    final requestId = data['requestId']?.toString();
    if (requestId != null) {
      if (n.type.contains('custom_request_update')) return '/requests';
      return '/creator/requests';
    }

    final username = data['username']?.toString();
    if (username != null && username.isNotEmpty) return '/creator/$username';

    return null;
  }

  Future<void> _open(NotificationModel n) async {
    if (!n.isRead) {
      await ref.read(notificationsServiceProvider).markRead(n.id);
    }
    final link = _resolveDeepLink(n);
    if (!mounted) return;
    if (link != null && link.startsWith('/')) {
      context.push(link);
    }
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.notifications,
      showBack: true,
      actions: [
        TextButton(
          onPressed: () async {
            await ref.read(notificationsServiceProvider).markAllRead();
            await _load();
          },
          child: Text(l10n.markAllRead),
        ),
      ],
      body: _loading
          ? const LoadingView(variant: LoadingVariant.list)
          : _items.isEmpty
              ? EmptyView(message: l10n.noNotifications)
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    itemCount: _items.length,
                    itemBuilder: (_, i) {
                      final n = _items[i];
                      return ListTile(
                        leading: Icon(
                          n.isRead ? Icons.notifications_none : Icons.notifications_active,
                        ),
                        title: Text(
                          n.title,
                          style: TextStyle(fontWeight: n.isRead ? FontWeight.normal : FontWeight.bold),
                        ),
                        subtitle: Text(n.message ?? ''),
                        trailing: n.createdAt != null
                            ? Text(Formatters.timeAgo(n.createdAt!), style: const TextStyle(fontSize: 11))
                            : null,
                        onTap: () => _open(n),
                      );
                    },
                  ),
                ),
    );
  }
}
