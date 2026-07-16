import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_scaffold.dart';
import '../../core/widgets/empty_view.dart';
import '../../core/widgets/error_view.dart';
import '../../core/widgets/skeleton.dart';
import '../../l10n/app_localizations.dart';
import '../../providers/services_provider.dart';

class ContentCalendarScreen extends ConsumerStatefulWidget {
  const ContentCalendarScreen({super.key});

  @override
  ConsumerState<ContentCalendarScreen> createState() => _ContentCalendarScreenState();
}

class _ContentCalendarScreenState extends ConsumerState<ContentCalendarScreen> {
  bool _weekView = false;
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = [];
  DateTime _anchor = DateTime.now();

  @override
  void initState() {
    super.initState();
    _load();
  }

  DateTime get _from {
    if (_weekView) {
      final weekday = _anchor.weekday % 7;
      return DateTime(_anchor.year, _anchor.month, _anchor.day - weekday);
    }
    return DateTime(_anchor.year, _anchor.month, 1);
  }

  DateTime get _to {
    if (_weekView) return _from.add(const Duration(days: 7));
    return DateTime(_anchor.year, _anchor.month + 1, 1);
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await ref.read(contentServiceProvider).getCalendar(from: _from, to: _to);
      setState(() => _items = items);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  void _shift(int delta) {
    setState(() {
      if (_weekView) {
        _anchor = _anchor.add(Duration(days: 7 * delta));
      } else {
        _anchor = DateTime(_anchor.year, _anchor.month + delta, 1);
      }
    });
    _load();
  }

  Future<void> _reschedule(Map<String, dynamic> item) async {
    final initial = DateTime.tryParse(item['scheduledPublishDate']?.toString() ?? '') ??
        DateTime.now().add(const Duration(days: 1));
    final date = await showDatePicker(
      context: context,
      initialDate: initial.isAfter(DateTime.now()) ? initial : DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(initial));
    if (time == null || !mounted) return;
    final scheduled = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    try {
      await ref.read(contentServiceProvider).updateCalendar(item['id'].toString(), scheduled);
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final rangeLabel = _weekView
        ? '${DateFormat.MMMd().format(_from)} – ${DateFormat.MMMd().format(_to.subtract(const Duration(days: 1)))}'
        : DateFormat.yMMMM().format(_anchor);

    return AppScaffold(
      title: l10n.contentCalendar,
      showBack: true,
      actions: [
        IconButton(icon: const Icon(Icons.chevron_left), onPressed: () => _shift(-1)),
        IconButton(icon: const Icon(Icons.chevron_right), onPressed: () => _shift(1)),
      ],
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Row(
              children: [
                Expanded(child: Text(rangeLabel, style: const TextStyle(fontWeight: FontWeight.w600))),
                SegmentedButton<bool>(
                  segments: [
                    ButtonSegment(value: false, label: Text(l10n.month)),
                    ButtonSegment(value: true, label: Text(l10n.week)),
                  ],
                  selected: {_weekView},
                  onSelectionChanged: (v) {
                    setState(() => _weekView = v.first);
                    _load();
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const SkeletonList()
                : _error != null
                    ? ErrorView(message: _error!, onRetry: _load)
                    : _items.isEmpty
                        ? EmptyView(message: l10n.contentCalendar)
                        : RefreshIndicator(
                            onRefresh: _load,
                            child: ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: _items.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 12),
                              itemBuilder: (_, i) {
                                final item = _items[i];
                                final when = DateTime.tryParse(
                                      item['scheduledPublishDate']?.toString() ??
                                          item['publishedAt']?.toString() ??
                                          '',
                                    );
                                return Card(
                                  child: ListTile(
                                    leading: const Icon(Icons.event, color: AppColors.primary),
                                    title: Text(item['title']?.toString() ?? ''),
                                    subtitle: Text(
                                      '${item['status'] ?? ''} · ${item['type'] ?? ''}'
                                      '${when != null ? ' · ${DateFormat.yMMMd().add_jm().format(when)}' : ''}',
                                    ),
                                    onTap: () => context.push('/content/${item['id']}'),
                                    trailing: IconButton(
                                      icon: const Icon(Icons.schedule),
                                      onPressed: () => _reschedule(item),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
