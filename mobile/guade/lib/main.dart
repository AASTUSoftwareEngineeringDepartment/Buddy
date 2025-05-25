import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'data/datasources/counter_local_datasource.dart';
import 'data/repositories/counter_repository_impl.dart';
import 'domain/repositories/counter_repository.dart';
import 'domain/usecases/get_counter.dart';
import 'domain/usecases/increment_counter.dart';
import 'presentation/pages/counter_page.dart';
import 'presentation/providers/use_case_providers.dart';

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

  // Use cases
  getIt.registerLazySingleton(() => GetCounter(getIt()));
  getIt.registerLazySingleton(() => IncrementCounter(getIt()));
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDependencies();
  
  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(getIt<SharedPreferences>()),
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
      title: 'Clean Architecture Counter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const CounterPage(),
    );
  }
}
