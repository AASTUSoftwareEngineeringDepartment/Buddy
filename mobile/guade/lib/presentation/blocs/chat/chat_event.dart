import 'package:equatable/equatable.dart';

abstract class ChatEvent extends Equatable {
  const ChatEvent();

  @override
  List<Object?> get props => [];
}

class SendMessage extends ChatEvent {
  final String message;
  final String? accessToken;

  const SendMessage({required this.message, this.accessToken});

  @override
  List<Object?> get props => [message, accessToken];
}
