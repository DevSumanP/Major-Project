import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:smart_cart/firebase_options.dart';
import 'package:smart_cart/qr_scanner.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
        debugShowCheckedModeBanner: false, home: ScanScreen());
  }
}
