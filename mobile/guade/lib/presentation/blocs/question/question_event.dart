import 'package:equatable/equatable.dart';

abstract class QuestionEvent extends Equatable {
  const QuestionEvent();

  @override
  List<Object?> get props => [];
}

class GenerateQuestions extends QuestionEvent {
  final String topic;
  final String childId;
  final String? accessToken;

  const GenerateQuestions({
    required this.topic,
    required this.childId,
    this.accessToken,
  });

  @override
  List<Object?> get props => [topic, childId, accessToken];
}

class AnswerQuestion extends QuestionEvent {
  final String questionId;
  final int selectedOptionIndex;
  final String? accessToken;

  const AnswerQuestion({
    required this.questionId,
    required this.selectedOptionIndex,
    this.accessToken,
  });

  @override
  List<Object?> get props => [questionId, selectedOptionIndex, accessToken];
}
