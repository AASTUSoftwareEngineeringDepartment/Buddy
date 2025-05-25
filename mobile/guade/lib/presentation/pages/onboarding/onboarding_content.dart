import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class OnboardingPageData {
  final String title;
  final String subtitle;
  final String imagePath;
  final Color color;

  const OnboardingPageData({
    required this.title,
    required this.subtitle,
    required this.imagePath,
    required this.color,
  });
}

class OnboardingContent {
  static const List<OnboardingPageData> pages = [
    OnboardingPageData(
      title: 'Welcome to Your Learning Adventure!',
      subtitle: 'Join our friendly mascot on an exciting journey of learning and discovery!',
      imagePath: 'assets/images/puppet.png',
      color: AppColors.accent1, // Bright orange
    ),
    OnboardingPageData(
      title: 'Learn Through Play',
      subtitle: 'Our mascot will guide you through fun activities and interactive games!',
      imagePath: 'assets/images/puppet.png',
      color: AppColors.accent2, // Bright blue
    ),
    OnboardingPageData(
      title: 'Track Your Progress',
      subtitle: 'Watch yourself grow with our mascot as you complete challenges!',
      imagePath: 'assets/images/puppet.png',
      color: AppColors.accent3, // Bright pink
    ),
  ];
} 