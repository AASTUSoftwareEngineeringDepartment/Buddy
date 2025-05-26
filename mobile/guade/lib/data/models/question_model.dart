import 'package:equatable/equatable.dart';

class QuestionModel extends Equatable {
  final String questionId;
  final String chunkId;
  final String question;
  final List<String> options;
  final int correctOptionIndex;
  final String explanation;
  final String difficultyLevel;
  final String ageRange;
  final String topic;
  final DateTime createdAt;
  final String childId;
  final String? childName;
  final bool solved;
  final int? selectedAnswer;
  final bool? scored;
  final DateTime? answeredAt;
  final int attempts;

  const QuestionModel({
    required this.questionId,
    required this.chunkId,
    required this.question,
    required this.options,
    required this.correctOptionIndex,
    required this.explanation,
    required this.difficultyLevel,
    required this.ageRange,
    required this.topic,
    required this.createdAt,
    required this.childId,
    this.childName,
    required this.solved,
    this.selectedAnswer,
    this.scored,
    this.answeredAt,
    required this.attempts,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    return QuestionModel(
      questionId: json['question_id'] as String,
      chunkId: json['chunk_id'] as String,
      question: json['question'] as String,
      options: List<String>.from(json['options'] as List),
      correctOptionIndex: json['correct_option_index'] as int,
      explanation: json['explanation'] as String,
      difficultyLevel: json['difficulty_level'] as String,
      ageRange: json['age_range'] as String,
      topic: json['topic'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      childId: json['child_id'] as String,
      childName: json['child_name'] as String?,
      solved: json['solved'] as bool,
      selectedAnswer: json['selected_answer'] as int?,
      scored: json['scored'] as bool?,
      answeredAt: json['answered_at'] != null
          ? DateTime.parse(json['answered_at'] as String)
          : null,
      attempts: json['attempts'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'question_id': questionId,
      'chunk_id': chunkId,
      'question': question,
      'options': options,
      'correct_option_index': correctOptionIndex,
      'explanation': explanation,
      'difficulty_level': difficultyLevel,
      'age_range': ageRange,
      'topic': topic,
      'created_at': createdAt.toIso8601String(),
      'child_id': childId,
      'child_name': childName,
      'solved': solved,
      'selected_answer': selectedAnswer,
      'scored': scored,
      'answered_at': answeredAt?.toIso8601String(),
      'attempts': attempts,
    };
  }

  @override
  List<Object?> get props => [
    questionId,
    chunkId,
    question,
    options,
    correctOptionIndex,
    explanation,
    difficultyLevel,
    ageRange,
    topic,
    createdAt,
    childId,
    childName,
    solved,
    selectedAnswer,
    scored,
    answeredAt,
    attempts,
  ];
}

class QuestionResponse {
  final List<QuestionModel> questions;
  final String sourceBook;
  final DateTime generatedAt;

  QuestionResponse({
    required this.questions,
    required this.sourceBook,
    required this.generatedAt,
  });

  factory QuestionResponse.fromJson(Map<String, dynamic> json) {
    return QuestionResponse(
      questions: (json['questions'] as List)
          .map((q) => QuestionModel.fromJson(q as Map<String, dynamic>))
          .toList(),
      sourceBook: json['source_book'] as String,
      generatedAt: DateTime.parse(json['generated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questions': questions.map((q) => q.toJson()).toList(),
      'source_book': sourceBook,
      'generated_at': generatedAt.toIso8601String(),
    };
  }
}
