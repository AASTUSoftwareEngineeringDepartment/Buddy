import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';
import '../models/vocabulary_model.dart';

class VocabularyRepository {
  final Dio _dio;
  final String _baseUrl = AppConfig.baseUrl;

  VocabularyRepository(this._dio) {
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

  Future<List<VocabularyModel>> getMyVocabulary({String? accessToken}) async {
    try {
      print('Fetching vocabulary from: $_baseUrl/stories/my-vocabulary');

      final options = accessToken != null
          ? Options(headers: {'Authorization': 'Bearer $accessToken'})
          : null;

      final response = await _dio.get(
        '$_baseUrl/stories/my-vocabulary',
        options: options,
      );

      print('Response status code: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200) {
        try {
          final List<dynamic> data = response.data as List<dynamic>;
          final vocabularyList = data
              .map(
                (item) =>
                    VocabularyModel.fromJson(item as Map<String, dynamic>),
              )
              .toList();

          print(
            'Successfully parsed ${vocabularyList.length} vocabulary items',
          );
          return vocabularyList;
        } catch (e) {
          print('Error parsing vocabulary response: $e');
          print('Response data that caused error: ${response.data}');
          throw Exception('Invalid response format from server');
        }
      } else {
        print(
          'Failed to fetch vocabulary with status code: ${response.statusCode}',
        );
        print('Error message: ${response.statusMessage}');
        throw Exception(
          'Failed to fetch vocabulary: ${response.statusMessage}',
        );
      }
    } on DioException catch (e) {
      print('DioException during vocabulary fetch:');
      print('Type: ${e.type}');
      print('Message: ${e.message}');
      print('Response: ${e.response?.data}');
      print('Error: ${e.error}');

      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized access. Please login again.');
      } else if (e.response?.statusCode == 404) {
        throw Exception('No vocabulary found.');
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      } else {
        throw Exception(
          'An error occurred while fetching vocabulary. Please try again.',
        );
      }
    } catch (e, stackTrace) {
      print('Unexpected error during vocabulary fetch: $e');
      print('Stack trace: $stackTrace');
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }

  Future<List<VocabularyModel>> getVocabulariesByStoryId(
    String storyId, {
    String? accessToken,
  }) async {
    try {
      print('Fetching vocabularies for story ID: $storyId');
      print('API URL: $_baseUrl/vocabulary/story/$storyId/vocabulary');

      final options = accessToken != null
          ? Options(
              headers: {'Authorization': 'Bearer $accessToken'},
              validateStatus: (status) => status! < 500,
            )
          : Options(validateStatus: (status) => status! < 500);

      final response = await _dio.get(
        '$_baseUrl/vocabulary/story/$storyId/vocabulary',
        options: options,
      );

      print('Response status code: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        final vocabularies = data
            .map((json) => VocabularyModel.fromJson(json))
            .toList();
        print('Successfully parsed ${vocabularies.length} vocabularies');
        return vocabularies;
      } else if (response.statusCode == 401) {
        print('Unauthorized access. Please check the access token.');
        throw Exception('Unauthorized access. Please login again.');
      } else if (response.statusCode == 404) {
        print('No vocabularies found for story ID: $storyId');
        return [];
      } else {
        print('Unexpected response status: ${response.statusCode}');
        print('Response message: ${response.statusMessage}');
        return [];
      }
    } on DioException catch (e) {
      print('DioException during vocabulary fetch:');
      print('Type: ${e.type}');
      print('Message: ${e.message}');
      print('Response: ${e.response?.data}');
      print('Error: ${e.error}');

      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized access. Please login again.');
      } else if (e.response?.statusCode == 404) {
        return [];
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      } else {
        throw Exception(
          'An error occurred while fetching vocabularies. Please try again.',
        );
      }
    } catch (e, stackTrace) {
      print('Unexpected error during vocabulary fetch: $e');
      print('Stack trace: $stackTrace');
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }
}
