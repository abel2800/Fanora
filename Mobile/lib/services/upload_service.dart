import 'package:dio/dio.dart';

import '../core/network/api_client.dart';

class UploadService {
  UploadService(this._client);

  final ApiClient _client;

  Future<Map<String, dynamic>> uploadFile(
    String filePath, {
    String? fileName,
    void Function(int, int)? onProgress,
  }) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });
    final res = await _client.upload('/upload', formData: formData, onSendProgress: onProgress);
    final data = res.data as Map<String, dynamic>;
    return Map<String, dynamic>.from((data['data'] ?? data) as Map);
  }
}
