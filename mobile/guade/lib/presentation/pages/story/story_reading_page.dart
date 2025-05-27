import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:camera/camera.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:path/path.dart' as path;
import 'package:dio/dio.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../data/models/story_model.dart';
import '../../../data/repositories/story_repository.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_state.dart';
import 'dart:math' as math;
import 'vocabulary_quiz_page.dart';
import 'dart:convert';

class StoryReadingPage extends StatefulWidget {
  final StoryModel story;

  const StoryReadingPage({super.key, required this.story});

  @override
  State<StoryReadingPage> createState() => _StoryReadingPageState();
}

class _StoryReadingPageState extends State<StoryReadingPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _slideAnimation;
  final ScrollController _scrollController = ScrollController();
  final FlutterTts _flutterTts = FlutterTts();
  late final StoryRepository _storyRepository;
  bool _isControlsVisible = true;
  double _lastScrollPosition = 0;
  double _fontSize = 32.0;
  bool _isPlaying = false;
  int _currentWordIndex = 0;
  List<String> _words = [];
  Timer? _wordTimer;
  bool _isDarkMode = false;
  bool _isTestActive = false;
  int _currentQuestionIndex = 0;
  int _score = 0;
  List<Map<String, dynamic>> _vocabularyQuestions = [];
  bool _isStoryCompleted = false;

  // Add new variables for emotion detection
  CameraController? _cameraController;
  List<CameraDescription>? cameras;
  bool isCapturing = false;
  String emotionResponse = "";
  Timer? _emotionDetectionTimer;
  bool _isShowingEmotionPopup = false;
  int _noResponseCount = 0; // Counter for "No" responses

  @override
  void initState() {
    super.initState();
    _storyRepository = StoryRepository();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _slideAnimation = Tween<double>(begin: 50.0, end: 0.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    _animationController.forward();
    _scrollController.addListener(_onScroll);
    _initializeTts();
    _words = widget.story.storyBody.split(' ');
    _prepareVocabularyTest();
    _initializeCamera();
  }

  Future<void> _initializeTts() async {
    await _flutterTts.setLanguage('en-US');
    await _flutterTts.setSpeechRate(0.5); // Adjusted for natural story reading
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setVolume(1.0);
  }

  Future<void> _initializeCamera() async {
    cameras = await availableCameras();
    if (cameras!.isEmpty) {
      print("No cameras found");
      return;
    }
    // Find front camera
    final frontCamera = cameras!.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
      orElse: () => cameras!.first,
    );

    _cameraController = CameraController(frontCamera, ResolutionPreset.low);
    await _cameraController!.initialize();
    if (mounted) {
      setState(() {});
      // Start emotion detection after 5 seconds
      Future.delayed(const Duration(seconds: 5), () {
        if (mounted) {
          _startEmotionDetection();
        }
      });
    }
  }

  void _startEmotionDetection() {
    // Start capturing immediately
    _captureAndSendFrames();
  }

  Future<void> _handleEmotionResponse(String response) async {
    try {
      // Parse the response JSON
      final Map<String, dynamic> emotionData = json.decode(response);
      final String emotion =
          emotionData['emotion']?.toString().toLowerCase() ?? '';

      // Check for negative emotions and if we haven't shown the popup 3 times
      if ((emotion == 'sad' ||
              emotion == 'angry' ||
              emotion == 'disgust' ||
              emotion == 'fear') &&
          _noResponseCount < 3) {
        if (!mounted) return;

        // Show popup only if not already showing
        if (!_isShowingEmotionPopup) {
          _isShowingEmotionPopup = true;
          _showEmotionDialog(emotion);
        }
      }
    } catch (e) {
      print("Error handling emotion response: $e");
    }
  }

  Future<void> _captureAndSendFrames() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      print("Camera not initialized");
      return;
    }

    if (isCapturing) {
      print("Already capturing frames");
      return;
    }

    setState(() {
      isCapturing = true;
    });

    final List<XFile> capturedFrames = [];

    try {
      // Capture 10 frames at ~100ms intervals
      for (int i = 0; i < 10; i++) {
        try {
          XFile file = await _cameraController!.takePicture();
          capturedFrames.add(file);
          await Future.delayed(const Duration(milliseconds: 100));
        } catch (e) {
          print("Error capturing frame $i: $e");
          // Continue with next frame even if one fails
          continue;
        }
      }

      if (capturedFrames.isEmpty) {
        print("No frames were captured successfully");
        setState(() {
          isCapturing = false;
        });
        return;
      }

      // Send captured images to backend
      final response = await _sendFramesToServer(capturedFrames);

      if (mounted) {
        setState(() {
          emotionResponse = response;
        });

        // Handle the emotion response
        await _handleEmotionResponse(response);
      }

      // Wait for 5 seconds after sending to backend
      await Future.delayed(const Duration(seconds: 5));
    } catch (e) {
      print("Error in capture and send process: $e");
      // If there's an error, wait 5 seconds before trying again
      await Future.delayed(const Duration(seconds: 5));
    } finally {
      if (mounted) {
        setState(() {
          isCapturing = false;
        });
        // Schedule next capture after resetting the flag
        Future.delayed(const Duration(milliseconds: 100), () {
          if (mounted) {
            _captureAndSendFrames();
          }
        });
      }
    }
  }

  Future<String> _sendFramesToServer(List<XFile> frames) async {
    final uri = Uri.parse('https://emotion-backend-sh1h.onrender.com/predict');

    try {
      var request = http.MultipartRequest('POST', uri);

      // Add timeout to the request
      request.headers['Connection'] = 'keep-alive';

      for (var frame in frames) {
        try {
          var bytes = await frame.readAsBytes();
          var multipartFile = http.MultipartFile.fromBytes(
            'frames',
            bytes,
            filename: path.basename(frame.path),
            contentType: MediaType('image', 'jpeg'),
          );
          request.files.add(multipartFile);
        } catch (e) {
          print("Error processing frame ${frame.path}: $e");
          continue;
        }
      }

      if (request.files.isEmpty) {
        throw Exception('No valid frames to send');
      }

      var streamedResponse = await request.send().timeout(
        const Duration(seconds: 30),
        onTimeout: () {
          throw TimeoutException('Request timed out');
        },
      );

      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        return response.body;
      } else {
        throw Exception(
          'Failed to get prediction. Status: ${response.statusCode}',
        );
      }
    } catch (e) {
      print("Error sending frames to server: $e");
      rethrow;
    }
  }

  void _startReading() {
    if (_isPlaying) {
      _stopReading();
      return;
    }

    setState(() {
      _isPlaying = true;
      _currentWordIndex = 0;
    });

    _readNextWord();
  }

  void _readFullStory() {
    if (_isPlaying) {
      _stopReading();
      return;
    }

    setState(() {
      _isPlaying = true;
    });

    _flutterTts.speak(widget.story.storyBody).then((_) {
      setState(() {
        _isPlaying = false;
      });
    });
  }

  void _stopReading() {
    _wordTimer?.cancel();
    _flutterTts.stop();
    setState(() {
      _isPlaying = false;
    });
  }

  void _readNextWord() {
    if (_currentWordIndex >= _words.length) {
      _stopReading();
      return;
    }

    final word = _words[_currentWordIndex];
    _flutterTts.speak(word);

    _wordTimer = Timer(const Duration(milliseconds: 1200), () {
      setState(() {
        _currentWordIndex++;
      });
      _readNextWord();
    });
  }

  void _prepareVocabularyTest() {
    // Filter words that are longer than 4 characters to get meaningful vocabulary
    final vocabularyWords = _words.where((word) => word.length > 4).toList();
    // Take up to 5 random words for the test
    vocabularyWords.shuffle();
    final selectedWords = vocabularyWords.take(5).toList();

    _vocabularyQuestions = selectedWords.map((word) {
      // Create multiple choice options
      final options = List<String>.from(vocabularyWords)
        ..remove(word)
        ..shuffle()
        ..take(3)
        ..add(word)
        ..shuffle();

      return {'word': word, 'options': options, 'correctAnswer': word};
    }).toList();
  }

  void _startVocabularyTest() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => VocabularyQuizPage(
          storyId: widget.story.storyId,
          storyTitle: widget.story.title,
        ),
      ),
    );
  }

  void _answerQuestion(String selectedAnswer) {
    final currentQuestion = _vocabularyQuestions[_currentQuestionIndex];
    if (selectedAnswer == currentQuestion['correctAnswer']) {
      _score++;
    }

    if (_currentQuestionIndex < _vocabularyQuestions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
      });
    } else {
      _showTestResults();
    }
  }

  void _showTestResults() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Icon(
              _score >= 3
                  ? PhosphorIcons.star(PhosphorIconsStyle.fill)
                  : PhosphorIcons.star(),
              color: _score >= 3 ? Colors.amber : Colors.grey,
              size: 32,
            ),
            const SizedBox(width: 12),
            Text(
              'Great Job!',
              style: AppTextStyles.heading2.copyWith(color: AppColors.accent1),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'You got $_score out of ${_vocabularyQuestions.length} correct!',
              style: AppTextStyles.body1,
            ),
            const SizedBox(height: 16),
            Text(
              _score >= 3
                  ? '🌟 Amazing! You\'re a vocabulary star! 🌟'
                  : 'Keep practicing! You\'re getting better! 💪',
              style: AppTextStyles.body2.copyWith(
                color: AppColors.accent2,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              setState(() {
                _isTestActive = false;
              });
            },
            child: Text(
              'Try Again',
              style: TextStyle(color: AppColors.accent1),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              setState(() {
                _isTestActive = false;
              });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accent1,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Continue Reading'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _wordTimer?.cancel();
    _flutterTts.stop();
    _animationController.dispose();
    _scrollController.dispose();
    _cameraController?.dispose();
    _emotionDetectionTimer?.cancel();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels > _lastScrollPosition + 50) {
      if (_isControlsVisible) {
        setState(() => _isControlsVisible = false);
      }
    } else if (_scrollController.position.pixels < _lastScrollPosition - 50) {
      if (!_isControlsVisible) {
        setState(() => _isControlsVisible = true);
      }
    }
    _lastScrollPosition = _scrollController.position.pixels;

    // Check if user has reached the end of the story
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 100) {
      if (!_isStoryCompleted) {
        setState(() {
          _isStoryCompleted = true;
        });
      }
    }
  }

  void _toggleDarkMode() {
    setState(() {
      _isDarkMode = !_isDarkMode;
    });
  }

  void _showEmotionDialog(String emotion) {
    bool isLoading = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          title: Row(
            children: [
              Icon(
                PhosphorIcons.smiley(PhosphorIconsStyle.fill),
                color: AppColors.primary,
                size: 32,
              ),
              const SizedBox(width: 12),
              Text(
                'Are you bored?',
                style: AppTextStyles.heading2.copyWith(
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'I notice you might not be enjoying this story. Would you like to try a different one?',
                style: AppTextStyles.body1.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
              if (isLoading) ...[
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Finding a new story for you...',
                  style: AppTextStyles.body2.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ],
          ),
          actions: [
            if (!isLoading)
              TextButton(
                onPressed: () {
                  _noResponseCount++;
                  _isShowingEmotionPopup = false;
                  Navigator.of(context).pop();
                },
                child: Text(
                  'No, continue',
                  style: AppTextStyles.body1.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            if (!isLoading)
              ElevatedButton(
                onPressed: () async {
                  setState(() => isLoading = true);
                  try {
                    final authState = context.read<AuthBloc>().state;
                    if (authState is AuthAuthenticated) {
                      final response = await _storyRepository
                          .updateStoryEmotion(
                            storyId: widget.story.storyId,
                            emotion: emotion,
                            accessToken: authState.response.accessToken,
                          );

                      if (!mounted) return;

                      // Create new story from response
                      final newStory = StoryModel(
                        storyId: response['story_id'],
                        title: response['title'],
                        storyBody: response['story_body'],
                        imageUrl: response['image_url'],
                      );

                      // Close the dialog and navigate to new story
                      Navigator.of(context).pop();
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (context) =>
                              StoryReadingPage(story: newStory),
                        ),
                      );
                    }
                  } catch (e) {
                    if (!mounted) return;
                    setState(() => isLoading = false);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          e.toString().replaceAll('Exception: ', ''),
                        ),
                        backgroundColor: AppColors.error,
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: AppColors.textLight,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  'Yes, new story',
                  style: AppTextStyles.body1.copyWith(
                    color: AppColors.textLight,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _isDarkMode ? Colors.black : Colors.white,
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: _isDarkMode
                ? [Colors.black, Colors.grey[900]!]
                : [
                    AppColors.accent3.withOpacity(0.1),
                    AppColors.accent3.withOpacity(0.05),
                    Colors.white,
                  ],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              // Camera Preview
              if (_cameraController != null &&
                  _cameraController!.value.isInitialized)
                Positioned(
                  top: 16,
                  left: 16,
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.3),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: CameraPreview(_cameraController!),
                    ),
                  ),
                ),

              // Main Content
              AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  return Opacity(
                    opacity: _fadeAnimation.value,
                    child: Transform.translate(
                      offset: Offset(0, _slideAnimation.value),
                      child: CustomScrollView(
                        controller: _scrollController,
                        slivers: [
                          // Header
                          SliverAppBar(
                            expandedHeight: 300,
                            floating: false,
                            pinned: true,
                            backgroundColor: Colors.transparent,
                            elevation: 0,
                            flexibleSpace: FlexibleSpaceBar(
                              background: _buildStoryHeader(),
                            ),
                            leading: IconButton(
                              icon: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: _isDarkMode
                                      ? Colors.grey[800]
                                      : Colors.white.withOpacity(0.9),
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.accent3.withOpacity(0.2),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  PhosphorIcons.arrowLeft(),
                                  color: _isDarkMode
                                      ? Colors.white
                                      : AppColors.accent3,
                                ),
                              ),
                              onPressed: () => Navigator.of(context).pop(),
                            ),
                          ),

                          // Story Content
                          SliverToBoxAdapter(
                            child: Padding(
                              padding: const EdgeInsets.all(24),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Story Title
                                  Text(
                                    widget.story.title,
                                    style: AppTextStyles.heading2.copyWith(
                                      color: _isDarkMode
                                          ? Colors.white
                                          : AppColors.textPrimary,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 36,
                                      letterSpacing: -0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 24),

                                  // Story Body with Word-by-Word Reading
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 12,
                                    children: _words.asMap().entries.map((
                                      entry,
                                    ) {
                                      final index = entry.key;
                                      final word = entry.value;
                                      final isCurrentWord =
                                          index == _currentWordIndex;
                                      final isRead = index < _currentWordIndex;

                                      return Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: isCurrentWord
                                              ? AppColors.accent3.withOpacity(
                                                  0.3,
                                                )
                                              : isRead
                                              ? AppColors.accent1.withOpacity(
                                                  0.15,
                                                )
                                              : Colors.transparent,
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                          border: isCurrentWord
                                              ? Border.all(
                                                  color: AppColors.accent3,
                                                  width: 2,
                                                )
                                              : null,
                                        ),
                                        child: Text(
                                          word,
                                          style: AppTextStyles.body1.copyWith(
                                            color: _isDarkMode
                                                ? Colors.white
                                                : AppColors.textPrimary,
                                            height: 1.8,
                                            fontSize: _fontSize,
                                            letterSpacing: 0.2,
                                            fontWeight: isCurrentWord
                                                ? FontWeight.bold
                                                : FontWeight.normal,
                                          ),
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Story Completion Section
                          if (_isStoryCompleted)
                            SliverToBoxAdapter(
                              child: Container(
                                margin: const EdgeInsets.all(24),
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      AppColors.accent1.withOpacity(0.1),
                                      AppColors.accent1.withOpacity(0.05),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(
                                    color: AppColors.accent1.withOpacity(0.3),
                                  ),
                                ),
                                child: SingleChildScrollView(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      // Celebration Animation
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: AppColors.accent1.withOpacity(
                                            0.1,
                                          ),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Icon(
                                          PhosphorIcons.star(
                                            PhosphorIconsStyle.fill,
                                          ),
                                          color: AppColors.accent1,
                                          size: 48,
                                        ),
                                      ),
                                      const SizedBox(height: 20),
                                      Text(
                                        '🎉 Amazing! You finished the story! 🎉',
                                        style: AppTextStyles.heading2.copyWith(
                                          color: AppColors.accent1,
                                          fontSize: 24,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        'Let\'s play a fun word game!',
                                        style: AppTextStyles.body1.copyWith(
                                          color: AppColors.textSecondary,
                                          fontSize: 16,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Test your vocabulary and earn stars!',
                                        style: AppTextStyles.body2.copyWith(
                                          color: AppColors.textSecondary,
                                          fontSize: 14,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                      const SizedBox(height: 24),
                                      // Playful Quiz Button
                                      Container(
                                        width: double.infinity,
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            colors: [
                                              AppColors.accent1,
                                              AppColors.accent1.withOpacity(
                                                0.8,
                                              ),
                                            ],
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: AppColors.accent1
                                                  .withOpacity(0.3),
                                              blurRadius: 12,
                                              offset: const Offset(0, 6),
                                            ),
                                          ],
                                        ),
                                        child: Material(
                                          color: Colors.transparent,
                                          child: InkWell(
                                            onTap: _startVocabularyTest,
                                            borderRadius: BorderRadius.circular(
                                              20,
                                            ),
                                            child: Padding(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 24,
                                                    vertical: 16,
                                                  ),
                                              child: Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                children: [
                                                  Icon(
                                                    PhosphorIcons.star(
                                                      PhosphorIconsStyle.fill,
                                                    ),
                                                    color: Colors.white,
                                                    size: 24,
                                                  ),
                                                  const SizedBox(width: 12),
                                                  Flexible(
                                                    child: Text(
                                                      'Let\'s Play Word Game!',
                                                      style: AppTextStyles
                                                          .heading3
                                                          .copyWith(
                                                            color: Colors.white,
                                                            fontSize: 18,
                                                          ),
                                                      textAlign:
                                                          TextAlign.center,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  Icon(
                                                    PhosphorIcons.arrowRight(),
                                                    color: Colors.white,
                                                    size: 20,
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        '🌟 Earn stars for each correct answer! 🌟',
                                        style: AppTextStyles.caption.copyWith(
                                          color: AppColors.accent1.withOpacity(
                                            0.8,
                                          ),
                                          fontSize: 12,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),

                          // Vocabulary Test Section
                          if (_isTestActive)
                            SliverToBoxAdapter(
                              child: Container(
                                margin: const EdgeInsets.all(24),
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      AppColors.accent2.withOpacity(0.1),
                                      AppColors.accent2.withOpacity(0.05),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(
                                    color: AppColors.accent2.withOpacity(0.3),
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          PhosphorIcons.star(
                                            PhosphorIconsStyle.fill,
                                          ),
                                          color: AppColors.accent2,
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          'Vocabulary Quiz',
                                          style: AppTextStyles.heading3
                                              .copyWith(
                                                color: AppColors.accent2,
                                              ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      'Question ${_currentQuestionIndex + 1}/${_vocabularyQuestions.length}',
                                      style: AppTextStyles.body2.copyWith(
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'What does this word mean?',
                                      style: AppTextStyles.body1.copyWith(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      _vocabularyQuestions[_currentQuestionIndex]['word'],
                                      style: AppTextStyles.heading2.copyWith(
                                        color: AppColors.accent2,
                                        fontSize: 32,
                                      ),
                                    ),
                                    const SizedBox(height: 24),
                                    ...(_vocabularyQuestions[_currentQuestionIndex]['options']
                                            as List<String>)
                                        .map(
                                          (option) => Padding(
                                            padding: const EdgeInsets.only(
                                              bottom: 12,
                                            ),
                                            child: ElevatedButton(
                                              onPressed: () =>
                                                  _answerQuestion(option),
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors.white,
                                                foregroundColor:
                                                    AppColors.textPrimary,
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 24,
                                                      vertical: 16,
                                                    ),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(16),
                                                  side: BorderSide(
                                                    color: AppColors.accent2
                                                        .withOpacity(0.3),
                                                  ),
                                                ),
                                              ),
                                              child: Text(
                                                option,
                                                style: AppTextStyles.body1,
                                              ),
                                            ),
                                          ),
                                        )
                                        .toList(),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  );
                },
              ),

              // Interactive Elements
              AnimatedPositioned(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                bottom: _isControlsVisible ? 20 : -100,
                left: 20,
                right: 20,
                child: _buildInteractiveControls(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStoryHeader() {
    return Stack(
      children: [
        // Background Image
        if (widget.story.imageUrl != null && widget.story.imageUrl!.isNotEmpty)
          Positioned.fill(
            child: Image.network(
              widget.story.imageUrl!,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Image.asset(
                  'assets/images/story-bg.png',
                  fit: BoxFit.cover,
                );
              },
            ),
          )
        else
          Positioned.fill(
            child: Image.asset('assets/images/story-bg.png', fit: BoxFit.cover),
          ),

        // Gradient Overlay
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withOpacity(0.7),
                  Colors.black.withOpacity(0.5),
                  Colors.black.withOpacity(0.3),
                ],
              ),
            ),
          ),
        ),

        // Content
        Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Story Category Badge with Enhanced Design
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.accent1.withOpacity(0.2),
                      AppColors.accent1.withOpacity(0.1),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: AppColors.accent1.withOpacity(0.3),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accent1.withOpacity(0.2),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      PhosphorIcons.sparkle(PhosphorIconsStyle.fill),
                      size: 16,
                      color: AppColors.accent1,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Adventure Story',
                      style: AppTextStyles.body2.copyWith(
                        color: AppColors.accent1,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInteractiveControls() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _isDarkMode
            ? Colors.grey[900]!.withOpacity(0.95)
            : Colors.white.withOpacity(0.95),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppColors.accent3.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildControlButton(
            icon: _isPlaying
                ? PhosphorIcons.pause()
                : PhosphorIcons.play(PhosphorIconsStyle.fill),
            label: _isPlaying ? 'Pause' : 'Read Word',
            onTap: _startReading,
          ),
          _buildControlButton(
            icon: PhosphorIcons.textT(),
            label: 'Font Size',
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Adjust Font Size'),
                  content: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.remove),
                        onPressed: () {
                          setState(() {
                            _fontSize = (_fontSize - 4).clamp(24.0, 48.0);
                          });
                          Navigator.pop(context);
                        },
                      ),
                      Text(
                        '${_fontSize.round()}',
                        style: const TextStyle(fontSize: 20),
                      ),
                      IconButton(
                        icon: const Icon(Icons.add),
                        onPressed: () {
                          setState(() {
                            _fontSize = (_fontSize + 4).clamp(24.0, 48.0);
                          });
                          Navigator.pop(context);
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          _buildControlButton(
            icon: _isDarkMode ? PhosphorIcons.sun() : PhosphorIcons.moon(),
            label: 'Theme',
            onTap: _toggleDarkMode,
          ),
          _buildControlButton(
            icon: PhosphorIcons.bookOpen(),
            label: 'Read Story',
            onTap: _readFullStory,
          ),
        ],
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _isDarkMode
                  ? Colors.grey[800]
                  : AppColors.accent3.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: _isDarkMode ? Colors.white : AppColors.accent3,
              size: 20,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: _isDarkMode
                  ? Colors.white.withOpacity(0.7)
                  : AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

class _StoryPatternPainter extends CustomPainter {
  final Color color;

  _StoryPatternPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final random = math.Random(42); // Fixed seed for consistent pattern
    final patternSize = 20;

    for (var i = 0; i < size.width; i += patternSize) {
      for (var j = 0; j < size.height; j += patternSize) {
        if (random.nextBool()) {
          canvas.drawCircle(Offset(i.toDouble(), j.toDouble()), 2, paint);
        }
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
