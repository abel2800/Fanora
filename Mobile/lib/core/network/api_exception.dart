class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.data});

  final String message;
  final int? statusCode;
  final dynamic data;

  @override
  String toString() => message;

  static ApiException fromDio(dynamic error) {
    if (error is ApiException) return error;
    try {
      final response = error.response;
      final data = response?.data;
      String message = 'Something went wrong';
      if (data is Map && data['message'] != null) {
        message = data['message'].toString();
      } else if (error.message != null) {
        message = error.message.toString();
      }
      return ApiException(message, statusCode: response?.statusCode, data: data);
    } catch (_) {
      return ApiException('Network error');
    }
  }
}
