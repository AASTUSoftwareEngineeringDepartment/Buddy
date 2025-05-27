import 'package:equatable/equatable.dart';

abstract class StoryEvent extends Equatable {
  const StoryEvent();

  @override
  List<Object?> get props => [];
}

class FetchStories extends StoryEvent {
  final String? accessToken;
  final int skip;
  final int limit;
  final bool isRefresh;

  const FetchStories({
    this.accessToken,
    this.skip = 0,
    this.limit = 10,
    this.isRefresh = false,
  });

  @override
  List<Object?> get props => [accessToken, skip, limit, isRefresh];
}

class LoadMoreStories extends StoryEvent {
  final String? accessToken;

  const LoadMoreStories({this.accessToken});

  @override
  List<Object?> get props => [accessToken];
}

class RefreshStories extends StoryEvent {
  final String? accessToken;

  const RefreshStories({this.accessToken});

  @override
  List<Object?> get props => [accessToken];
}

class GenerateNewStory extends StoryEvent {
  final String accessToken;

  const GenerateNewStory({required this.accessToken});

  @override
  List<Object?> get props => [accessToken];
}
