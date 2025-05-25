import 'package:equatable/equatable.dart';
import '../../../data/models/auth/login_request.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final LoginRequest request;

  const LoginRequested(this.request);

  @override
  List<Object?> get props => [request];
}

class LogoutRequested extends AuthEvent {}

class AuthStatusChecked extends AuthEvent {} 