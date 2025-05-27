import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/achievement_repository.dart';
import 'achievement_event.dart';
import 'achievement_state.dart';

class AchievementBloc extends Bloc<AchievementEvent, AchievementState> {
  final AchievementRepository _achievementRepository;

  AchievementBloc(this._achievementRepository) : super(AchievementInitial()) {
    on<FetchAchievements>(_onFetchAchievements);
  }

  Future<void> _onFetchAchievements(
    FetchAchievements event,
    Emitter<AchievementState> emit,
  ) async {
    try {
      emit(AchievementLoading());
      final response = await _achievementRepository.getAchievements(
        accessToken: event.accessToken!,
      );
      emit(AchievementLoaded(response));
    } catch (e) {
      print('AchievementBloc error: $e');
      emit(AchievementError(e.toString().replaceAll('Exception: ', '')));
    }
  }
}
