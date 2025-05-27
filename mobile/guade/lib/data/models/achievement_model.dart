import 'package:equatable/equatable.dart';

class AchievementModel extends Equatable {
  final String achievementId;
  final String childId;
  final String type;
  final String title;
  final String description;
  final DateTime earnedAt;
  final int? streakCount;
  final int? totalCorrect;

  const AchievementModel({
    required this.achievementId,
    required this.childId,
    required this.type,
    required this.title,
    required this.description,
    required this.earnedAt,
    this.streakCount,
    this.totalCorrect,
  });

  factory AchievementModel.fromJson(Map<String, dynamic> json) {
    return AchievementModel(
      achievementId: json['achievement_id'] as String,
      childId: json['child_id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      earnedAt: DateTime.parse(json['earned_at'] as String),
      streakCount: json['streak_count'] as int?,
      totalCorrect: json['total_correct'] as int?,
    );
  }

  @override
  List<Object?> get props => [
    achievementId,
    childId,
    type,
    title,
    description,
    earnedAt,
    streakCount,
    totalCorrect,
  ];
}

class AchievementResponse {
  final List<AchievementModel> achievements;
  final int totalAchievements;
  final int totalPossible;
  final double completionPercentage;
  final Map<String, List<AchievementModel>> categories;

  const AchievementResponse({
    required this.achievements,
    required this.totalAchievements,
    required this.totalPossible,
    required this.completionPercentage,
    required this.categories,
  });

  factory AchievementResponse.fromJson(Map<String, dynamic> json) {
    return AchievementResponse(
      achievements: (json['achievements'] as List)
          .map((e) => AchievementModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      totalAchievements: json['total_achievements'] as int,
      totalPossible: json['total_possible'] as int,
      completionPercentage: (json['completion_percentage'] as num).toDouble(),
      categories: (json['categories'] as Map<String, dynamic>).map(
        (key, value) => MapEntry(
          key,
          (value as List)
              .map((e) => AchievementModel.fromJson(e as Map<String, dynamic>))
              .toList(),
        ),
      ),
    );
  }
}
