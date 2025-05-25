import 'package:shared_preferences/shared_preferences.dart';
import '../models/counter_model.dart';

abstract class CounterLocalDataSource {
  Future<CounterModel> getCounter();
  Future<void> incrementCounter();
}

class CounterLocalDataSourceImpl implements CounterLocalDataSource {
  final SharedPreferences sharedPreferences;
  static const String _counterKey = 'counter_value';

  CounterLocalDataSourceImpl(this.sharedPreferences);

  @override
  Future<CounterModel> getCounter() async {
    final value = sharedPreferences.getInt(_counterKey) ?? 0;
    return CounterModel(value: value);
  }

  @override
  Future<void> incrementCounter() async {
    final currentValue = sharedPreferences.getInt(_counterKey) ?? 0;
    await sharedPreferences.setInt(_counterKey, currentValue + 1);
  }
} 