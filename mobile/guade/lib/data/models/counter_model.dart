import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/counter.dart';

part 'counter_model.freezed.dart';
part 'counter_model.g.dart';

@freezed
class CounterModel with _$CounterModel {
  const factory CounterModel({
    required int value,
  }) = _CounterModel;

  factory CounterModel.fromJson(Map<String, dynamic> json) =>
      _$CounterModelFromJson(json);

  factory CounterModel.fromEntity(Counter counter) {
    return CounterModel(value: counter.value);
  }
}

extension CounterModelX on CounterModel {
  Counter toEntity() => Counter(value: value);
} 