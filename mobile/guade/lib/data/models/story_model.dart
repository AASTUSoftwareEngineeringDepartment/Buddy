import 'package:freezed_annotation/freezed_annotation.dart';

part 'story_model.freezed.dart';
part 'story_model.g.dart';

@freezed
class StoryModel with _$StoryModel {
  const factory StoryModel({
    @JsonKey(name: 'story_id') required String storyId,
    required String title,
    @JsonKey(name: 'story_body') required String storyBody,
    @JsonKey(name: 'image_url') String? imageUrl,
  }) = _StoryModel;

  factory StoryModel.fromJson(Map<String, dynamic> json) =>
      _$StoryModelFromJson(json);
}

@freezed
class StoriesResponse with _$StoriesResponse {
  const factory StoriesResponse({
    required List<StoryModel> stories,
    required int total,
    required int skip,
    required int limit,
  }) = _StoriesResponse;

  factory StoriesResponse.fromJson(Map<String, dynamic> json) =>
      _$StoriesResponseFromJson(json);
}
