import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';
import '../models/story_model.dart';

class StoryRepository {
  final Dio _dio;
  final String _baseUrl = AppConfig.baseUrl;

  StoryRepository() : _dio = Dio() {
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

  Future<StoriesResponse> getMyStories({
    String? accessToken,
    int skip = 0,
    int limit = 10,
  }) async {
    try {
      print('Fetching stories from: $_baseUrl/stories/my-stories');
      print('Parameters: skip=$skip, limit=$limit');

      final options = accessToken != null
          ? Options(headers: {'Authorization': 'Bearer $accessToken'})
          : null;

      final response = await _dio.get(
        '$_baseUrl/stories/my-stories',
        queryParameters: {'skip': skip, 'limit': limit},
        options: options,
      );

      print('Response status code: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200) {
        try {
          final storiesResponse = StoriesResponse.fromJson(response.data);
          print(
            'Successfully parsed ${storiesResponse.stories.length} stories',
          );
          print('Total stories available: ${storiesResponse.total}');
          return storiesResponse;
        } catch (e) {
          print('Error parsing stories response: $e');
          print('Response data that caused error: ${response.data}');
          throw Exception('Invalid response format from server');
        }
      } else {
        print(
          'Failed to fetch stories with status code: ${response.statusCode}',
        );
        print('Error message: ${response.statusMessage}');
        throw Exception('Failed to fetch stories: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      print('DioException during stories fetch:');
      print('Type: ${e.type}');
      print('Message: ${e.message}');
      print('Response: ${e.response?.data}');
      print('Error: ${e.error}');

      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized access. Please login again.');
      } else if (e.response?.statusCode == 404) {
        throw Exception('No stories found.');
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      } else {
        throw Exception(
          'An error occurred while fetching stories. Please try again.',
        );
      }
    } catch (e, stackTrace) {
      print('Unexpected error during stories fetch: $e');
      print('Stack trace: $stackTrace');
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }
}
