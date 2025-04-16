// ignore_for_file: library_private_types_in_public_api

import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:smart_cart/cart_screen.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  _ScanScreenState createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  double scanProgress = 0.0;
  Timer? _timer;
  MobileScannerController controller =
      MobileScannerController(); // MobileScannerController instance

  @override
  void dispose() {
    controller.dispose();
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Opacity(
            opacity: 0.0,
            child: MobileScanner(
              controller: controller,
              onDetect: (barcodeCacpture) {
                final barcode = barcodeCacpture.barcodes.first;
                if (barcode.rawValue != null && _timer == null) {
                  final dataParts = barcode.rawValue!.split('\n');
                  final userId = dataParts[0].split(': ')[1];
                  final basketId = dataParts[1].split(': ')[1];

                  // Start the countdown before navigating
                  _startCountdown(userId, basketId);
                }
              },
            ),
          ),
          Center(
            child: Container(
              width: 400,
              padding: const EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 200,
                        height: 200,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [Color(0xFF1A8D53), Color(0xFF46DB91)],
                            stops: [0.0, 0.7],
                          ),
                        ),
                        child: const GlowEffect(),
                      ),
                      const PhoneIllustration(),
                    ],
                  ),
                  const SizedBox(height: 40),
                  const Text(
                    'Scan Phone',
                    style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Hold your phone in front of the camera.',
                    style: TextStyle(fontSize: 14, color: Colors.grey),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 30),
                  ProgressBar(progress: scanProgress),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _startCountdown(String userId, String basketId) {
    // 5-second delay
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      setState(() {
        scanProgress +=
            0.05; // Increase progress (0.02 x 50 = 1.0 over 5 seconds)
      });

      if (scanProgress >= 1.0) {
        timer.cancel(); // Stop the timer
        _navigateToCart(userId, basketId); // Navigate after the delay
      }
    });
  }

  void _navigateToCart(String userId, String basketId) {
    controller.dispose();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CartPaymentScreen(
          userId: userId,
          basketId: basketId,
        ),
      ),
    );
  }
}
// Rest of the code remains the same (PhoneIllustration, GlowEffect, ProgressBar classes)

class PhoneIllustration extends StatelessWidget {
  const PhoneIllustration({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      height: 200,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 20,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const SizedBox(height: 5),
          SizedBox(
              height: 60,
              width: 60,
              child: Image.asset(
                'assets/images/Scan.png',
                height: 60,
                width: 60,
              )),
          Container(
            height: 5,
            width: 25,
            margin: const EdgeInsets.only(bottom: 5),
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ],
      ),
    );
  }
}

class GlowEffect extends StatefulWidget {
  const GlowEffect({super.key});

  @override
  _GlowEffectState createState() => _GlowEffectState();
}

class _GlowEffectState extends State<GlowEffect>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    _controller =
        AnimationController(vsync: this, duration: const Duration(seconds: 2))
          ..repeat(reverse: true);
    _animation = Tween<double>(begin: 1.0, end: 1.2).animate(_controller);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Transform.scale(
          scale: _animation.value,
          child: Opacity(
            opacity: 0.5,
            child: child,
          ),
        );
      },
      child: const CircleAvatar(
        radius: 100,
        backgroundColor: Colors.transparent,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

class ProgressBar extends StatelessWidget {
  final double progress; // Add this line to accept progress

  const ProgressBar({super.key, required this.progress});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Waiting to scan',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          height: 4,
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(2),
          ),
          child: Align(
            alignment: Alignment.centerLeft,
            child: FractionallySizedBox(
              widthFactor: progress, // Dynamic width based on progress
              child: Container(
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFF52FFA8),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
