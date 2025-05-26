import 'package:dio/dio.dart';
import '../../core/config/app_config.dart';
import '../models/auth/login_request.dart';
import '../models/auth/login_response.dart';
import '../models/user_profile.dart';

class AuthRepository {
  final Dio _dio;
  final String _baseUrl = AppConfig.baseUrl;

  AuthRepository() : _dio = Dio() {
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

  Future<LoginResponse> login(LoginRequest request) async {
    try {
      print('Attempting login for user: ${request.username}');
      print('Request URL: $_baseUrl/auth/login');
      print('Request data: ${request.toJson()}');

      final response = await _dio.post(
        '$_baseUrl/auth/login',
        data: request.toJson(),
      );

      print('Response status code: ${response.statusCode}');
      print('Response data: ${response.data}');

      if (response.statusCode == 200) {
        try {
          final loginResponse = LoginResponse.fromJson(response.data);
          print('Successfully parsed login response');
          return loginResponse;
        } catch (e) {
          print('Error parsing login response: $e');
          print('Response data that caused error: ${response.data}');
          throw Exception('Invalid response format from server');
        }
      } else {
        print('Login failed with status code: ${response.statusCode}');
        print('Error message: ${response.statusMessage}');
        throw Exception('Failed to login: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      print('DioException during login:');
      print('Type: ${e.type}');
      print('Message: ${e.message}');
      print('Response: ${e.response?.data}');
      print('Error: ${e.error}');

      if (e.response?.statusCode == 401) {
        throw Exception('Invalid username or password');
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw Exception('Connection timeout. Please try again.');
      } else if (e.type == DioExceptionType.connectionError) {
        throw Exception(
          'No internet connection. Please check your connection and try again.',
        );
      } else {
        throw Exception('An error occurred during login. Please try again.');
      }
    } catch (e, stackTrace) {
      print('Unexpected error during login: $e');
      print('Stack trace: $stackTrace');
      throw Exception('An unexpected error occurred. Please try again.');
    }
  }

  Future<UserProfile> getCurrentUserProfile(String accessToken) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/auth/me',
        options: Options(headers: {'Authorization': 'Bearer $accessToken'}),
      );
      print('Response data: \\${response}');
      if (response.statusCode == 200) {
        return UserProfile.fromJson(response.data);
      } else {
        throw Exception(
          'Failed to fetch user profile: \\${response.statusMessage}',
        );
      }
    } on DioException catch (e) {
      throw Exception('Failed to fetch user profile: \\${e.message}');
    }
  }
}
