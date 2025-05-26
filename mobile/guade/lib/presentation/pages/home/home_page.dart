import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_state.dart';
import '../../blocs/reward/reward_bloc.dart';
import '../../blocs/reward/reward_state.dart';
import '../../blocs/reward/reward_event.dart';
import '../vocabulary/vocabulary_page.dart';
import '../story/story_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  late AnimationController _mascotController;
  late AnimationController _cardController;
  late AnimationController _floatingController;
  late AnimationController _sparkleController;
  late Animation<double> _mascotAnimation;
  late Animation<double> _cardAnimation;
  late Animation<double> _floatingAnimation;
  late Animation<double> _sparkleAnimation;

  @override
  void initState() {
    super.initState();

    // Initialize animations
    _mascotController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );

    _cardController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _floatingController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    );

    _sparkleController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _mascotAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _mascotController, curve: Curves.elasticOut),
    );

    _cardAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _cardController, curve: Curves.easeOutBack),
    );

    _floatingAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _floatingController, curve: Curves.easeInOut),
    );

    _sparkleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _sparkleController, curve: Curves.easeInOut),
    );

    // Start animations safely
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _mascotController.forward();
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) {
            _cardController.forward();
          }
        });

        // Repeating animations
        if (mounted) {
          _floatingController.repeat(reverse: true);
          _sparkleController.repeat();
        }
      }
    });

    // Fetch reward data
    _fetchRewardData();
  }

  void _fetchRewardData() {
    final authState = context.read<AuthBloc>().state;
    if (authState is AuthAuthenticated) {
      context.read<RewardBloc>().add(
        FetchCurrentReward(accessToken: authState.response.accessToken),
      );
    }
  }

  @override
  void dispose() {
    _mascotController.dispose();
    _cardController.dispose();
    _floatingController.dispose();
    _sparkleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary.withOpacity(0.1),
              AppColors.accent1.withOpacity(0.05),
              AppColors.accent2.withOpacity(0.03),
              Colors.white,
            ],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              // Floating background elements
              _buildFloatingElements(),

              // Main content
              SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header with mascot and greeting
                      _buildHeader(),
                      const SizedBox(height: 24),

                      // Daily challenge section
                      _buildDailyChallenge(),
                      const SizedBox(height: 24),

                      // Learning menu cards
                      _buildLearningMenu(),
                      const SizedBox(height: 24),

                      // Fun facts section
                      _buildFunFacts(),
                      const SizedBox(height: 24),

                      // Progress section
                      _buildProgressSection(),
                      const SizedBox(height: 24),

                      // Achievement badges
                      _buildAchievementBadges(),
                      const SizedBox(height: 24),

                      // Quick actions
                      _buildQuickActions(),
                      const SizedBox(height: 20),
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

  Widget _buildFloatingElements() {
    return AnimatedBuilder(
      animation: _floatingAnimation,
      builder: (context, child) {
        return Stack(
          children: [
            // Floating stars
            Positioned(
              top: 100 + (20 * _floatingAnimation.value),
              right: 50,
              child: _buildFloatingIcon('⭐', 0.8),
            ),
            Positioned(
              top: 200 + (15 * (1 - _floatingAnimation.value)),
              left: 30,
              child: _buildFloatingIcon('🌟', 0.6),
            ),
            Positioned(
              top: 350 + (25 * _floatingAnimation.value),
              right: 80,
              child: _buildFloatingIcon('✨', 0.7),
            ),
            Positioned(
              top: 500 + (18 * (1 - _floatingAnimation.value)),
              left: 60,
              child: _buildFloatingIcon('🎈', 0.9),
            ),
            Positioned(
              top: 650 + (22 * _floatingAnimation.value),
              right: 40,
              child: _buildFloatingIcon('🌈', 0.5),
            ),
            // Floating clouds
            Positioned(
              top: 80 + (10 * _floatingAnimation.value),
              left: 20,
              child: _buildFloatingIcon('☁️', 0.4),
            ),
            Positioned(
              top: 300 + (12 * (1 - _floatingAnimation.value)),
              right: 20,
              child: _buildFloatingIcon('☁️', 0.3),
            ),
          ],
        );
      },
    );
  }

  Widget _buildFloatingIcon(String emoji, double opacity) {
    return AnimatedBuilder(
      animation: _sparkleAnimation,
      builder: (context, child) {
        // Ensure opacity is always between 0.0 and 1.0
        final clampedOpacity = opacity.clamp(0.0, 1.0);
        final animatedOpacity =
            (clampedOpacity * (0.5 + 0.5 * _sparkleAnimation.value)).clamp(
              0.0,
              1.0,
            );

        return Transform.scale(
          scale: 0.8 + (0.2 * _sparkleAnimation.value),
          child: Opacity(
            opacity: animatedOpacity,
            child: Text(
              emoji,
              style: TextStyle(fontSize: 24 + (4 * _sparkleAnimation.value)),
            ),
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return AnimatedBuilder(
      animation: _mascotAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _mascotAnimation.value,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.9),
                  Colors.white.withOpacity(0.7),
                ],
              ),
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: Colors.white.withOpacity(0.5),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.1),
                  blurRadius: 30,
                  offset: const Offset(0, 15),
                ),
                BoxShadow(
                  color: Colors.white.withOpacity(0.8),
                  blurRadius: 15,
                  offset: const Offset(-10, -10),
                ),
              ],
            ),
            child: Row(
              children: [
                // Animated mascot with floating effect
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Glow effect
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            AppColors.accent1.withOpacity(0.3),
                            AppColors.accent1.withOpacity(0.1),
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                    // Mascot container with floating animation
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0.0, end: 1.0),
                      duration: const Duration(seconds: 2),
                      builder: (context, value, child) {
                        return Transform.translate(
                          offset: Offset(
                            0,
                            -5 * (0.5 - (value % 1 - 0.5).abs()),
                          ),
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  AppColors.primary.withOpacity(0.15),
                                  AppColors.primary.withOpacity(0.05),
                                ],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.2),
                                  blurRadius: 25,
                                  offset: const Offset(0, 10),
                                ),
                              ],
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Image.asset(
                                'assets/images/puppet.png',
                                fit: BoxFit.contain,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                    // Level badge
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: BlocBuilder<RewardBloc, RewardState>(
                        builder: (context, state) {
                          final level = state is RewardLoaded
                              ? state.reward.level
                              : 1;
                          return Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.accent1,
                                  AppColors.accent1.withOpacity(0.8),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.accent1.withOpacity(0.4),
                                  blurRadius: 10,
                                  offset: const Offset(0, 5),
                                ),
                              ],
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  PhosphorIcons.crown(PhosphorIconsStyle.fill),
                                  size: 14,
                                  color: Colors.white,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'LV $level',
                                  style: AppTextStyles.caption.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 24),

                // Greeting text
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _getGreeting(),
                        style: AppTextStyles.heading2.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w800,
                          fontSize: 28,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              AppColors.secondary.withOpacity(0.15),
                              AppColors.secondary.withOpacity(0.08),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: AppColors.secondary.withOpacity(0.3),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              PhosphorIcons.sparkle(PhosphorIconsStyle.fill),
                              size: 16,
                              color: AppColors.secondary,
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                'Ready for an adventure?',
                                style: AppTextStyles.body2.copyWith(
                                  color: AppColors.secondary,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLearningMenu() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8, bottom: 20),
          child: Text(
            'Choose Your Adventure! 🚀',
            style: AppTextStyles.heading2.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w700,
              fontSize: 24,
            ),
          ),
        ),
        AnimatedBuilder(
          animation: _cardAnimation,
          builder: (context, child) {
            return Column(
              children: [
                // Science Card
                Transform.translate(
                  offset: Offset(0, 50 * (1 - _cardAnimation.value)),
                  child: Opacity(
                    opacity: _cardAnimation.value,
                    child: _buildMenuCard(
                      title: 'Science Lab',
                      subtitle: 'Discover amazing experiments!',
                      icon: PhosphorIcons.flask(PhosphorIconsStyle.fill),
                      gradient: [
                        AppColors.primary,
                        AppColors.primary.withOpacity(0.8),
                      ],
                      emoji: '🧪',
                      onTap: () {
                        // Navigate to Science section
                        _showComingSoon(context, 'Science Lab');
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // English Card
                Transform.translate(
                  offset: Offset(0, 50 * (1 - _cardAnimation.value)),
                  child: Opacity(
                    opacity: (_cardAnimation.value * 0.9).clamp(0.0, 1.0),
                    child: _buildMenuCard(
                      title: 'English World',
                      subtitle: 'Build your vocabulary!',
                      icon: PhosphorIcons.book(PhosphorIconsStyle.fill),
                      gradient: [
                        AppColors.secondary,
                        AppColors.secondary.withOpacity(0.8),
                      ],
                      emoji: '📚',
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => const VocabularyPage(),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Stories Card
                Transform.translate(
                  offset: Offset(0, 50 * (1 - _cardAnimation.value)),
                  child: Opacity(
                    opacity: (_cardAnimation.value * 0.8).clamp(0.0, 1.0),
                    child: _buildMenuCard(
                      title: 'Story Time',
                      subtitle: 'Read magical adventures!',
                      icon: PhosphorIcons.bookOpen(PhosphorIconsStyle.fill),
                      gradient: [
                        AppColors.accent3,
                        AppColors.accent3.withOpacity(0.8),
                      ],
                      emoji: '📖',
                      onTap: () {
                        // Navigate to Stories section
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => const StoryPage(),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildMenuCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradient,
    required String emoji,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withOpacity(0.9),
                Colors.white.withOpacity(0.7),
              ],
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.5), width: 2),
            boxShadow: [
              BoxShadow(
                color: gradient[0].withOpacity(0.15),
                blurRadius: 25,
                offset: const Offset(0, 12),
              ),
              BoxShadow(
                color: Colors.white.withOpacity(0.8),
                blurRadius: 15,
                offset: const Offset(-8, -8),
              ),
            ],
          ),
          child: Row(
            children: [
              // Icon container with gradient
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: gradient,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: gradient[0].withOpacity(0.4),
                      blurRadius: 15,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Icon(icon, size: 32, color: Colors.white),
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Text(emoji, style: const TextStyle(fontSize: 20)),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 20),

              // Text content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.heading3.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w700,
                        fontSize: 20,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      subtitle,
                      style: AppTextStyles.body2.copyWith(
                        color: AppColors.textSecondary,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),

              // Arrow indicator
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: gradient[0].withOpacity(0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: gradient[0].withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Icon(
                  PhosphorIcons.arrowRight(),
                  size: 20,
                  color: gradient[0],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressSection() {
    return BlocBuilder<RewardBloc, RewardState>(
      builder: (context, state) {
        if (state is RewardLoaded) {
          final reward = state.reward;
          final xpPerLevel = 10;
          final currentLevelXP = reward.xp % xpPerLevel;
          final progressPercent = (currentLevelXP / xpPerLevel * 100).round();

          return Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.9),
                  Colors.white.withOpacity(0.7),
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Colors.white.withOpacity(0.5),
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.accent2.withOpacity(0.1),
                  blurRadius: 25,
                  offset: const Offset(0, 12),
                ),
                BoxShadow(
                  color: Colors.white.withOpacity(0.8),
                  blurRadius: 15,
                  offset: const Offset(-8, -8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.accent2,
                            AppColors.accent2.withOpacity(0.8),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.accent2.withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Icon(
                        PhosphorIcons.trophy(PhosphorIconsStyle.fill),
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Your Progress 🎯',
                            style: AppTextStyles.heading3.copyWith(
                              color: AppColors.textPrimary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            'Level ${reward.level} • $progressPercent% to next level',
                            style: AppTextStyles.body2.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Progress bar
                Container(
                  height: 12,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    color: AppColors.accent2.withOpacity(0.1),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: progressPercent / 100,
                      backgroundColor: Colors.transparent,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.accent2,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Stats row
                Row(
                  children: [
                    _buildStatChip(
                      '${reward.xp} XP',
                      PhosphorIcons.star(PhosphorIconsStyle.fill),
                      AppColors.accent1,
                    ),
                    const SizedBox(width: 12),
                    _buildStatChip(
                      'Level ${reward.level}',
                      PhosphorIcons.crown(PhosphorIconsStyle.fill),
                      AppColors.accent3,
                    ),
                  ],
                ),
              ],
            ),
          );
        }
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildStatChip(String text, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            text,
            style: AppTextStyles.body2.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8, bottom: 16),
          child: Text(
            'Quick Actions ⚡',
            style: AppTextStyles.heading3.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w700,
              fontSize: 18,
            ),
          ),
        ),
        Row(
          children: [
            Expanded(
              child: _buildQuickActionCard(
                'My Words',
                PhosphorIcons.bookmarks(PhosphorIconsStyle.fill),
                AppColors.accent1,
                () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (context) => const VocabularyPage(),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildQuickActionCard(
                'Achievements',
                PhosphorIcons.medal(PhosphorIconsStyle.fill),
                AppColors.accent3,
                () => _showComingSoon(context, 'Achievements'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white.withOpacity(0.9),
                Colors.white.withOpacity(0.7),
              ],
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: Colors.white.withOpacity(0.5),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
              BoxShadow(
                color: Colors.white.withOpacity(0.8),
                blurRadius: 10,
                offset: const Offset(-5, -5),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [color, color.withOpacity(0.8)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: color.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 28),
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: AppTextStyles.body1.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Good Morning! ☀️';
    } else if (hour < 17) {
      return 'Good Afternoon! 🌤️';
    } else {
      return 'Good Evening! 🌙';
    }
  }

  void _showComingSoon(BuildContext context, String feature) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Icon(
              PhosphorIcons.rocket(PhosphorIconsStyle.fill),
              color: AppColors.primary,
            ),
            const SizedBox(width: 8),
            const Text('Coming Soon!'),
          ],
        ),
        content: Text(
          '$feature is under development and will be available soon! 🚀',
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Got it!', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildDailyChallenge() {
    return AnimatedBuilder(
      animation: _cardAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 30 * (1 - _cardAnimation.value)),
          child: Opacity(
            opacity: _cardAnimation.value.clamp(0.0, 1.0),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.accent1.withOpacity(0.15),
                    AppColors.accent2.withOpacity(0.1),
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: AppColors.accent1.withOpacity(0.3),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accent1.withOpacity(0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Animated trophy icon
                  AnimatedBuilder(
                    animation: _sparkleAnimation,
                    builder: (context, child) {
                      return Transform.rotate(
                        angle: 0.1 * _sparkleAnimation.value,
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                AppColors.accent1,
                                AppColors.accent1.withOpacity(0.8),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.accent1.withOpacity(0.4),
                                blurRadius: 15,
                                offset: const Offset(0, 5),
                              ),
                            ],
                          ),
                          child: Text(
                            '🏆',
                            style: TextStyle(
                              fontSize: 32 + (4 * _sparkleAnimation.value),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Daily Challenge! 🎯',
                          style: AppTextStyles.heading3.copyWith(
                            color: AppColors.accent1,
                            fontWeight: FontWeight.w800,
                            fontSize: 18,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Learn 3 new words today!',
                          style: AppTextStyles.body2.copyWith(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 8),
                        // Progress bar for daily challenge
                        Container(
                          height: 8,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(4),
                            color: Colors.white.withOpacity(0.3),
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: 0.6, // 60% progress
                              backgroundColor: Colors.transparent,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppColors.accent1,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '2/3 words learned today! 🌟',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.accent1,
                            fontWeight: FontWeight.w600,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildFunFacts() {
    final funFacts = [
      {'emoji': '🦋', 'fact': 'Butterflies taste with their feet!'},
      {'emoji': '🐙', 'fact': 'Octopuses have three hearts!'},
      {'emoji': '🌙', 'fact': 'The moon is moving away from Earth!'},
      {'emoji': '🦒', 'fact': 'Giraffes only sleep 2 hours a day!'},
    ];

    final randomFact = funFacts[DateTime.now().day % funFacts.length];

    return AnimatedBuilder(
      animation: _cardAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 40 * (1 - _cardAnimation.value)),
          child: Opacity(
            opacity: (_cardAnimation.value * 0.9).clamp(0.0, 1.0),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.accent3.withOpacity(0.15),
                    AppColors.accent3.withOpacity(0.08),
                  ],
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.accent3.withOpacity(0.3),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.accent3.withOpacity(0.1),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  AnimatedBuilder(
                    animation: _sparkleAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: 1.0 + (0.1 * _sparkleAnimation.value),
                        child: Text(
                          randomFact['emoji']!,
                          style: const TextStyle(fontSize: 40),
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Fun Fact of the Day! 🤓',
                          style: AppTextStyles.body1.copyWith(
                            color: AppColors.accent3,
                            fontWeight: FontWeight.w700,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          randomFact['fact']!,
                          style: AppTextStyles.body2.copyWith(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAchievementBadges() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 8, bottom: 16),
          child: Row(
            children: [
              Text(
                'Your Achievements ',
                style: AppTextStyles.heading3.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                  fontSize: 18,
                ),
              ),
              AnimatedBuilder(
                animation: _sparkleAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: 1.0 + (0.2 * _sparkleAnimation.value),
                    child: const Text('🏅', style: TextStyle(fontSize: 20)),
                  );
                },
              ),
            ],
          ),
        ),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              _buildAchievementBadge(
                '🌟',
                'First Word',
                'Learned your first vocabulary word!',
                true,
                AppColors.accent1,
              ),
              const SizedBox(width: 12),
              _buildAchievementBadge(
                '📚',
                'Bookworm',
                'Read 5 stories',
                true,
                AppColors.secondary,
              ),
              const SizedBox(width: 12),
              _buildAchievementBadge(
                '🔥',
                'Streak Master',
                'Learn for 7 days straight',
                false,
                AppColors.accent3,
              ),
              const SizedBox(width: 12),
              _buildAchievementBadge(
                '🎯',
                'Challenge Champion',
                'Complete 10 daily challenges',
                false,
                AppColors.primary,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAchievementBadge(
    String emoji,
    String title,
    String description,
    bool isUnlocked,
    Color color,
  ) {
    return AnimatedBuilder(
      animation: _cardAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - _cardAnimation.value)),
          child: Opacity(
            opacity: _cardAnimation.value,
            child: Container(
              width: 140,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: isUnlocked
                      ? [
                          Colors.white.withOpacity(0.9),
                          Colors.white.withOpacity(0.7),
                        ]
                      : [
                          Colors.grey.withOpacity(0.3),
                          Colors.grey.withOpacity(0.2),
                        ],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isUnlocked
                      ? color.withOpacity(0.3)
                      : Colors.grey.withOpacity(0.3),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isUnlocked
                        ? color.withOpacity(0.1)
                        : Colors.grey.withOpacity(0.1),
                    blurRadius: 15,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                children: [
                  // Badge icon
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: isUnlocked
                          ? LinearGradient(
                              colors: [color, color.withOpacity(0.8)],
                            )
                          : LinearGradient(
                              colors: [
                                Colors.grey.withOpacity(0.5),
                                Colors.grey.withOpacity(0.3),
                              ],
                            ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: isUnlocked
                          ? [
                              BoxShadow(
                                color: color.withOpacity(0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ]
                          : null,
                    ),
                    child: Text(
                      emoji,
                      style: TextStyle(
                        fontSize: 24,
                        color: isUnlocked ? null : Colors.grey,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    style: AppTextStyles.body2.copyWith(
                      color: isUnlocked ? AppColors.textPrimary : Colors.grey,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: AppTextStyles.caption.copyWith(
                      color: isUnlocked
                          ? AppColors.textSecondary
                          : Colors.grey.withOpacity(0.7),
                      fontSize: 10,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (isUnlocked) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'UNLOCKED',
                        style: AppTextStyles.caption.copyWith(
                          color: color,
                          fontWeight: FontWeight.bold,
                          fontSize: 9,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
