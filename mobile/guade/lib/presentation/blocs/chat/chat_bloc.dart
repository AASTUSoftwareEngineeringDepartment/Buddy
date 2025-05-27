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
      // First, add the user's message to the state
      final currentMessages = state is ChatLoaded
          ? (state as ChatLoaded).messages
          : <ChatMessage>[];

      final updatedMessages = List<ChatMessage>.from(currentMessages)
        ..add(
          ChatMessage(
            text: event.message,
            isUser: true,
            timestamp: DateTime.now(),
          ),
        );

      // Emit the updated state with the user's message
      emit(ChatLoaded(messages: updatedMessages));

      // Show typing indicator
      emit(ChatLoading(messages: updatedMessages));

      // Get response from API
      final response = await _chatRepository.askQuestion(
        query: event.message,
        accessToken: event.accessToken,
      );

      // Add the response message
      final finalMessages = List<ChatMessage>.from(updatedMessages)
        ..add(
          ChatMessage(text: response, isUser: false, timestamp: DateTime.now()),
        );

      // Emit final state with both messages
      emit(ChatLoaded(messages: finalMessages));
    } catch (e) {
      // If there's an error, keep the user's message but show error
      if (state is ChatLoading) {
        final currentMessages = (state as ChatLoading).messages;
        emit(
          ChatError(
            e.toString().replaceAll('Exception: ', ''),
            messages: currentMessages,
          ),
        );
      } else {
        emit(ChatError(e.toString().replaceAll('Exception: ', '')));
      }
    }
  }
}
