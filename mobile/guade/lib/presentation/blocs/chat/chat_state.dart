import 'package:equatable/equatable.dart';

abstract class ChatState extends Equatable {
  const ChatState();

  @override
  List<Object?> get props => [];
}

class ChatInitial extends ChatState {}

class ChatLoading extends ChatState {
  final List<ChatMessage> messages;

  const ChatLoading({required this.messages});

  @override
  List<Object?> get props => [messages];
}

class ChatLoaded extends ChatState {
  final List<ChatMessage> messages;

  const ChatLoaded({required this.messages});

  ChatLoaded copyWith({List<ChatMessage>? messages}) {
    return ChatLoaded(messages: messages ?? this.messages);
  }

  @override
  List<Object?> get props => [messages];
}

class ChatError extends ChatState {
  final String message;
  final List<ChatMessage> messages;

  const ChatError(this.message, {this.messages = const []});

  @override
  List<Object?> get props => [message, messages];
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
}
