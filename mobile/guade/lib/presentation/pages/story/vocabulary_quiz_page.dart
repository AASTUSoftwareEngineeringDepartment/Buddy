import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class VocabularyQuizPage extends StatefulWidget {
  final List<Map<String, dynamic>> questions;
  final String storyTitle;

  const VocabularyQuizPage({
    super.key,
    required this.questions,
    required this.storyTitle,
  });

  @override
  State<VocabularyQuizPage> createState() => _VocabularyQuizPageState();
}

class _VocabularyQuizPageState extends State<VocabularyQuizPage> {
  int _currentQuestionIndex = 0;
  int _score = 0;
  bool _hasAnswered = false;
  String? _selectedAnswer;

  void _answerQuestion(String selectedAnswer) {
    if (_hasAnswered) return;

    setState(() {
      _selectedAnswer = selectedAnswer;
      _hasAnswered = true;
      if (selectedAnswer ==
          widget.questions[_currentQuestionIndex]['correctAnswer']) {
        _score++;
      }
    });

    // Show feedback and move to next question after a delay
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        if (_currentQuestionIndex < widget.questions.length - 1) {
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
              color: _score >= 3 ? Colors.amber : Colors.grey,
              size: 32,
            ),
            const SizedBox(width: 12),
            Text(
              'Great Job!',
              style: AppTextStyles.heading2.copyWith(color: AppColors.accent1),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'You got $_score out of ${widget.questions.length} correct!',
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
              style: TextStyle(color: AppColors.accent1),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentQuestion = widget.questions[_currentQuestionIndex];

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.accent2.withOpacity(0.1),
              AppColors.accent2.withOpacity(0.05),
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
                      color: AppColors.accent2.withOpacity(0.1),
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
                        color: AppColors.accent2,
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
                              color: AppColors.accent2,
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
                        color: AppColors.accent2.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        '${_currentQuestionIndex + 1}/${widget.questions.length}',
                        style: AppTextStyles.body2.copyWith(
                          color: AppColors.accent2,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Progress Bar
              LinearProgressIndicator(
                value: (_currentQuestionIndex + 1) / widget.questions.length,
                backgroundColor: AppColors.accent2.withOpacity(0.1),
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.accent2),
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
                          color: AppColors.accent2.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              PhosphorIcons.question(PhosphorIconsStyle.fill),
                              color: AppColors.accent2,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                'What does this word mean?',
                                style: AppTextStyles.body1.copyWith(
                                  color: AppColors.accent2,
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
                              AppColors.accent2,
                              AppColors.accent2.withOpacity(0.8),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.accent2.withOpacity(0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: Text(
                          currentQuestion['word'],
                          style: AppTextStyles.heading2.copyWith(
                            color: Colors.white,
                            fontSize: 36,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Answer Options
                      ...(currentQuestion['options'] as List<String>).map(
                        (option) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: _buildAnswerButton(
                            option,
                            currentQuestion['correctAnswer'],
                          ),
                        ),
                      ),
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
    Color borderColor = AppColors.accent2.withOpacity(0.3);
    Color textColor = AppColors.textPrimary;

    if (_hasAnswered) {
      if (isSelected) {
        backgroundColor = isCorrect
            ? AppColors.accent1.withOpacity(0.2)
            : AppColors.error.withOpacity(0.2);
        borderColor = isCorrect ? AppColors.accent1 : AppColors.error;
        textColor = isCorrect ? AppColors.accent1 : AppColors.error;
      } else if (isCorrect) {
        backgroundColor = AppColors.accent1.withOpacity(0.2);
        borderColor = AppColors.accent1;
        textColor = AppColors.accent1;
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
              color: isCorrect ? AppColors.accent1 : AppColors.error,
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
