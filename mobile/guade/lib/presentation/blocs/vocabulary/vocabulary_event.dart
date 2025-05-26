abstract class VocabularyEvent {}

class FetchVocabulary extends VocabularyEvent {
  final String? accessToken;

  FetchVocabulary({this.accessToken});
}
