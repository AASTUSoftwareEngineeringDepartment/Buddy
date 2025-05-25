import '../entities/counter.dart';

abstract class CounterRepository {
  Future<Counter> getCounter();
  Future<void> incrementCounter();
} 