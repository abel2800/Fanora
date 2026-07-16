import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _dataSaverKey = 'fanora_data_saver';

final preferencesProvider = StateNotifierProvider<PreferencesNotifier, PreferencesState>((ref) {
  return PreferencesNotifier();
});

class PreferencesState {
  const PreferencesState({this.dataSaver = false, this.loaded = false});

  final bool dataSaver;
  final bool loaded;

  PreferencesState copyWith({bool? dataSaver, bool? loaded}) {
    return PreferencesState(
      dataSaver: dataSaver ?? this.dataSaver,
      loaded: loaded ?? this.loaded,
    );
  }
}

class PreferencesNotifier extends StateNotifier<PreferencesState> {
  PreferencesNotifier() : super(const PreferencesState()) {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    state = PreferencesState(
      dataSaver: prefs.getBool(_dataSaverKey) ?? false,
      loaded: true,
    );
  }

  Future<void> setDataSaver(bool value) async {
    state = state.copyWith(dataSaver: value, loaded: true);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_dataSaverKey, value);
  }
}
