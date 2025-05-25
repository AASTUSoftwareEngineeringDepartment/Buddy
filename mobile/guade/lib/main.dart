import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/theme/app_theme.dart';
import 'data/datasources/counter_local_datasource.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/counter_repository_impl.dart';
import 'domain/repositories/counter_repository.dart';
import 'domain/usecases/get_counter.dart';
import 'domain/usecases/increment_counter.dart';
import 'presentation/blocs/auth/auth_bloc.dart';
import 'presentation/pages/auth/login_page.dart';
import 'presentation/pages/counter_page.dart';
import 'presentation/pages/onboarding/onboarding_page.dart';

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
  getIt.registerLazySingleton<AuthRepository>(
    () => AuthRepository(),
  );

  // Use cases
  getIt.registerLazySingleton(() => GetCounter(getIt()));
  getIt.registerLazySingleton(() => IncrementCounter(getIt()));
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDependencies();
  
  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) => AuthBloc(getIt<AuthRepository>()),
        ),
      ],
      child: const MyApp(),
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
      home: const OnboardingPage(),
    );
  }
}
