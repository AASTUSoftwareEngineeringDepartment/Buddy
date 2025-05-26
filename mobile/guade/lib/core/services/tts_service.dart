import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';

class TTSService {
  static final TTSService _instance = TTSService._internal();
  factory TTSService() => _instance;
  TTSService._internal();

  FlutterTts? _flutterTts;
  bool _isInitialized = false;
  bool _isSpeaking = false;
  bool _isSupported = false;

  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // Check if we're on a supported platform
      if (defaultTargetPlatform == TargetPlatform.android ||
          defaultTargetPlatform == TargetPlatform.iOS) {
        _flutterTts = FlutterTts();

        // Configure TTS settings
        await _flutterTts!.setLanguage('en-US');
        await _flutterTts!.setSpeechRate(0.5); // Slower rate for learning
        await _flutterTts!.setVolume(1.0);
        await _flutterTts!.setPitch(1.0);

        // Set up event handlers
        _flutterTts!.setStartHandler(() {
          _isSpeaking = true;
        });

        _flutterTts!.setCompletionHandler(() {
          _isSpeaking = false;
        });

        _flutterTts!.setErrorHandler((msg) {
          print('TTS Error: $msg');
          _isSpeaking = false;
        });

        _isSupported = true;
      } else {
        // Platform not supported (like Linux desktop)
        print(
          'TTS not supported on this platform: ${defaultTargetPlatform.name}',
        );
        _isSupported = false;
      }
    } catch (e) {
      print('Error initializing TTS: $e');
      _isSupported = false;
    }

    _isInitialized = true;
  }

  Future<void> speak(String text) async {
    if (!_isInitialized) {
      await initialize();
    }

    if (!_isSupported) {
      print('TTS not supported - would speak: "$text"');
      // Simulate speaking for UI feedback
      _isSpeaking = true;
      await Future.delayed(const Duration(milliseconds: 1500));
      _isSpeaking = false;
      return;
    }

    if (_isSpeaking) {
      await stop();
    }

    try {
      await _flutterTts!.speak(text);
    } catch (e) {
      print('Error speaking text: $e');
      _isSpeaking = false;
    }
  }

  Future<void> stop() async {
    if (_isInitialized && _isSupported && _flutterTts != null) {
      await _flutterTts!.stop();
    }
    _isSpeaking = false;
  }

  bool get isSpeaking => _isSpeaking;
  bool get isSupported => _isSupported;

  Future<void> dispose() async {
    if (_isInitialized && _isSupported && _flutterTts != null) {
      await _flutterTts!.stop();
    }
    _isInitialized = false;
    _isSpeaking = false;
  }
}
