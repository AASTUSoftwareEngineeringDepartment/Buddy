import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/datasources/counter_local_datasource.dart';
import '../../data/repositories/counter_repository_impl.dart';
import '../../domain/repositories/counter_repository.dart';
import '../../domain/usecases/get_counter.dart';
import '../../domain/usecases/increment_counter.dart';

final getCounterProvider = Provider<GetCounter>((ref) {
  return GetCounter(ref.watch(counterRepositoryProvider));
});

final incrementCounterProvider = Provider<IncrementCounter>((ref) {
  return IncrementCounter(ref.watch(counterRepositoryProvider));
});

final counterRepositoryProvider = Provider<CounterRepository>((ref) {
  return ref.watch(counterRepositoryImplProvider);
});

final counterRepositoryImplProvider = Provider<CounterRepositoryImpl>((ref) {
  return CounterRepositoryImpl(ref.watch(counterLocalDataSourceProvider));
});

final counterLocalDataSourceProvider = Provider<CounterLocalDataSource>((ref) {
  return CounterLocalDataSourceImpl(ref.watch(sharedPreferencesProvider));
});

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences must be initialized in main.dart');
}); 