import 'package:equatable/equatable.dart';
import '../../../data/models/achievement_model.dart';

abstract class AchievementState extends Equatable {
  const AchievementState();

  @override
  List<Object?> get props => [];
}

class AchievementInitial extends AchievementState {}

class AchievementLoading extends AchievementState {}

class AchievementLoaded extends AchievementState {
  final AchievementResponse response;

  const AchievementLoaded(this.response);

  @override
  List<Object?> get props => [response];
}

class AchievementError extends AchievementState {
  final String message;

  const AchievementError(this.message);

  @override
  List<Object?> get props => [message];
}
