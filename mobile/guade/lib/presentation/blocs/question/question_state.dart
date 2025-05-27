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
  final bool? isCorrect;
  final Map<String, dynamic>? latestAnsweredQuestion;
  final List<dynamic>? newAchievements;

  const QuestionLoaded({
    required this.questionResponse,
    this.userAnswers = const {},
    this.isCorrect,
    this.latestAnsweredQuestion,
    this.newAchievements,
  });

  QuestionLoaded copyWith({
    QuestionResponse? questionResponse,
    Map<String, int>? userAnswers,
    bool? isCorrect,
    Map<String, dynamic>? latestAnsweredQuestion,
    List<dynamic>? newAchievements,
  }) {
    return QuestionLoaded(
      questionResponse: questionResponse ?? this.questionResponse,
      userAnswers: userAnswers ?? this.userAnswers,
      isCorrect: isCorrect ?? this.isCorrect,
      latestAnsweredQuestion:
          latestAnsweredQuestion ?? this.latestAnsweredQuestion,
      newAchievements: newAchievements ?? this.newAchievements,
    );
  }

  @override
  List<Object?> get props => [
    questionResponse,
    userAnswers,
    isCorrect,
    latestAnsweredQuestion,
    newAchievements,
  ];
}

class QuestionError extends QuestionState {
  final String message;

  const QuestionError(this.message);

  @override
  List<Object?> get props => [message];
}
