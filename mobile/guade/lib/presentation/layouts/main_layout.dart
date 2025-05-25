import 'package:flutter/material.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import '../../core/theme/app_colors.dart';
import '../pages/home/home_page.dart';
import '../pages/vocabulary/vocabulary_page.dart';
import '../pages/chat/chat_page.dart';
import '../pages/achievements/achievements_page.dart';
import '../pages/profile/profile_page.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;

  final List<Widget> _pages = [
    const HomePage(),
    const VocabularyPage(),
    const ChatPage(),
    const AchievementsPage(),
    const ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: _pages[_currentIndex],
      bottomNavigationBar: Container(
        margin: const EdgeInsets.only(bottom: 12, left: 24, right: 24),
        height: 70,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(40),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.10),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _CreativeNavBarItem(
              icon: PhosphorIcons.house,
              label: 'Home',
              selected: _currentIndex == 0,
              onTap: () => setState(() => _currentIndex = 0),
            ),
            _CreativeNavBarItem(
              icon: PhosphorIcons.bookOpen,
              label: 'Vocabulary',
              selected: _currentIndex == 1,
              onTap: () => setState(() => _currentIndex = 1),
            ),
            _CreativeNavBarItem(
              icon: PhosphorIcons.chatCircleDots,
              label: 'Chat',
              selected: _currentIndex == 2,
              onTap: () => setState(() => _currentIndex = 2),
            ),
            _CreativeNavBarItem(
              icon: PhosphorIcons.trophy,
              label: 'Achievements',
              selected: _currentIndex == 3,
              onTap: () => setState(() => _currentIndex = 3),
            ),
            _CreativeNavBarItem(
              icon: PhosphorIcons.user,
              label: 'Profile',
              selected: _currentIndex == 4,
              onTap: () => setState(() => _currentIndex = 4),
            ),
          ],
        ),
      ),
    );
  }
}

class _CreativeNavBarItem extends StatelessWidget {
  final PhosphorIconData Function([PhosphorIconsStyle]) icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _CreativeNavBarItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.ease,
        padding: selected
            ? const EdgeInsets.symmetric(horizontal: 18, vertical: 8)
            : const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
        decoration: selected
            ? BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(32),
              )
            : null,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            PhosphorIcon(
              icon(selected ? PhosphorIconsStyle.fill : PhosphorIconsStyle.regular),
              color: selected ? Colors.white : AppColors.textPrimary,
              size: 28,
            ),
            if (selected) ...[
              const SizedBox(width: 8),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 250),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
                child: Text(label),
              ),
            ],
          ],
        ),
      ),
    );
  }
} 