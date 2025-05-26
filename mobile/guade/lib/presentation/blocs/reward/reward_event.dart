abstract class RewardEvent {}

class FetchCurrentReward extends RewardEvent {
  final String? accessToken;

  FetchCurrentReward({this.accessToken});
}
