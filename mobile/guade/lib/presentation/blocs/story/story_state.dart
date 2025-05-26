import '../../../data/models/story_model.dart';

abstract class StoryState {}

class StoryInitial extends StoryState {}

class StoryLoading extends StoryState {}

class StoryLoaded extends StoryState {
  final List<StoryModel> stories;
  final int total;
  final int currentSkip;
  final int limit;
  final bool hasMore;
  final bool isLoadingMore;

  StoryLoaded({
    required this.stories,
    required this.total,
    required this.currentSkip,
    required this.limit,
    required this.hasMore,
    this.isLoadingMore = false,
  });

  StoryLoaded copyWith({
    List<StoryModel>? stories,
    int? total,
    int? currentSkip,
    int? limit,
    bool? hasMore,
    bool? isLoadingMore,
  }) {
    return StoryLoaded(
      stories: stories ?? this.stories,
      total: total ?? this.total,
      currentSkip: currentSkip ?? this.currentSkip,
      limit: limit ?? this.limit,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    );
  }
}

class StoryError extends StoryState {
  final String message;

  StoryError(this.message);
}
