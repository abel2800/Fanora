import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../core/utils/formatters.dart';
import '../../core/widgets/app_avatar.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../models/content.dart';
import '../../models/subscription_plan.dart';
import '../../models/user.dart';
import '../../providers/auth_provider.dart';
import '../../providers/services_provider.dart';

class CreatorProfileScreen extends ConsumerStatefulWidget {
  const CreatorProfileScreen({super.key, required this.username});

  final String username;

  @override
  ConsumerState<CreatorProfileScreen> createState() => _CreatorProfileScreenState();
}

class _CreatorProfileScreenState extends ConsumerState<CreatorProfileScreen> {
  UserModel? _user;
  List<ContentModel> _content = [];
  List<SubscriptionPlanModel> _plans = [];
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
      final user = await ref.read(userServiceProvider).getProfile(widget.username);
      final content = await ref.read(contentServiceProvider).getByCreator(user.id);
      final plans = await ref.read(subscriptionsServiceProvider).getCreatorPlans(user.id);
      setState(() {
        _user = user;
        _content = content.items;
        _plans = plans;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _toggleFollow() async {
    if (_user == null) return;
    try {
      if (_user!.isFollowing == true) {
        await ref.read(userServiceProvider).unfollow(_user!.id);
      } else {
        await ref.read(userServiceProvider).follow(_user!.id);
      }
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    if (_loading) return const AppScaffold(body: LoadingView(), showBack: true);
    if (_error != null) return AppScaffold(body: ErrorView(message: _error!, onRetry: _load), showBack: true);
    final user = _user!;
    final me = ref.watch(authProvider).user;

    return AppScaffold(
      showBack: true,
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 16),
                AppAvatar(imageUrl: user.profileImage, name: user.username, radius: 48),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(user.username, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    if (user.isVerified) const Icon(Icons.verified, color: AppColors.primary, size: 18),
                  ],
                ),
                if (user.bio != null) Padding(padding: const EdgeInsets.all(16), child: Text(user.bio!)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _stat(l10n.followers, user.followersCount ?? 0),
                    const SizedBox(width: 24),
                    _stat(l10n.following, user.followingCount ?? 0),
                  ],
                ),
                const SizedBox(height: 16),
                if (me?.id != user.id)
                  ElevatedButton(
                    onPressed: _toggleFollow,
                    child: Text(user.isFollowing == true ? l10n.unfollow : l10n.follow),
                  ),
                if (me?.id != user.id)
                  TextButton(onPressed: () => context.push('/messages/${user.id}'), child: Text(l10n.message)),
                if (me?.id != user.id)
                  TextButton(
                    onPressed: () => context.push('/requests/create?creatorId=${user.id}&username=${user.username}'),
                    child: Text(l10n.customRequest),
                  ),
              ],
            ),
          ),
          if (_plans.isNotEmpty)
            SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(l10n.subscriptionPlans, style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                  ..._plans.map((p) => ListTile(
                        title: Text(p.name),
                        subtitle: Text(p.description ?? ''),
                        trailing: Text(Formatters.currency(p.price ?? 0)),
                        onTap: () async {
                          try {
                            await ref.read(subscriptionsServiceProvider).subscribe(p.id);
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(l10n.subscribed)));
                            }
                          } catch (e) {
                            if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
                          }
                        },
                      )),
                ],
              ),
            ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(l10n.contentCount(_content.length), style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          ),
          _content.isEmpty
              ? SliverToBoxAdapter(child: EmptyView(message: l10n.noContentYet))
              : SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (_, i) => ListTile(
                      title: Text(_content[i].title),
                      subtitle: Text(_content[i].type ?? ''),
                      onTap: () => context.push('/content/${_content[i].id}'),
                    ),
                    childCount: _content.length,
                  ),
                ),
        ],
      ),
    );
  }

  Widget _stat(String label, int count) => Column(
        children: [
          Text(Formatters.compact(count), style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
        ],
      );
}
