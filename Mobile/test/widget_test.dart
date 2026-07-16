import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:fanora/app.dart';

void main() {
  testWidgets('Fanora app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: FanoraApp()));
    await tester.pump();
    expect(find.text('Fanora'), findsWidgets);
  });
}
