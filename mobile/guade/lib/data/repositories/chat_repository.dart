import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';

class ChatRepository {
  final Dio _dio;
  final String _baseUrl = AppConfig.baseUrl;

  ChatRepository(this._dio) {
    _dio.options.connectTimeout = Duration(
      milliseconds: AppConfig.connectionTimeout,
    );
    _dio.options.receiveTimeout = Duration(
      milliseconds: AppConfig.receiveTimeout,
    );
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  Future<String> askQuestion({
    required String query,
    String? accessToken,
  }) async {
    try {
      final options = accessToken != null
          ? Options(
              headers: {'Authorization': 'Bearer $accessToken'},
              validateStatus: (status) => status! < 500,
            )
          : Options(validateStatus: (status) => status! < 500);

      final response = await _dio.post(
        '$_baseUrl/chat/ask',
        options: options,
        data: {'query': query, 'n_chunks': 3},
      );

      if (response.statusCode == 200) {
        return response.data['response'] as String;
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized access. Please login again.');
      } else {
        throw Exception('Failed to get response: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized access. Please login again.');
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      } else {
        throw Exception(
          'An error occurred while getting response. Please try again.',
        );
      }
    } catch (e) {
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }
}
