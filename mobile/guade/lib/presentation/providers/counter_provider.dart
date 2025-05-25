import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/entities/counter.dart';
import '../../domain/usecases/get_counter.dart';
import '../../domain/usecases/increment_counter.dart';
import 'use_case_providers.dart';

final counterProvider = StateNotifierProvider<CounterNotifier, AsyncValue<Counter>>((ref) {
  final getCounter = ref.watch(getCounterProvider);
  final incrementCounter = ref.watch(incrementCounterProvider);
  return CounterNotifier(getCounter, incrementCounter);
});

class CounterNotifier extends StateNotifier<AsyncValue<Counter>> {
  final GetCounter _getCounter;
  final IncrementCounter _incrementCounter;

  CounterNotifier(this._getCounter, this._incrementCounter) : super(const AsyncValue.loading()) {
    loadCounter();
  }

  Future<void> loadCounter() async {
    try {
      final counter = await _getCounter();
      state = AsyncValue.data(counter);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  Future<void> increment() async {
    try {
      await _incrementCounter();
      await loadCounter();
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
} 