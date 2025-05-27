import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';
import '../models/question_model.dart';

class QuestionRepository {
  final Dio _dio;
  final String _baseUrl = AppConfig.baseUrl;

  QuestionRepository(this._dio) {
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

  Future<QuestionResponse> generateQuestions({
    required String topic,
    required String childId,
    String? accessToken,
  }) async {
    try {
      print('Generating questions for topic: $topic, childId: $childId');
      print('API URL: $_baseUrl/science/generate-question');

      final options = accessToken != null
          ? Options(
              headers: {'Authorization': 'Bearer $accessToken'},
              validateStatus: (status) => status! < 500,
            )
          : Options(validateStatus: (status) => status! < 500);

      final response = await _dio.post(
        '$_baseUrl/science/generate-question',
        options: options,
        data: {'topic': topic, 'child_id': childId},
      );

      print('Response status code: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200) {
        final questionResponse = QuestionResponse.fromJson(response.data);
        print(
          'Successfully generated ${questionResponse.questions.length} questions',
        );
        return questionResponse;
      } else if (response.statusCode == 401) {
        print('Unauthorized access. Please check the access token.');
        throw Exception('Unauthorized access. Please login again.');
      } else {
        print('Unexpected response status: ${response.statusCode}');
        print('Response message: ${response.statusMessage}');
        throw Exception(
          'Failed to generate questions: ${response.statusMessage}',
        );
      }
    } on DioException catch (e) {
      print('DioException during question generation:');
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
          'An error occurred while generating questions. Please try again.',
        );
      }
    } catch (e, stackTrace) {
      print('Unexpected error during question generation: $e');
      print('Stack trace: $stackTrace');
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }

  Future<Map<String, dynamic>> submitAnswer({
    required String questionId,
    required int selectedIndex,
    String? accessToken,
  }) async {
    try {
      print(
        'Submitting answer for question: $questionId, selected index: $selectedIndex',
      );
      print('API URL: $_baseUrl/science/answer');

      final options = accessToken != null
          ? Options(
              headers: {'Authorization': 'Bearer $accessToken'},
              validateStatus: (status) => status! < 500,
            )
          : Options(validateStatus: (status) => status! < 500);

      final response = await _dio.post(
        '$_baseUrl/science/answer',
        options: options,
        data: {'question_id': questionId, 'selected_index': selectedIndex},
      );

      print('Response status code: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200) {
        return response.data as Map<String, dynamic>;
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized access. Please login again.');
      } else {
        throw Exception('Failed to submit answer: ${response.statusMessage}');
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
          'An error occurred while submitting answer. Please try again.',
        );
      }
    } catch (e, stackTrace) {
      print('Unexpected error during answer submission: $e');
      print('Stack trace: $stackTrace');
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }
}
