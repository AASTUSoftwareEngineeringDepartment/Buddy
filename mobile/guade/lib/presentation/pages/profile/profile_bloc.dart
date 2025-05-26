import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/models/user_profile.dart';
import '../../../data/models/reward_model.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../data/repositories/reward_repository.dart';
import 'package:equatable/equatable.dart';

// Events
abstract class ProfileEvent extends Equatable {
  const ProfileEvent();
  @override
  List<Object?> get props => [];
}

class LoadProfile extends ProfileEvent {
  final String accessToken;
  const LoadProfile(this.accessToken);
  @override
  List<Object?> get props => [accessToken];
}

// States
abstract class ProfileState extends Equatable {
  const ProfileState();
  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final UserProfile profile;
  final RewardModel? reward;
  const ProfileLoaded(this.profile, {this.reward});
  @override
  List<Object?> get props => [profile, reward];
}

class ProfileError extends ProfileState {
  final String message;
  const ProfileError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final AuthRepository authRepository;
  final RewardRepository rewardRepository;

  ProfileBloc({required this.authRepository, required this.rewardRepository})
    : super(ProfileInitial()) {
    on<LoadProfile>(_onLoadProfile);
  }

  Future<void> _onLoadProfile(
    LoadProfile event,
    Emitter<ProfileState> emit,
  ) async {
    print('LoadProfile event received with token: ${event.accessToken}');
    emit(ProfileLoading());
    try {
      // Fetch both profile and reward data concurrently
      final results = await Future.wait([
        authRepository.getCurrentUserProfile(event.accessToken),
        rewardRepository.getCurrentChildReward(accessToken: event.accessToken),
      ]);

      final profile = results[0] as UserProfile;
      final reward = results[1] as RewardModel;

      print('Profile and reward data loaded successfully');
      print(
        'User: ${profile.username}, Level: ${reward.level}, XP: ${reward.xp}',
      );

      emit(ProfileLoaded(profile, reward: reward));
    } catch (e) {
      print('Error loading profile data: $e');

      // Try to load just the profile if reward fetch fails
      try {
        final profile = await authRepository.getCurrentUserProfile(
          event.accessToken,
        );
        print('Profile loaded without reward data');
        emit(ProfileLoaded(profile));
      } catch (profileError) {
        emit(ProfileError(profileError.toString()));
      }
    }
  }
}
