import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/loading_view.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/locale_provider.dart';
import '../../providers/preferences_provider.dart';
import '../../providers/services_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _loading = true;
  bool _notifications = true;
  bool _privateProfile = false;
  bool _incognitoMode = false;
  bool _hideFromSubscriberSearch = false;
  bool _dataSaver = false;
  String _language = 'en';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final localSaver = ref.read(preferencesProvider).dataSaver;
    final localLang = ref.read(localeProvider).languageCode;
    try {
      final settings = await ref.read(userServiceProvider).getSettings();
      final privacy = Map<String, dynamic>.from((settings['privacy'] ?? {}) as Map);
      final prefs = Map<String, dynamic>.from((settings['preferences'] ?? {}) as Map);
      setState(() {
        _notifications = settings['notificationsEnabled'] != false ||
            (settings['notifications']?['push'] != false);
        _privateProfile = privacy['profileVisibility'] == 'private';
        _incognitoMode = privacy['incognitoMode'] == true;
        _hideFromSubscriberSearch = privacy['hideFromSubscriberSearch'] == true;
        _dataSaver = prefs['dataSaver'] == true || localSaver;
        _language = prefs['language']?.toString() ?? localLang;
      });
      await ref.read(preferencesProvider.notifier).setDataSaver(_dataSaver);
      await ref.read(localeProvider.notifier).setLocale(_language);
    } catch (_) {
      setState(() {
        _dataSaver = localSaver;
        _language = localLang;
      });
    }
    setState(() => _loading = false);
  }

  Future<void> _save(Map<String, dynamic> patch) async {
    try {
      await ref.read(userServiceProvider).updateSettings(patch);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(AppLocalizations.of(context).settingsSaved)),
        );
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  void _updatePrivacy(String key, bool value) {
    _save({'privacy': {key: value}});
  }

  Future<void> _updatePreferences({String? language, bool? dataSaver}) async {
    final lang = language ?? _language;
    final saver = dataSaver ?? _dataSaver;
    setState(() {
      _language = lang;
      _dataSaver = saver;
    });
    await ref.read(localeProvider.notifier).setLocale(lang);
    await ref.read(preferencesProvider.notifier).setDataSaver(saver);
    await _save({'preferences': {'language': lang, 'dataSaver': saver}});
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return AppScaffold(
      title: l10n.settings,
      showBack: true,
      body: _loading
          ? const LoadingView(variant: LoadingVariant.list)
          : ListView(
              children: [
                ListTile(title: Text(l10n.notifications, style: const TextStyle(fontWeight: FontWeight.bold))),
                SwitchListTile(
                  title: Text(l10n.pushNotifications),
                  value: _notifications,
                  onChanged: (v) {
                    setState(() => _notifications = v);
                    _save({'notifications': {'push': v, 'email': v}});
                  },
                ),
                const Divider(),
                ListTile(title: Text(l10n.privacy, style: const TextStyle(fontWeight: FontWeight.bold))),
                SwitchListTile(
                  title: Text(l10n.privateProfile),
                  value: _privateProfile,
                  onChanged: (v) {
                    setState(() => _privateProfile = v);
                    _save({'privacy': {'profileVisibility': v ? 'private' : 'public'}});
                  },
                ),
                SwitchListTile(
                  title: Text(l10n.incognitoMode),
                  value: _incognitoMode,
                  onChanged: (v) {
                    setState(() => _incognitoMode = v);
                    _updatePrivacy('incognitoMode', v);
                  },
                ),
                SwitchListTile(
                  title: Text(l10n.hideFromSearch),
                  value: _hideFromSubscriberSearch,
                  onChanged: (v) {
                    setState(() => _hideFromSubscriberSearch = v);
                    _updatePrivacy('hideFromSubscriberSearch', v);
                  },
                ),
                const Divider(),
                ListTile(title: Text(l10n.preferences, style: const TextStyle(fontWeight: FontWeight.bold))),
                SwitchListTile(
                  title: Text(l10n.dataSaver),
                  subtitle: Text(l10n.dataSaverHint),
                  value: _dataSaver,
                  onChanged: (v) => _updatePreferences(dataSaver: v),
                ),
                ListTile(
                  title: Text(l10n.language),
                  subtitle: Text(_language == 'am' ? l10n.amharic : l10n.english),
                  trailing: DropdownButton<String>(
                    value: _language == 'am' ? 'am' : 'en',
                    underline: const SizedBox.shrink(),
                    items: [
                      DropdownMenuItem(value: 'en', child: Text(l10n.english)),
                      DropdownMenuItem(value: 'am', child: Text(l10n.amharic)),
                    ],
                    onChanged: (v) {
                      if (v == null) return;
                      _updatePreferences(language: v);
                    },
                  ),
                ),
                const Divider(),
                ListTile(
                  leading: const Icon(Icons.shield_outlined),
                  title: Text(l10n.trustSafety),
                  onTap: () => context.push('/trust-center'),
                ),
                ListTile(
                  leading: const Icon(Icons.lock_outline),
                  title: Text(l10n.changePassword),
                  onTap: () => context.push('/profile/change-password'),
                ),
              ],
            ),
    );
  }
}
