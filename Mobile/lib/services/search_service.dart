import '../core/network/api_client.dart';
import '../models/user.dart';
import '../models/content.dart';

class SearchService {
  SearchService(this._client);

  final ApiClient _client;

  Future<({
    List<UserModel> users,
    List<ContentModel> content,
  })> search(String query, {String? type}) async {
    final res = await _client.get('/search', queryParameters: {
      'q': query,
      if (type != null) 'type': type,
    });
    final data = res.data as Map<String, dynamic>;
    final inner = data['data'] as Map<String, dynamic>? ?? data;

    final users = ((inner['users'] as List?) ?? [])
        .map((e) => UserModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
    final content = ((inner['content'] as List?) ?? (inner['contents'] as List?) ?? [])
        .map((e) => ContentModel.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

    return (users: users, content: content);
  }
}
