import '../../domain/entities/counter.dart';
import '../../domain/repositories/counter_repository.dart';
import '../datasources/counter_local_datasource.dart';
import '../models/counter_model.dart';

class CounterRepositoryImpl implements CounterRepository {
  final CounterLocalDataSource localDataSource;

  CounterRepositoryImpl(this.localDataSource);

  @override
  Future<Counter> getCounter() async {
    final counterModel = await localDataSource.getCounter();
    return counterModel.toEntity();
  }

  @override
  Future<void> incrementCounter() async {
    await localDataSource.incrementCounter();
  }
} 