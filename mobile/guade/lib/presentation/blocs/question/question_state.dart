import 'package:equatable/equatable.dart';
import '../../../data/models/question_model.dart';

abstract class QuestionState extends Equatable {
  const QuestionState();

  @override
  List<Object?> get props => [];
}

class QuestionInitial extends QuestionState {}

class QuestionLoading extends QuestionState {}

class QuestionLoaded extends QuestionState {
  final QuestionResponse questionResponse;
  final Map<String, int> userAnswers;

  const QuestionLoaded({
    required this.questionResponse,
    this.userAnswers = const {},
  });

  QuestionLoaded copyWith({
    QuestionResponse? questionResponse,
    Map<String, int>? userAnswers,
  }) {
    return QuestionLoaded(
      questionResponse: questionResponse ?? this.questionResponse,
      userAnswers: userAnswers ?? this.userAnswers,
    );
  }

  @override
  List<Object?> get props => [questionResponse, userAnswers];
}

class QuestionError extends QuestionState {
  final String message;

  const QuestionError(this.message);

  @override
  List<Object?> get props => [message];
}
