import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_state.dart';
import '../../blocs/question/question_bloc.dart';
import '../../blocs/question/question_event.dart';
import '../../blocs/question/question_state.dart';
import '../../../data/repositories/question_repository.dart';
import 'package:dio/dio.dart';

extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1)}";
  }
}

class QuestionPage extends StatelessWidget {
  final String topic;
  final String childId;

  const QuestionPage({super.key, required this.topic, required this.childId});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, authState) {
        String? accessToken;
        if (authState is AuthAuthenticated) {
          accessToken = authState.response.accessToken;
        }
        if (accessToken == null) {
          return const Scaffold(body: Center(child: Text('Not authenticated')));
        }
        return BlocProvider(
          create: (context) => QuestionBloc(QuestionRepository(Dio()))
            ..add(
              GenerateQuestions(
                topic: topic,
                childId: childId,
                accessToken: accessToken,
              ),
            ),
          child: Scaffold(
            backgroundColor: AppColors.background,
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
                                  '${topic.capitalize()} Quiz',
                                  style: AppTextStyles.heading3.copyWith(
                                    color: AppColors.primary,
                                  ),
                                ),
                                Text(
                                  'Test your knowledge',
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(child: const _QuestionView()),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _QuestionView extends StatelessWidget {
  const _QuestionView();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<QuestionBloc, QuestionState>(
      builder: (context, state) {
        if (state is QuestionInitial || state is QuestionLoading) {
          return Center(
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
                  'Loading questions...',
                  style: AppTextStyles.body1.copyWith(
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        }

        if (state is QuestionError) {
          return Center(
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
                    PhosphorIcons.warning(),
                    size: 64,
                    color: AppColors.error.withOpacity(0.7),
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  state.message,
                  style: AppTextStyles.body1.copyWith(
                    color: AppColors.textPrimary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: ElevatedButton(
                    onPressed: () {
                      context.read<QuestionBloc>().add(
                        GenerateQuestions(
                          topic:
                              context.read<QuestionBloc>().state
                                  is QuestionLoaded
                              ? (context.read<QuestionBloc>().state
                                        as QuestionLoaded)
                                    .questionResponse
                                    .questions
                                    .first
                                    .topic
                              : 'english',
                          childId:
                              context.read<QuestionBloc>().state
                                  is QuestionLoaded
                              ? (context.read<QuestionBloc>().state
                                        as QuestionLoaded)
                                    .questionResponse
                                    .questions
                                    .first
                                    .childId
                              : '',
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.textLight,
                      minimumSize: const Size(double.infinity, 56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: Text(
                      'Try Again',
                      style: AppTextStyles.body1.copyWith(
                        color: AppColors.textLight,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        }

        if (state is QuestionLoaded) {
          final questions = state.questionResponse.questions;
          if (questions.isEmpty) {
            return Center(
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
                      PhosphorIcons.info(),
                      size: 64,
                      color: AppColors.primary.withOpacity(0.7),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'No questions available',
                    style: AppTextStyles.heading2.copyWith(
                      color: AppColors.primary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'There are no questions available for this topic yet.',
                    style: AppTextStyles.body1.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }

          return Column(
            children: [
              // Progress Bar
              LinearProgressIndicator(
                value: 1 / questions.length,
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
                                'Question 1',
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

                      // Question Display
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
                          questions.first.question,
                          style: AppTextStyles.heading2.copyWith(
                            color: Colors.white,
                            fontSize: 24,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Answer Options
                      ...questions.first.options.asMap().entries.map((entry) {
                        final optionIndex = entry.key;
                        final option = entry.value;
                        final isSelected =
                            state.userAnswers[questions.first.questionId] ==
                            optionIndex;
                        final isAnswered =
                            state.userAnswers[questions.first.questionId] !=
                            null;

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: ElevatedButton(
                            onPressed: isAnswered
                                ? null
                                : () {
                                    context.read<QuestionBloc>().add(
                                      AnswerQuestion(
                                        questionId: questions.first.questionId,
                                        selectedOptionIndex: optionIndex,
                                      ),
                                    );
                                  },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isAnswered
                                  ? optionIndex ==
                                            questions.first.correctOptionIndex
                                        ? AppColors.success.withOpacity(0.1)
                                        : isSelected
                                        ? AppColors.error.withOpacity(0.1)
                                        : Colors.white
                                  : isSelected
                                  ? AppColors.primary.withOpacity(0.1)
                                  : Colors.white,
                              foregroundColor: isAnswered
                                  ? optionIndex ==
                                            questions.first.correctOptionIndex
                                        ? AppColors.success
                                        : isSelected
                                        ? AppColors.error
                                        : AppColors.textPrimary
                                  : AppColors.textPrimary,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 16,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(
                                  color: isAnswered
                                      ? optionIndex ==
                                                questions
                                                    .first
                                                    .correctOptionIndex
                                            ? AppColors.success
                                            : isSelected
                                            ? AppColors.error
                                            : AppColors.border
                                      : isSelected
                                      ? AppColors.primary
                                      : AppColors.border,
                                  width: 1,
                                ),
                              ),
                              elevation: 0,
                            ),
                            child: Row(
                              children: [
                                if (isAnswered && isSelected)
                                  Icon(
                                    optionIndex ==
                                            questions.first.correctOptionIndex
                                        ? PhosphorIcons.checkCircle(
                                            PhosphorIconsStyle.fill,
                                          )
                                        : PhosphorIcons.xCircle(
                                            PhosphorIconsStyle.fill,
                                          ),
                                    color:
                                        optionIndex ==
                                            questions.first.correctOptionIndex
                                        ? AppColors.success
                                        : AppColors.error,
                                  ),
                                if (isAnswered && isSelected)
                                  const SizedBox(width: 12),
                                Expanded(
                                  child: Text(
                                    option,
                                    style: AppTextStyles.body1.copyWith(
                                      color: isAnswered
                                          ? optionIndex ==
                                                    questions
                                                        .first
                                                        .correctOptionIndex
                                                ? AppColors.success
                                                : isSelected
                                                ? AppColors.error
                                                : AppColors.textPrimary
                                          : AppColors.textPrimary,
                                      fontWeight: isSelected
                                          ? FontWeight.bold
                                          : FontWeight.normal,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),

                      if (state.userAnswers[questions.first.questionId] !=
                          null) ...[
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
                                    'Explanation',
                                    style: AppTextStyles.body1.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                questions.first.explanation,
                                style: AppTextStyles.body2.copyWith(
                                  color: AppColors.textPrimary,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: ElevatedButton(
                            onPressed: () {
                              final authState = context.read<AuthBloc>().state;
                              if (authState is AuthAuthenticated) {
                                context.read<QuestionBloc>().add(
                                  GenerateQuestions(
                                    topic: questions.first.topic,
                                    childId: questions.first.childId,
                                    accessToken: authState.response.accessToken,
                                  ),
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: AppColors.textLight,
                              minimumSize: const Size(double.infinity, 56),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Next Question',
                                  style: AppTextStyles.body1.copyWith(
                                    color: AppColors.textLight,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Icon(
                                  PhosphorIcons.arrowRight(),
                                  color: AppColors.textLight,
                                  size: 24,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          );
        }

        return const SizedBox.shrink();
      },
    );
  }
}
