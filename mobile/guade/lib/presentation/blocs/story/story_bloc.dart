import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/story_repository.dart';
import 'story_event.dart';
import 'story_state.dart';

class StoryBloc extends Bloc<StoryEvent, StoryState> {
  final StoryRepository _storyRepository;

  StoryBloc(this._storyRepository) : super(StoryInitial()) {
    on<FetchStories>(_onFetchStories);
    on<LoadMoreStories>(_onLoadMoreStories);
    on<RefreshStories>(_onRefreshStories);
    on<GenerateNewStory>(_onGenerateNewStory);
  }

  Future<void> _onFetchStories(
    FetchStories event,
    Emitter<StoryState> emit,
  ) async {
    try {
      if (event.isRefresh && state is StoryLoaded) {
        // Keep current state but show loading indicator
        final currentState = state as StoryLoaded;
        emit(currentState.copyWith(isLoadingMore: false));
      } else {
        emit(StoryLoading());
      }

      final response = await _storyRepository.getMyStories(
        accessToken: event.accessToken,
        skip: event.skip,
        limit: event.limit,
      );

      final hasMore = (event.skip + response.stories.length) < response.total;

      emit(
        StoryLoaded(
          stories: response.stories,
          total: response.total,
          currentSkip: event.skip,
          limit: event.limit,
          hasMore: hasMore,
        ),
      );
    } catch (e) {
      print('StoryBloc error: $e');
      emit(StoryError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onLoadMoreStories(
    LoadMoreStories event,
    Emitter<StoryState> emit,
  ) async {
    if (state is! StoryLoaded) return;

    final currentState = state as StoryLoaded;
    if (!currentState.hasMore || currentState.isLoadingMore) return;

    try {
      emit(currentState.copyWith(isLoadingMore: true));

      final nextSkip = currentState.currentSkip + currentState.limit;
      final response = await _storyRepository.getMyStories(
        accessToken: event.accessToken,
        skip: nextSkip,
        limit: currentState.limit,
      );

      final allStories = [...currentState.stories, ...response.stories];
      final hasMore = (nextSkip + response.stories.length) < response.total;

      emit(
        StoryLoaded(
          stories: allStories,
          total: response.total,
          currentSkip: nextSkip,
          limit: currentState.limit,
          hasMore: hasMore,
          isLoadingMore: false,
        ),
      );
    } catch (e) {
      print('StoryBloc load more error: $e');
      emit(currentState.copyWith(isLoadingMore: false));
      // You might want to show a snackbar or toast here instead of changing state
    }
  }

  Future<void> _onRefreshStories(
    RefreshStories event,
    Emitter<StoryState> emit,
  ) async {
    add(
      FetchStories(
        accessToken: event.accessToken,
        skip: 0,
        limit: 10,
        isRefresh: true,
      ),
    );
  }

  Future<void> _onGenerateNewStory(
    GenerateNewStory event,
    Emitter<StoryState> emit,
  ) async {
    try {
      // Emit loading state first
      emit(StoryLoading());

      // Generate new story
      await _storyRepository.generateNewStory(accessToken: event.accessToken);

      // Refresh stories to get the latest data
      final response = await _storyRepository.getMyStories(
        accessToken: event.accessToken,
        skip: 0,
        limit: 10,
      );

      final hasMore = response.stories.length < response.total;

      emit(
        StoryLoaded(
          stories: response.stories,
          total: response.total,
          currentSkip: 0,
          limit: 10,
          hasMore: hasMore,
          isLoadingMore: false,
        ),
      );
    } catch (e) {
      print('StoryBloc generate error: $e');
      emit(StoryError(e.toString().replaceAll('Exception: ', '')));
    }
  }
}
