import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';
import '../models/reward_model.dart';

class RewardRepository {
  final Dio _dio;
  final String _baseUrl = AppConfig.baseUrl;

  RewardRepository() : _dio = Dio() {
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

  Future<RewardModel> getCurrentChildReward({String? accessToken}) async {
    try {
      print('Fetching current child reward from: $_baseUrl/science/rewards');

      final options = accessToken != null
          ? Options(headers: {'Authorization': 'Bearer $accessToken'})
          : null;

      final response = await _dio.get(
        '$_baseUrl/science/rewards',
        options: options,
      );

      print('Response status code: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200) {
        try {
          final rewardModel = RewardModel.fromJson(response.data);
          print('Successfully parsed reward response');
          print('Reward ID: ${rewardModel.rewardId}');
          print('Child ID: ${rewardModel.childId}');
          print('Level: ${rewardModel.level}');
          print('XP: ${rewardModel.xp}');
          print('Created At: ${rewardModel.createdAt}');
          print('Updated At: ${rewardModel.updatedAt}');
          return rewardModel;
        } catch (e) {
          print('Error parsing reward response: $e');
          print('Response data that caused error: ${response.data}');
          throw Exception('Invalid response format from server');
        }
      } else {
        print(
          'Failed to fetch reward with status code: ${response.statusCode}',
        );
        print('Error message: ${response.statusMessage}');
        throw Exception('Failed to fetch reward: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      print('DioException during reward fetch:');
      print('Type: ${e.type}');
      print('Message: ${e.message}');
      print('Response: ${e.response?.data}');
      print('Error: ${e.error}');

      if (e.response?.statusCode == 401) {
        throw Exception('Unauthorized access. Please login again.');
      } else if (e.response?.statusCode == 404) {
        throw Exception('No reward found for this child.');
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      } else {
        throw Exception(
          'An error occurred while fetching reward. Please try again.',
        );
      }
    } catch (e, stackTrace) {
      print('Unexpected error during reward fetch: $e');
      print('Stack trace: $stackTrace');
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }
}
