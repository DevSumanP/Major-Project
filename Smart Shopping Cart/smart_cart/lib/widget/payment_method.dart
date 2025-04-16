import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:lottie/lottie.dart';
import 'package:twilio_flutter/twilio_flutter.dart';

class ProductSummary extends StatefulWidget {
  const ProductSummary({
    super.key,
    required this.totalPrice,
    required this.basketId,
  });

  final String basketId;
  final double totalPrice;

  @override
  // ignore: library_private_types_in_public_api
  _ProductSummaryState createState() => _ProductSummaryState();
}

class _ProductSummaryState extends State<ProductSummary> {
  late Stream<DocumentSnapshot> basketStream;
  String strategy = 'default';

  final twilioFlutter = TwilioFlutter(
    accountSid: 'Twillo AccountID',
    authToken: 'Twillo AuthToken',
    twilioNumber: 'Twillo Number',
  );

  Future<String?> fetchUserPhoneNumber(String basketId) async {
    final FirebaseFirestore firestore = FirebaseFirestore.instance;
    try {
      QuerySnapshot userSnapshot = await firestore
          .collection('users')
          .where('basketId', isEqualTo: basketId)
          .limit(1)
          .get();

      if (userSnapshot.docs.isNotEmpty) {
        final userData = userSnapshot.docs.first.data() as Map<String, dynamic>;
        return userData['phone'] as String?;
      }
    } catch (e) {
      debugPrint('Error fetching user phone number: $e');
    }
    return null;
  }

  void sendSMS(String number, String message) async {
    try {
      await twilioFlutter.sendSMS(
        toNumber: number,
        messageBody: message,
      );
      debugPrint('SMS sent successfully!');
    } catch (e) {
      debugPrint('Failed to send SMS: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    basketStream = FirebaseFirestore.instance
        .collection('baskets')
        .doc(widget.basketId)
        .snapshots();
  }

  Future<void> updateBasket(
      String basketId, Map<String, dynamic> updatedData) async {
    try {
      await FirebaseFirestore.instance
          .collection('baskets')
          .doc(basketId)
          .update(updatedData);
      debugPrint('Basket updated successfully with status checked out');
    } catch (e) {
      debugPrint('Error updating basket: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(
          maxWidth: 700, // Set a maximum width for the dialog
          maxHeight: 500, // Set a maximum height for the dialog
        ),
        child: SingleChildScrollView(
          // Add scrolling if content overflows
          child: StreamBuilder<DocumentSnapshot>(
            stream: basketStream,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const SizedBox(
                  height: 200, // Placeholder height while loading
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              if (snapshot.hasError) {
                return const SizedBox(
                  height: 200,
                  child: Center(child: Text('Error loading basket data')),
                );
              }
              if (!snapshot.hasData || !snapshot.data!.exists) {
                return const SizedBox(
                  height: 200,
                  child: Center(child: Text('Basket not found')),
                );
              }

              var basketData = snapshot.data!.data() as Map<String, dynamic>;
              return _buildProductSummary(context, basketData);
            },
          ),
        ),
      ),
    );
  }

  Widget _buildProductSummary(
      BuildContext context, Map<String, dynamic> basketData) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min, // Prevents unnecessary expansion
        children: [
          _buildHeader(),
          const SizedBox(height: 16),
          _buildDescription(),
          const SizedBox(height: 24),
          _buildStrategySelection(),
          const SizedBox(height: 24),
          _buildControlButtons(),
          const SizedBox(height: 24),
          Divider(color: Colors.grey[200]),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Shopping Summary',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.grey[800],
          ),
        ),
        IconButton(
          icon: Icon(Icons.close, color: Colors.grey[500]),
          onPressed: () => Navigator.pop(context),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
      ],
    );
  }

  Widget _buildDescription() {
    return Text(
      'Review your selected items and ensure everything looks good. '
      'Choose a preferred payment method to complete your shopping experience seamlessly',
      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
    );
  }

  Widget _buildStrategySelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Method',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.grey[800],
          ),
        ),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            return constraints.maxWidth > 600
                ? Row(
                    children: [
                      Flexible(child: _buildStrategyOption('cash')),
                      const SizedBox(width: 16),
                      Flexible(child: _buildStrategyOption('online')),
                    ],
                  )
                : Column(
                    children: [
                      _buildStrategyOption('cash'),
                      const SizedBox(height: 16),
                      _buildStrategyOption('online'),
                    ],
                  );
          },
        ),
      ],
    );
  }

  Widget _buildStrategyOption(String type) {
    bool isSelected = strategy == type;
    String title = type == 'cash' ? 'Cash Payment' : 'Online Payment';
    String description = type == 'cash'
        ? 'Ideal for hands-off operators looking to ensure maximum availability.'
        : 'Perfect for those who need precise control over payment timing and management.';

    return GestureDetector(
      onTap: () {
        setState(() {
          strategy = type;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? Colors.grey[800]! : Colors.grey[200]!,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title,
                    style: const TextStyle(fontWeight: FontWeight.w500)),
                if (type == 'cash' || type == 'online')
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text('Total : Rs. ${widget.totalPrice}',
                        style:
                            TextStyle(fontSize: 12, color: Colors.grey[600])),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(description,
                style: TextStyle(fontSize: 14, color: Colors.grey[600])),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerRight,
              child: Icon(isSelected
                  ? Icons.radio_button_checked
                  : Icons.radio_button_unchecked),
            ),
          ],
        ),
      ),
    );
  }

  // Show success dialog after SMS is sent
  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          child: Container(
            padding: const EdgeInsets.all(24),
            constraints:
                const BoxConstraints(maxWidth: 400), // Max width for dialog
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize
                  .min, // To ensure the dialog doesn't expand unnecessarily
              children: [
                Lottie.asset('assets/images/payment-successful.json',
                    height: 100),
              ],
            ),
          ),
        );
      },
    );
  }

  // Show QR code dialog for online payment
  void _showQRCodeDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
            backgroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            child:
                Image.asset('assets/images/qr.png', height: 200, width: 200));
      },
    );
  }

  Widget _buildControlButtons() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        OutlinedButton(
          onPressed: () => Navigator.pop(context),
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 12,
            ),
            side: BorderSide(color: Colors.grey.shade300),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: const Text(
            'Cancel',
            style: TextStyle(color: Colors.black),
          ),
        ),
        const SizedBox(width: 16),
        ElevatedButton(
          onPressed: () {
            if (strategy == 'cash') {
              // Fetch the user's phone number and send SMS for cash payment
              fetchUserPhoneNumber(widget.basketId).then((phone) {
                if (phone != null) {
                  sendSMS(phone,
                      'Your order has been confirmed. Please proceed with cash payment.');
                  // // Show success dialog after sending SMS
                  _showSuccessDialog();
                }
              });
            } else if (strategy == 'online') {
              // Show QR code dialog for online payment
              _showQRCodeDialog();
            }

            updateBasket(widget.basketId, {
              'totalPrice':
                  widget.totalPrice, // Include other relevant data if necessary
              'paymentService':
                  strategy, // Include the payment strategy if necessary
              'status': 'Checked out'
              // You can add more fields here as needed
            });
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.black87,
            padding: const EdgeInsets.symmetric(
              horizontal: 24,
              vertical: 12,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: const Text(
            'Continue',
            style: TextStyle(color: Colors.white),
          ),
        ),
      ],
    );
  }
}
