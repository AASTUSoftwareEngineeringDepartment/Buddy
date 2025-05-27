import 'package:equatable/equatable.dart';
import '../../../data/models/story_model.dart';

abstract class StoryState extends Equatable {
  const StoryState();

  @override
  List<Object?> get props => [];
}

class StoryInitial extends StoryState {
  const StoryInitial();
}

class StoryLoading extends StoryState {
  const StoryLoading();
}

class StoryLoaded extends StoryState {
  final List<StoryModel> stories;
  final int total;
  final int currentSkip;
  final int limit;
  final bool hasMore;
  final bool isLoadingMore;

  const StoryLoaded({
    required this.stories,
    required this.total,
    required this.currentSkip,
    required this.limit,
    required this.hasMore,
    this.isLoadingMore = false,
  });

  @override
  List<Object?> get props => [
    stories,
    total,
    currentSkip,
    limit,
    hasMore,
    isLoadingMore,
  ];

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

  const StoryError(this.message);

  @override
  List<Object?> get props => [message];
}
