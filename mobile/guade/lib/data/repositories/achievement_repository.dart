import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';
import '../models/achievement_model.dart';

class AchievementRepository {
  final Dio _dio;
  final String _baseUrl = AppConfig.baseUrl;

  AchievementRepository(this._dio) {
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

  Future<AchievementResponse> getAchievements({
    required String accessToken,
  }) async {
    try {
      print('Fetching achievements from: $_baseUrl/science/achievements');

      final response = await _dio.get(
        '$_baseUrl/science/achievements',
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );

      print('Response status code: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200) {
        try {
          final achievementResponse = AchievementResponse.fromJson(
            response.data,
          );
          print('Successfully parsed achievement response');
          return achievementResponse;
        } catch (e) {
          print('Error parsing achievement response: $e');
          print('Response data that caused error: ${response.data}');
          throw Exception('Invalid response format from server');
        }
      } else {
        print('Unexpected response status: ${response.statusCode}');
        print('Response message: ${response.statusMessage}');
        throw Exception(
          'Failed to fetch achievements: ${response.statusMessage}',
        );
      }
    } on DioException catch (e) {
      print('DioException during achievement fetch:');
      print('Type: ${e.type}');
      print('Message: ${e.message}');
      print('Response: ${e.response?.data}');
      print('Error: ${e.error}');

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
          'An error occurred while fetching achievements. Please try again.',
        );
      }
    } catch (e, stackTrace) {
      print('Unexpected error during achievement fetch: $e');
      print('Stack trace: $stackTrace');
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }
}
