abstract class StoryEvent {}

class FetchStories extends StoryEvent {
  final String? accessToken;
  final int skip;
  final int limit;
  final bool isRefresh;

  FetchStories({
    this.accessToken,
    this.skip = 0,
    this.limit = 10,
    this.isRefresh = false,
  });
}

class LoadMoreStories extends StoryEvent {
  final String? accessToken;

  LoadMoreStories({this.accessToken});
}

class RefreshStories extends StoryEvent {
  final String? accessToken;

  RefreshStories({this.accessToken});
}
