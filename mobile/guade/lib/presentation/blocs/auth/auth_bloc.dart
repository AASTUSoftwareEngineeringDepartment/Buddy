import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';
import 'package:flutter/material.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;

  AuthBloc(this._authRepository) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<AuthStatusChecked>(_onAuthStatusChecked);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      emit(AuthLoading());
      final response = await _authRepository.login(event.request);
      emit(AuthAuthenticated(response));
    } catch (e) {
      print('AuthBloc error: $e');
      emit(AuthError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    try {
      // Clear any stored tokens or user data
      // For now, we just emit unauthenticated state
      // In the future, you might want to call a logout API endpoint
      emit(AuthUnauthenticated());

      // Clear the navigation stack and return to login
      if (event.context != null) {
        Navigator.of(
          event.context!,
        ).pushNamedAndRemoveUntil('/', (route) => false);
      }
    } catch (e) {
      print('Logout error: $e');
      // Even if there's an error, we still want to log the user out
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onAuthStatusChecked(
    AuthStatusChecked event,
    Emitter<AuthState> emit,
  ) async {
    // TODO: Implement auth status check logic
    emit(AuthUnauthenticated());
  }
}
