import '../../../data/models/reward_model.dart';

abstract class RewardState {}

class RewardInitial extends RewardState {}

class RewardLoading extends RewardState {}

class RewardLoaded extends RewardState {
  final RewardModel reward;

  RewardLoaded(this.reward);
}

class RewardError extends RewardState {
  final String message;

  RewardError(this.message);
}
