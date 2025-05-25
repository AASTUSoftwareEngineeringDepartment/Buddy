import '../entities/counter.dart';
import '../repositories/counter_repository.dart';

class GetCounter {
  final CounterRepository repository;

  GetCounter(this.repository);

  Future<Counter> call() async {
    return await repository.getCounter();
  }
} 