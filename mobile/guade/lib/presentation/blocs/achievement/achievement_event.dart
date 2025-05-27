import 'package:equatable/equatable.dart';

abstract class AchievementEvent extends Equatable {
  const AchievementEvent();

  @override
  List<Object?> get props => [];
}

class FetchAchievements extends AchievementEvent {
  final String? accessToken;

  const FetchAchievements({this.accessToken});

  @override
  List<Object?> get props => [accessToken];
}
