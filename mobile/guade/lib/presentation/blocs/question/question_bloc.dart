import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/question_repository.dart';
import 'question_event.dart';
import 'question_state.dart';

class QuestionBloc extends Bloc<QuestionEvent, QuestionState> {
  final QuestionRepository _questionRepository;

  QuestionBloc(this._questionRepository) : super(QuestionInitial()) {
    on<GenerateQuestions>(_onGenerateQuestions);
    on<AnswerQuestion>(_onAnswerQuestion);
  }

  Future<void> _onGenerateQuestions(
    GenerateQuestions event,
    Emitter<QuestionState> emit,
  ) async {
    try {
      emit(QuestionLoading());
      final questionResponse = await _questionRepository.generateQuestions(
        topic: event.topic,
        childId: event.childId,
        accessToken: event.accessToken,
      );
      emit(QuestionLoaded(questionResponse: questionResponse));
    } catch (e) {
      print('QuestionBloc error: $e');
      emit(QuestionError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onAnswerQuestion(
    AnswerQuestion event,
    Emitter<QuestionState> emit,
  ) async {
    if (state is QuestionLoaded) {
      final currentState = state as QuestionLoaded;
      final updatedAnswers = Map<String, int>.from(currentState.userAnswers);
      updatedAnswers[event.questionId] = event.selectedOptionIndex;

      emit(currentState.copyWith(userAnswers: updatedAnswers));
    }
  }
}
