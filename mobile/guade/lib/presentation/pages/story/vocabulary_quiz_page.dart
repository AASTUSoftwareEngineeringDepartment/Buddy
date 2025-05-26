import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:dio/dio.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../data/models/vocabulary_model.dart';
import '../../../data/repositories/vocabulary_repository.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_state.dart';

class VocabularyQuizPage extends StatefulWidget {
  final String storyId;
  final String storyTitle;

  const VocabularyQuizPage({
    super.key,
    required this.storyId,
    required this.storyTitle,
  });

  @override
  State<VocabularyQuizPage> createState() => _VocabularyQuizPageState();
}

class _VocabularyQuizPageState extends State<VocabularyQuizPage> {
  late final VocabularyRepository _vocabularyRepository;
  List<VocabularyModel> _vocabularies = [];
  bool _isLoading = true;
  int _currentQuestionIndex = 0;
  int _score = 0;
  bool _hasAnswered = false;
  String? _selectedAnswer;
  final Map<int, List<String>> _answerOptions = {};

  @override
  void initState() {
    super.initState();
    _vocabularyRepository = VocabularyRepository(Dio());
    _loadVocabularies();
  }

  Future<void> _loadVocabularies() async {
    try {
      final authState = context.read<AuthBloc>().state;
      String? accessToken;
      if (authState is AuthAuthenticated) {
        accessToken = authState.response.accessToken;
      }

      if (accessToken == null) {
        throw Exception('Not authenticated. Please login again.');
      }

      final vocabularies = await _vocabularyRepository.getVocabulariesByStoryId(
        widget.storyId,
        accessToken: accessToken,
      );

      // Remove duplicates based on word
      final uniqueVocabularies = vocabularies.fold<List<VocabularyModel>>([], (
        unique,
        vocabulary,
      ) {
        if (!unique.any((v) => v.word == vocabulary.word)) {
          unique.add(vocabulary);
        }
        return unique;
      });

      if (mounted) {
        setState(() {
          _vocabularies = uniqueVocabularies;
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading vocabularies: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error loading vocabularies: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _answerQuestion(String selectedAnswer) {
    if (_hasAnswered) return;

    final currentVocabulary = _vocabularies[_currentQuestionIndex];
    final isCorrect = selectedAnswer == currentVocabulary.synonym;

    setState(() {
      _selectedAnswer = selectedAnswer;
      _hasAnswered = true;
      if (isCorrect) {
        _score++;
      }
    });

    // Show feedback
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isCorrect
              ? 'Correct! Well done!'
              : 'Incorrect. The synonym is: ${currentVocabulary.synonym}',
        ),
        backgroundColor: isCorrect ? AppColors.accent1 : AppColors.error,
        duration: const Duration(seconds: 2),
      ),
    );

    // Move to next question after delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        if (_currentQuestionIndex < _vocabularies.length - 1) {
          setState(() {
            _currentQuestionIndex++;
            _hasAnswered = false;
            _selectedAnswer = null;
          });
        } else {
          _showResults();
        }
      }
    });
  }

  List<String> _getAnswerOptions(VocabularyModel vocabulary) {
    if (_answerOptions.containsKey(_currentQuestionIndex)) {
      return _answerOptions[_currentQuestionIndex]!;
    }

    final options = <String>{};

    // Add the correct answer (synonym)
    if (vocabulary.synonym != null) {
      options.add(vocabulary.synonym!);
    }

    // Add related words as other options
    if (vocabulary.relatedWords != null &&
        vocabulary.relatedWords!.isNotEmpty) {
      final shuffledRelatedWords = List<String>.from(vocabulary.relatedWords!)
        ..shuffle();

      // Add related words until we have 4 options total
      for (final word in shuffledRelatedWords) {
        if (options.length < 4) {
          options.add(word);
        } else {
          break;
        }
      }
    }

    // If we still don't have 4 options, add some generic options
    final genericOptions = ['similar', 'alike', 'matching', 'comparable'];
    while (options.length < 4) {
      final randomOption = genericOptions[options.length - 1];
      if (!options.contains(randomOption)) {
        options.add(randomOption);
      }
    }

    // Convert to list and shuffle
    final optionsList = options.toList()..shuffle();

    // Store the options for this question
    _answerOptions[_currentQuestionIndex] = optionsList;

    return optionsList;
  }

  void _showResults() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Icon(
              _score >= 3
                  ? PhosphorIcons.star(PhosphorIconsStyle.fill)
                  : PhosphorIcons.star(),
              color: _score >= 3 ? AppColors.accent1 : AppColors.textSecondary,
              size: 32,
            ),
            const SizedBox(width: 12),
            Text(
              'Great Job!',
              style: AppTextStyles.heading2.copyWith(color: AppColors.primary),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'You got $_score out of ${_vocabularies.length} correct!',
              style: AppTextStyles.body1,
            ),
            const SizedBox(height: 16),
            Text(
              _score >= 3
                  ? '🌟 Amazing! You\'re a vocabulary star! 🌟'
                  : 'Keep practicing! You\'re getting better! 💪',
              style: AppTextStyles.body2.copyWith(
                color: AppColors.accent2,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Navigator.of(context).pop(); // Return to story page
            },
            child: Text(
              'Back to Story',
              style: TextStyle(color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColors.primary.withOpacity(0.1),
                AppColors.primary.withOpacity(0.05),
                Colors.white,
              ],
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Loading vocabulary quiz...',
                  style: AppTextStyles.body1.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_vocabularies.isEmpty) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColors.primary.withOpacity(0.1),
                AppColors.primary.withOpacity(0.05),
                Colors.white,
              ],
            ),
          ),
          child: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.1),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Icon(
                        PhosphorIcons.bookOpen(),
                        size: 64,
                        color: AppColors.primary.withOpacity(0.7),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'No Vocabulary Quiz Available',
                      style: AppTextStyles.heading2.copyWith(
                        color: AppColors.primary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'This story doesn\'t have any vocabulary words to quiz you on yet.',
                      style: AppTextStyles.body1.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton.icon(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(PhosphorIcons.arrowLeft()),
                      label: const Text('Back to Story'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 16,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    final currentQuestion = _vocabularies[_currentQuestionIndex];

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.primary.withOpacity(0.1),
              AppColors.primary.withOpacity(0.05),
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        PhosphorIcons.arrowLeft(),
                        color: AppColors.primary,
                      ),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Vocabulary Quiz',
                            style: AppTextStyles.heading3.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                          Text(
                            widget.storyTitle,
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        '${_currentQuestionIndex + 1}/${_vocabularies.length}',
                        style: AppTextStyles.body2.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Progress Bar
              LinearProgressIndicator(
                value: (_currentQuestionIndex + 1) / _vocabularies.length,
                backgroundColor: AppColors.primary.withOpacity(0.1),
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                minHeight: 4,
              ),

              // Question Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Question Header
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              PhosphorIcons.question(PhosphorIconsStyle.fill),
                              color: AppColors.primary,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'What is the synonym for this word?',
                                style: AppTextStyles.body1.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Word Display
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppColors.primary,
                              AppColors.primary.withOpacity(0.8),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Text(
                          currentQuestion.word,
                          style: AppTextStyles.heading2.copyWith(
                            color: Colors.white,
                            fontSize: 36,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Answer Options
                      ...(_getAnswerOptions(currentQuestion))
                          .map(
                            (option) => Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: _buildAnswerButton(
                                option,
                                currentQuestion.synonym ?? '',
                              ),
                            ),
                          )
                          .toList(),

                      // Word Meaning Section
                      if (_hasAnswered) ...[
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: AppColors.primary.withOpacity(0.2),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    PhosphorIcons.lightbulb(
                                      PhosphorIconsStyle.fill,
                                    ),
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Word Meaning',
                                    style: AppTextStyles.body1.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                currentQuestion.meaning,
                                style: AppTextStyles.body2.copyWith(
                                  color: AppColors.textPrimary,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAnswerButton(String option, String correctAnswer) {
    final isSelected = _selectedAnswer == option;
    final isCorrect = option == correctAnswer;
    Color backgroundColor = Colors.white;
    Color borderColor = AppColors.primary.withOpacity(0.3);
    Color textColor = AppColors.textPrimary;

    if (_hasAnswered) {
      if (isSelected) {
        backgroundColor = isCorrect
            ? Colors.green.withOpacity(0.2)
            : Colors.red.withOpacity(0.2);
        borderColor = isCorrect ? Colors.green : Colors.red;
        textColor = isCorrect ? Colors.green : Colors.red;
      } else if (isCorrect) {
        backgroundColor = Colors.green.withOpacity(0.2);
        borderColor = Colors.green;
        textColor = Colors.green;
      }
    }

    return ElevatedButton(
      onPressed: _hasAnswered ? null : () => _answerQuestion(option),
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor,
        foregroundColor: textColor,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: borderColor),
        ),
        elevation: 0,
      ),
      child: Row(
        children: [
          if (_hasAnswered && isSelected)
            Icon(
              isCorrect
                  ? PhosphorIcons.checkCircle(PhosphorIconsStyle.fill)
                  : PhosphorIcons.xCircle(PhosphorIconsStyle.fill),
              color: isCorrect ? Colors.green : Colors.red,
            ),
          if (_hasAnswered && isSelected) const SizedBox(width: 12),
          Expanded(
            child: Text(
              option,
              style: AppTextStyles.body1.copyWith(
                color: textColor,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
