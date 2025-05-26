import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/reward_repository.dart';
import 'reward_event.dart';
import 'reward_state.dart';

class RewardBloc extends Bloc<RewardEvent, RewardState> {
  final RewardRepository _rewardRepository;

  RewardBloc(this._rewardRepository) : super(RewardInitial()) {
    on<FetchCurrentReward>(_onFetchCurrentReward);
  }

  Future<void> _onFetchCurrentReward(
    FetchCurrentReward event,
    Emitter<RewardState> emit,
  ) async {
    try {
      emit(RewardLoading());
      final reward = await _rewardRepository.getCurrentChildReward(
        accessToken: event.accessToken,
      );
      emit(RewardLoaded(reward));
    } catch (e) {
      print('RewardBloc error: $e');
      emit(RewardError(e.toString().replaceAll('Exception: ', '')));
    }
  }
}
