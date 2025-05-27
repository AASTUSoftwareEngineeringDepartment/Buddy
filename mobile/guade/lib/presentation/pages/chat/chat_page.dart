import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:phosphor_flutter/phosphor_flutter.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../blocs/auth/auth_bloc.dart';
import '../../blocs/auth/auth_state.dart';
import '../../blocs/chat/chat_bloc.dart';
import '../../blocs/chat/chat_event.dart';
import '../../blocs/chat/chat_state.dart';
import '../../../data/repositories/chat_repository.dart';
import 'package:dio/dio.dart';
import 'package:flutter_tts/flutter_tts.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage>
    with SingleTickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late final AnimationController _animationController;
  late final Animation<double> _fadeAnimation;
  late final Animation<double> _slideAnimation;
  final FlutterTts _flutterTts = FlutterTts();
  final SpeechToText _speech = SpeechToText();
  bool _isListening = false;
  bool _speechEnabled = false;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _initializeTts();
    _initializeSpeech();
  }

  Future<void> _initializeTts() async {
    await _flutterTts.setLanguage('en-US');
    await _flutterTts.setSpeechRate(0.5); // Slower rate for better clarity
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setVolume(1.0);
  }

  Future<void> _speakMessage(String text) async {
    await _flutterTts.speak(text);
  }

  Future<void> _initializeSpeech() async {
    try {
      // Request microphone permission
      final status = await Permission.microphone.request();
      if (status.isGranted) {
        bool available = await _speech.initialize(
          onStatus: (status) {
            print('Speech recognition status: $status');
            if (status == 'done') {
              setState(() => _isListening = false);
            }
          },
          onError: (error) {
            print('Speech recognition error: $error');
            setState(() {
              _isListening = false;
              _speechEnabled = false;
            });
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Speech recognition error: $error'),
                backgroundColor: AppColors.error,
              ),
            );
          },
        );
        
        if (available) {
          setState(() => _speechEnabled = true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Speech recognition is not available on this device'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Microphone permission is required for speech recognition'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } catch (e) {
      print('Error initializing speech: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to initialize speech recognition: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _startListening() async {
    if (!_speechEnabled) {
      await _initializeSpeech();
      if (!_speechEnabled) {
        return;
      }
    }

    try {
      if (!_isListening) {
        setState(() => _isListening = true);
        await _speech.listen(
          onResult: (result) {
            print('Speech recognition result: ${result.recognizedWords}');
            setState(() {
              _messageController.text = result.recognizedWords;
              if (result.finalResult) {
                _isListening = false;
                if (_messageController.text.isNotEmpty) {
                  _sendMessage();
                }
              }
            });
          },
          listenFor: const Duration(seconds: 30),
          pauseFor: const Duration(seconds: 3),
          partialResults: true,
          localeId: 'en_US',
          onSoundLevelChange: (level) {
            print('Sound level: $level');
          },
        );
      } else {
        setState(() => _isListening = false);
        await _speech.stop();
      }
    } catch (e) {
      print('Error during speech recognition: $e');
      setState(() => _isListening = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error during speech recognition: $e'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _slideAnimation = Tween<double>(begin: 50.0, end: 0.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _animationController.dispose();
    _flutterTts.stop();
    super.dispose();
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;

    final authState = context.read<AuthBloc>().state;
    String? accessToken;
    if (authState is AuthAuthenticated) {
      accessToken = authState.response.accessToken;
    }

    context.read<ChatBloc>().add(
      SendMessage(message: _messageController.text, accessToken: accessToken),
    );

    _messageController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.primary, AppColors.primary.withOpacity(0.8)],
            ),
          ),
        ),
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(PhosphorIcons.arrowLeft(), color: Colors.white),
          ),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Image.asset(
                'assets/images/puppet.png',
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Learning Buddy',
                  style: AppTextStyles.heading3.copyWith(color: Colors.white),
                ),
                Text(
                  'Online',
                  style: AppTextStyles.caption.copyWith(
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                PhosphorIcons.dotsThreeOutline(),
                color: Colors.white,
              ),
            ),
            onPressed: () {
              // Show options menu
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        bottom: false,
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                AppColors.primary.withOpacity(0.1),
                AppColors.primary.withOpacity(0.05),
                Colors.white,
              ],
            ),
          ),
          child: Column(
            children: [
              Expanded(
                child: BlocBuilder<ChatBloc, ChatState>(
                  builder: (context, state) {
                    if (state is ChatInitial) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 120,
                              height: 120,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withOpacity(0.2),
                                    blurRadius: 20,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: Image.asset(
                                'assets/images/puppet.png',
                                fit: BoxFit.contain,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              'Hi there! 👋',
                              style: AppTextStyles.heading2.copyWith(
                                color: AppColors.primary,
                                fontSize: 28,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'I\'m your learning buddy!\nLet\'s chat and learn together!',
                              style: AppTextStyles.body1.copyWith(
                                color: AppColors.textSecondary,
                                height: 1.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 32),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    PhosphorIcons.sparkle(
                                      PhosphorIconsStyle.fill,
                                    ),
                                    color: AppColors.primary,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Ask me anything!',
                                    style: AppTextStyles.body1.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    if (state is ChatError) {
                      return Column(
                        children: [
                          Expanded(
                            child: ListView.builder(
                              controller: _scrollController,
                              padding: const EdgeInsets.all(16),
                              itemCount: state.messages.length,
                              itemBuilder: (context, index) {
                                final message = state.messages[index];
                                return _ChatBubble(message: message);
                              },
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(16),
                            child: Text(
                              state.message,
                              style: AppTextStyles.body1.copyWith(
                                color: AppColors.error,
                              ),
                            ),
                          ),
                        ],
                      );
                    }

                    final messages = state is ChatLoaded
                        ? state.messages
                        : state is ChatLoading
                        ? state.messages
                        : <ChatMessage>[];

                    return AnimatedBuilder(
                      animation: _animationController,
                      builder: (context, child) {
                        return Opacity(
                          opacity: _fadeAnimation.value,
                          child: Transform.translate(
                            offset: Offset(0, _slideAnimation.value),
                            child: ListView.builder(
                              controller: _scrollController,
                              padding: const EdgeInsets.all(16),
                              itemCount: messages.length,
                              itemBuilder: (context, index) {
                                final message = messages[index];
                                return _ChatBubble(message: message);
                              },
                            ),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
              if (context.watch<ChatBloc>().state is ChatLoading)
                Container(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Image.asset(
                          'assets/images/puppet.png',
                          fit: BoxFit.contain,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          children: [
                            _buildTypingIndicator(),
                            const SizedBox(width: 8),
                            _buildTypingIndicator(delay: 200),
                            const SizedBox(width: 8),
                            _buildTypingIndicator(delay: 400),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              Container(
                padding: EdgeInsets.only(
                  left: 16,
                  right: 16,
                  top: 16,
                  bottom: 16 + MediaQuery.of(context).padding.bottom,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -5),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: _isListening
                                      ? AppColors.primary.withOpacity(0.2)
                                      : AppColors.primary.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  _isListening
                                      ? PhosphorIcons.microphoneSlash(
                                          PhosphorIconsStyle.fill,
                                        )
                                      : PhosphorIcons.microphone(
                                          PhosphorIconsStyle.fill,
                                        ),
                                  color: _isListening
                                      ? AppColors.primary
                                      : AppColors.primary.withOpacity(0.7),
                                ),
                              ),
                              onPressed: _startListening,
                            ),
                            Expanded(
                              child: TextField(
                                controller: _messageController,
                                decoration: InputDecoration(
                                  hintText: _isListening
                                      ? 'Listening...'
                                      : 'Type your message...',
                                  hintStyle: AppTextStyles.body2.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                  border: InputBorder.none,
                                ),
                                maxLines: null,
                                textCapitalization:
                                    TextCapitalization.sentences,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: IconButton(
                        icon: Icon(
                          PhosphorIcons.paperPlaneRight(
                            PhosphorIconsStyle.fill,
                          ),
                          color: Colors.white,
                        ),
                        onPressed:
                            context.watch<ChatBloc>().state is ChatLoading
                            ? null
                            : _sendMessage,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTypingIndicator({int delay = 0}) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: const Duration(milliseconds: 600),
      curve: Curves.easeInOut,
      builder: (context, value, child) {
        return Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.3 + (value * 0.4)),
            shape: BoxShape.circle,
          ),
        );
      },
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        mainAxisAlignment: message.isUser
            ? MainAxisAlignment.end
            : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!message.isUser) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Image.asset(
                'assets/images/puppet.png',
                fit: BoxFit.contain,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: message.isUser
                    ? AppColors.primary
                    : AppColors.background,
                borderRadius: BorderRadius.circular(20).copyWith(
                  bottomRight: message.isUser
                      ? const Radius.circular(4)
                      : const Radius.circular(20),
                  bottomLeft: message.isUser
                      ? const Radius.circular(20)
                      : const Radius.circular(4),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message.text,
                    style: AppTextStyles.body1.copyWith(
                      color: message.isUser
                          ? Colors.white
                          : AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _formatTime(message.timestamp),
                        style: AppTextStyles.caption.copyWith(
                          color: message.isUser
                              ? Colors.white.withOpacity(0.7)
                              : AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {
                          final chatPageState = context
                              .findAncestorStateOfType<_ChatPageState>();
                          if (chatPageState != null) {
                            chatPageState._speakMessage(message.text);
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color:
                                (message.isUser
                                        ? Colors.white
                                        : AppColors.primary)
                                    .withOpacity(0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            PhosphorIcons.microphone(PhosphorIconsStyle.fill),
                            size: 16,
                            color: message.isUser
                                ? Colors.white
                                : AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${time.hour}:${time.minute.toString().padLeft(2, '0')}';
    }
  }
}
