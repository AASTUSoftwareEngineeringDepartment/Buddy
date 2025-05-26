import 'package:freezed_annotation/freezed_annotation.dart';

part 'vocabulary_model.freezed.dart';
part 'vocabulary_model.g.dart';

@freezed
class VocabularyModel with _$VocabularyModel {
  const factory VocabularyModel({
    required String word,
    required String synonym,
    required String meaning,
    @JsonKey(name: 'related_words') required List<String> relatedWords,
    @JsonKey(name: 'story_title') required String storyTitle,
    @JsonKey(name: 'created_at') required String createdAt,
  }) = _VocabularyModel;

  factory VocabularyModel.fromJson(Map<String, dynamic> json) =>
      _$VocabularyModelFromJson(json);
}
