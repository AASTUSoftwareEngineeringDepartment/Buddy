import 'package:equatable/equatable.dart';
import '../../../data/models/auth/login_request.dart';
import 'package:flutter/material.dart';

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

class LogoutRequested extends AuthEvent {
  final BuildContext? context;

  const LogoutRequested({this.context});

  @override
  List<Object?> get props => [context];
}

class AuthStatusChecked extends AuthEvent {
  const AuthStatusChecked();
}
