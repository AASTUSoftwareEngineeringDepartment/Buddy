import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/chat_repository.dart';
import 'chat_event.dart';
import 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRepository _chatRepository;

  ChatBloc(this._chatRepository) : super(ChatInitial()) {
    on<SendMessage>(_onSendMessage);
  }

  Future<void> _onSendMessage(
    SendMessage event,
    Emitter<ChatState> emit,
  ) async {
    try {
      if (state is ChatLoaded) {
        final currentState = state as ChatLoaded;
        final updatedMessages = List<ChatMessage>.from(currentState.messages)
          ..add(
            ChatMessage(
              text: event.message,
              isUser: true,
              timestamp: DateTime.now(),
            ),
          );

        emit(ChatLoaded(messages: updatedMessages));
        emit(ChatLoading());

        final response = await _chatRepository.askQuestion(
          query: event.message,
          accessToken: event.accessToken,
        );

        final finalMessages = List<ChatMessage>.from(updatedMessages)
          ..add(
            ChatMessage(
              text: response,
              isUser: false,
              timestamp: DateTime.now(),
            ),
          );

        emit(ChatLoaded(messages: finalMessages));
      } else {
        final messages = [
          ChatMessage(
            text: event.message,
            isUser: true,
            timestamp: DateTime.now(),
          ),
        ];

        emit(ChatLoaded(messages: messages));
        emit(ChatLoading());

        final response = await _chatRepository.askQuestion(
          query: event.message,
          accessToken: event.accessToken,
        );

        messages.add(
          ChatMessage(text: response, isUser: false, timestamp: DateTime.now()),
        );

        emit(ChatLoaded(messages: messages));
      }
    } catch (e) {
      emit(ChatError(e.toString().replaceAll('Exception: ', '')));
    }
  }
}
