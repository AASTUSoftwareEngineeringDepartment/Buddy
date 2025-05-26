import '../../../data/models/vocabulary_model.dart';

abstract class VocabularyState {}

class VocabularyInitial extends VocabularyState {}

class VocabularyLoading extends VocabularyState {}

class VocabularyLoaded extends VocabularyState {
  final List<VocabularyModel> vocabularies;

  VocabularyLoaded(this.vocabularies);
}

class VocabularyError extends VocabularyState {
  final String message;

  VocabularyError(this.message);
}
