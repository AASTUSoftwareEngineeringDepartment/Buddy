import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../data/repositories/vocabulary_repository.dart';
import 'vocabulary_event.dart';
import 'vocabulary_state.dart';

class VocabularyBloc extends Bloc<VocabularyEvent, VocabularyState> {
  final VocabularyRepository _vocabularyRepository;

  VocabularyBloc(this._vocabularyRepository) : super(VocabularyInitial()) {
    on<FetchVocabulary>(_onFetchVocabulary);
  }

  Future<void> _onFetchVocabulary(
    FetchVocabulary event,
    Emitter<VocabularyState> emit,
  ) async {
    try {
      emit(VocabularyLoading());
      final vocabularies = await _vocabularyRepository.getMyVocabulary(
        accessToken: event.accessToken,
      );
      emit(VocabularyLoaded(vocabularies));
    } catch (e) {
      print('VocabularyBloc error: $e');
      emit(VocabularyError(e.toString().replaceAll('Exception: ', '')));
    }
  }
}
