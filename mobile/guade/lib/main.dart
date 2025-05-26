import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/theme/app_theme.dart';
import 'data/datasources/counter_local_datasource.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/counter_repository_impl.dart';
import 'data/repositories/reward_repository.dart';
import 'data/repositories/vocabulary_repository.dart';
import 'data/repositories/story_repository.dart';
import 'domain/repositories/counter_repository.dart';
import 'domain/usecases/get_counter.dart';
import 'domain/usecases/increment_counter.dart';
import 'presentation/blocs/auth/auth_bloc.dart';
import 'presentation/blocs/auth/auth_state.dart';
import 'presentation/blocs/reward/reward_bloc.dart';
import 'presentation/blocs/vocabulary/vocabulary_bloc.dart';
import 'presentation/blocs/story/story_bloc.dart';
import 'presentation/pages/auth/login_page.dart';
import 'presentation/pages/counter_page.dart';
import 'presentation/pages/onboarding/onboarding_page.dart';
import 'presentation/pages/reward/reward_test_page.dart';
import 'presentation/pages/vocabulary/vocabulary_page.dart';
import 'presentation/layouts/main_layout.dart';
import 'package:dio/dio.dart';

final getIt = GetIt.instance;

Future<void> initializeDependencies() async {
  // External
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerSingleton(sharedPreferences);

  // Data sources
  getIt.registerLazySingleton<CounterLocalDataSource>(
    () => CounterLocalDataSourceImpl(getIt()),
  );

  // Repositories
  getIt.registerLazySingleton<CounterRepository>(
    () => CounterRepositoryImpl(getIt()),
  );
  getIt.registerLazySingleton<AuthRepository>(() => AuthRepository());
  getIt.registerLazySingleton<RewardRepository>(() => RewardRepository());
  getIt.registerLazySingleton<VocabularyRepository>(
    () => VocabularyRepository(Dio()),
  );
  getIt.registerLazySingleton<StoryRepository>(() => StoryRepository());

  // Use cases
  getIt.registerLazySingleton(() => GetCounter(getIt()));
  getIt.registerLazySingleton(() => IncrementCounter(getIt()));
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDependencies();
  runApp(
    MultiRepositoryProvider(
      providers: [
        RepositoryProvider<AuthRepository>(
          create: (_) => getIt<AuthRepository>(),
        ),
        RepositoryProvider<RewardRepository>(
          create: (_) => getIt<RewardRepository>(),
        ),
        RepositoryProvider<VocabularyRepository>(
          create: (_) => getIt<VocabularyRepository>(),
        ),
        RepositoryProvider<StoryRepository>(
          create: (_) => getIt<StoryRepository>(),
        ),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(create: (context) => AuthBloc(getIt<AuthRepository>())),
          BlocProvider(
            create: (context) => RewardBloc(getIt<RewardRepository>()),
          ),
          BlocProvider(
            create: (context) => VocabularyBloc(getIt<VocabularyRepository>()),
          ),
          BlocProvider(
            create: (context) => StoryBloc(getIt<StoryRepository>()),
          ),
        ],
        child: const MyApp(),
      ),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Learning Adventure',
      theme: AppTheme.lightTheme,
      home: const AppWrapper(),
    );
  }
}

class AppWrapper extends StatefulWidget {
  const AppWrapper({super.key});

  @override
  State<AppWrapper> createState() => _AppWrapperState();
}

class _AppWrapperState extends State<AppWrapper> {
  bool _isLoading = true;
  bool _hasSeenOnboarding = false;

  @override
  void initState() {
    super.initState();
    _checkOnboardingStatus();
  }

  Future<void> _checkOnboardingStatus() async {
    final prefs = getIt<SharedPreferences>();
    final hasSeenOnboarding = prefs.getBool('has_seen_onboarding') ?? false;

    setState(() {
      _hasSeenOnboarding = hasSeenOnboarding;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!_hasSeenOnboarding) {
      return const OnboardingPageWrapper();
    }

    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        if (state is AuthAuthenticated) {
          return const MainLayout();
        } else {
          return const LoginPage();
        }
      },
    );
  }
}

class OnboardingPageWrapper extends StatelessWidget {
  const OnboardingPageWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return OnboardingPage(
      onCompleted: () async {
        final prefs = getIt<SharedPreferences>();
        await prefs.setBool('has_seen_onboarding', true);

        if (context.mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const AppWrapper()),
          );
        }
      },
    );
  }
}
