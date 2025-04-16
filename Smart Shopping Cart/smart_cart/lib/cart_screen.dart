import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:smart_cart/models/cart_item.dart';
import 'package:smart_cart/widget/payment_method.dart';
import 'recommendation/recommend_products.dart';

class CartPaymentScreen extends StatefulWidget {
  final String basketId;
  final String userId;

  const CartPaymentScreen({
    required this.basketId,
    required this.userId,
    super.key,
  });

  @override
  State<CartPaymentScreen> createState() => _CartPaymentScreenState();
}

class _CartPaymentScreenState extends State<CartPaymentScreen> {
  final MobileScannerController _controller = MobileScannerController();
  Set<String> scannedQRCodes = {};
  bool isProcessingCode = false;
  bool isActive = false;
  bool isAddMode = true;
  Color scannerBorderColor = Colors.green;

  @override
  void initState() {
    super.initState();
    final stopwatch = Stopwatch()..start();
    FirebaseFirestore.instance
        .collection('baskets')
        .doc(widget.basketId)
        .snapshots()
        .listen((DocumentSnapshot documentSnapshot) {
      if (documentSnapshot.exists) {
        var status = documentSnapshot.get('status');
        if (status == 'Active') {
          setState(() {
            isActive = true;
          });
        } else {
          setState(() {
            isActive = false;
          });
        }
      } else if (kDebugMode) {
        print('Basket does not exist');
      }
    });
    stopwatch.stop();
    if (kDebugMode) {
      print('initState completed in ${stopwatch.elapsedMilliseconds} ms');
    }
  }

  Future<void> removeProductByBarcode(String barcodeId) async {
    final stopwatch = Stopwatch()..start();
    try {
      final querySnapshot = await FirebaseFirestore.instance
          .collection('baskets')
          .doc(widget.basketId)
          .collection('products')
          .where('productId', isEqualTo: barcodeId)
          .get();

      if (querySnapshot.docs.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Product not found in cart')),
        );
        stopwatch.stop();
        if (kDebugMode) {
          print(
              'removeProductByBarcode (not found) took ${stopwatch.elapsedMilliseconds} ms');
        }
        return;
      }

      final doc = querySnapshot.docs.first;
      final currentQuantity = doc.data()['quantity'] as int? ?? 1;

      if (currentQuantity <= 1) {
        // If quantity is 1, remove the product entirely
        await doc.reference.delete();
        setState(() {
          scannedQRCodes.remove(barcodeId);
        });
      } else {
        // Otherwise, decrement the quantity by 1
        await doc.reference.update({
          'quantity': currentQuantity - 1,
        });
      }

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Product quantity updated')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error removing product: $e')),
      );
    } finally {
      stopwatch.stop();
      if (kDebugMode) {
        print(
            'removeProductByBarcode completed in ${stopwatch.elapsedMilliseconds} ms');
      }
    }
  }

  Future<void> processQRCode(String? data) async {
    if (data == null || isProcessingCode) return;

    final stopwatch = Stopwatch()..start();
    setState(() {
      isProcessingCode = true;
    });

    try {
      if (isAddMode) {
        await fetchProductInfo(data);
      } else {
        await removeProductByBarcode(data);
      }
    } finally {
      setState(() {
        isProcessingCode = false;
      });
      stopwatch.stop();
      if (kDebugMode) {
        print(
            'processQRCode for $data completed in ${stopwatch.elapsedMilliseconds} ms');
      }
    }
  }

  Future<List<double>> computeUserPreferences(String basketId) async {
    final basketProducts = await fetchBasketProducts(basketId);

    if (basketProducts.isEmpty) {
      return [0.0, 0.0, 0.0];
    }

    List<double> summedFeatures =
        List.filled(basketProducts[0].features.length, 0.0);

    for (var product in basketProducts) {
      for (int i = 0; i < summedFeatures.length; i++) {
        summedFeatures[i] += product.features[i];
      }
    }

    return summedFeatures.map((sum) => sum / basketProducts.length).toList();
  }

  Widget _buildModeToggle() {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xff1a1a1a),
        elevation: 0.0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(50)),
      ),
      onPressed: () {
        final stopwatch = Stopwatch()..start();
        setState(() {
          isAddMode = !isAddMode;
          scannerBorderColor = isAddMode ? Colors.green : Colors.red;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(isAddMode
                ? 'Scan mode: Add products'
                : 'Scan mode: Remove products'),
          ),
        );
        stopwatch.stop();
        if (kDebugMode) {
          print('Mode toggle took ${stopwatch.elapsedMilliseconds} ms');
        }
      },
      child: Text(
        isAddMode ? 'Add Mode' : 'Remove Mode',
        style: const TextStyle(color: Colors.white, fontSize: 14),
      ),
    );
  }

  Widget _buildScanner() {
    return Column(
      children: [
        Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: scannerBorderColor, width: 2.5),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: MediaQuery.of(context).size.width * 0.3,
              height: MediaQuery.of(context).size.height * 0.35,
              child: MobileScanner(
                controller: _controller,
                onDetect: (barcodeCapture) {
                  final barcode = barcodeCapture.barcodes.first;
                  if (barcode.rawValue != null) {
                    final stopwatch = Stopwatch()..start();
                    processQRCode(barcode.rawValue.toString());
                    stopwatch.stop();
                    if (kDebugMode) {
                      print(
                          'QR detection and initial processing took ${stopwatch.elapsedMilliseconds} ms');
                    }
                  }
                },
              ),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> fetchProductInfo(String barcodeId) async {
    final stopwatch = Stopwatch()..start();
    try {
      setState(() {
        isProcessingCode = true;
      });

      // Check if the product is already in the basket
      final existingProduct = await FirebaseFirestore.instance
          .collection('baskets')
          .doc(widget.basketId)
          .collection('products')
          .where('productId', isEqualTo: barcodeId)
          .get();

      if (existingProduct.docs.isNotEmpty) {
        // Product exists in the basket; increment its quantity
        final doc = existingProduct.docs.first;
        final currentQuantity = doc.data()['quantity'] as int? ?? 1;
        await doc.reference.update({
          'quantity': currentQuantity + 1,
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Quantity increased for this item')),
        );
      } else {
        // Product not in basket; fetch and add it
        final productRef =
            FirebaseFirestore.instance.collection('products').doc(barcodeId);
        final productSnapshot = await productRef.get();

        if (productSnapshot.exists) {
          final productData = productSnapshot.data();
          if (productData != null) {
            Product item = Product.fromMap(productData, barcodeId);

            await FirebaseFirestore.instance
                .collection('baskets')
                .doc(widget.basketId)
                .collection('products')
                .add({
              'productName': item.productName,
              'description': item.description,
              'imageUrl': item.imageUrl,
              'price': item.price,
              'quantity': 1,
              'productId': barcodeId,
              'category': item.category,
            });

            setState(() {
              scannedQRCodes.add(barcodeId);
            });

            // ScaffoldMessenger.of(context).showSnackBar(
            //   const SnackBar(
            //       content: Text('Item added to basket successfully')),
            // );
          }
        }
      }
    } on FirebaseException catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching product info: ${e.message}')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unexpected error: $e')),
      );
    } finally {
      setState(() {
        isProcessingCode = false;
      });
      stopwatch.stop();
      if (kDebugMode) {
        print(
            'fetchProductInfo for $barcodeId completed in ${stopwatch.elapsedMilliseconds} ms');
      }
    }
  }

  Future<void> updateQuantity(String documentId, bool increment) async {
    final stopwatch = Stopwatch()..start();
    try {
      final docRef = FirebaseFirestore.instance
          .collection('baskets')
          .doc(widget.basketId)
          .collection('products')
          .doc(documentId);

      final doc = await docRef.get();
      final currentQuantity = doc.data()?['quantity'] as int? ?? 1;

      if (!increment && currentQuantity <= 1) {
        stopwatch.stop();
        if (kDebugMode) {
          print(
              'updateQuantity (no change) took ${stopwatch.elapsedMilliseconds} ms');
        }
        return;
      }

      await docRef.update({
        'quantity': increment ? currentQuantity + 1 : currentQuantity - 1,
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating quantity: $e')),
      );
    } finally {
      stopwatch.stop();
      if (kDebugMode) {
        print(
            'updateQuantity for $documentId completed in ${stopwatch.elapsedMilliseconds} ms');
      }
    }
  }

  Future<List<Product>> fetchBasketProducts(String basketId) async {
    final stopwatch = Stopwatch()..start();
    try {
      final basketDoc = await FirebaseFirestore.instance
          .collection('baskets')
          .doc(basketId)
          .collection('products')
          .get();

      List<Product> products = [];
      if (basketDoc.docs.isNotEmpty) {
        for (var doc in basketDoc.docs) {
          final productData = doc.data();
          products.add(
              Product.fromMap(productData, productData['productId'] ?? doc.id));
        }
      }
      stopwatch.stop();
      if (kDebugMode) {
        print('fetchBasketProducts took ${stopwatch.elapsedMilliseconds} ms');
      }
      return products;
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching basket products: $e');
      }
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> fetchBasketSummary(String basketId) async {
    final stopwatch = Stopwatch()..start();
    try {
      final basketDoc = await FirebaseFirestore.instance
          .collection('baskets')
          .doc(basketId)
          .collection('products')
          .get();

      List<Map<String, dynamic>> detailedProducts = [];
      if (basketDoc.docs.isNotEmpty) {
        for (var doc in basketDoc.docs) {
          final productData = doc.data();
          detailedProducts.add({
            "productName": productData['productName'],
            "quantity": productData['quantity'],
            "price": productData['price'],
            "totalPrice": productData['price'] * productData['quantity'],
          });
        }
      }
      stopwatch.stop();
      if (kDebugMode) {
        print('fetchBasketSummary took ${stopwatch.elapsedMilliseconds} ms');
      }
      return detailedProducts;
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching basket summary: $e');
      }
      return [];
    }
  }

  double calculateTotalAmount(List<Map<String, dynamic>> products) {
    final stopwatch = Stopwatch()..start();
    final total = products.fold(
      0.0,
      (accumulator, product) => accumulator + product['totalPrice'],
    );
    stopwatch.stop();
    if (kDebugMode) {
      print('calculateTotalAmount took ${stopwatch.elapsedMilliseconds} ms');
    }
    return total;
  }

  void showBill(List<Map<String, dynamic>> products) {
    double totalAmount = calculateTotalAmount(products);

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
          ),
          content: SingleChildScrollView(
            child: Column(
              children: [
                const Text(
                  "Best Kinmel Mart Pvt. Ltd.",
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  "Buddhanagar-10, Kathmandu",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 4),
                const Text(
                  "Phone: +977 9803828612",
                  style: TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 4),
                const Text(
                  "VAT: 609651702",
                  style: TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 30),
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Bill # : SI-2021-001 ",
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 14),
                      ),
                      SizedBox(height: 4),
                      Text(
                        "Date: 07/19/2024",
                        style: TextStyle(fontSize: 14),
                      ),
                      SizedBox(height: 4),
                      Text(
                        "Payment Method: Cash",
                        style: TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                const Row(
                  children: [
                    Expanded(
                      flex: 1,
                      child: Text(
                        "SN",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    Expanded(
                      flex: 3,
                      child: Text(
                        "Details",
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    Expanded(
                      flex: 1,
                      child: Text(
                        "Qty",
                        textAlign: TextAlign.center,
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Text(
                        "Price",
                        textAlign: TextAlign.right,
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                    Expanded(
                      flex: 2,
                      child: Text(
                        "Amount",
                        textAlign: TextAlign.right,
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const Divider(thickness: 2),
                ...products.asMap().entries.map((entry) {
                  final index = entry.key;
                  final product = entry.value;
                  return Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        flex: 1,
                        child: Text(
                          "${index + 1}",
                          textAlign: TextAlign.center,
                        ),
                      ),
                      Expanded(
                        flex: 3,
                        child: Text(
                          product['productName'],
                          textAlign: TextAlign.right,
                        ),
                      ),
                      Expanded(
                        flex: 1,
                        child: Text(
                          "${product['quantity']}",
                          textAlign: TextAlign.right,
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          "${product['price']}",
                          textAlign: TextAlign.right,
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Text(
                          "Rs ${product['totalPrice']}",
                          textAlign: TextAlign.right,
                        ),
                      ),
                    ],
                  );
                }),
                const SizedBox(height: 20),
                const Divider(),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Total Amount",
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    Text("Rs ${totalAmount.toStringAsFixed(2)}",
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: isActive
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Shopping Cart',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            _buildModeToggle(),
                          ],
                        ),
                        const SizedBox(height: 15),
                        Divider(color: Colors.grey[300]),
                        const SizedBox(height: 24),
                        _buildCartHeader(),
                        const SizedBox(height: 20),
                        Expanded(
                          child: StreamBuilder(
                            stream: FirebaseFirestore.instance
                                .collection('baskets')
                                .doc(widget.basketId)
                                .collection('products')
                                .snapshots(),
                            builder: (context,
                                AsyncSnapshot<QuerySnapshot> snapshot) {
                              if (!snapshot.hasData) {
                                return const Center(
                                  child: CircularProgressIndicator(),
                                );
                              }

                              if (snapshot.data!.docs.isEmpty) {
                                return _buildEmptyCart();
                              }

                              return ListView.separated(
                                itemCount: snapshot.data!.docs.length,
                                separatorBuilder: (context, index) =>
                                    const Divider(height: 32),
                                itemBuilder: (context, index) {
                                  final doc = snapshot.data!.docs[index];
                                  final data =
                                      doc.data() as Map<String, dynamic>;

                                  return _buildCartItem(
                                    Product.fromMap(
                                        data, data['productId'] ?? doc.id),
                                    doc.id,
                                  );
                                },
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 20),
                        _buildContinueShopping(),
                      ],
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Order Summary',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Divider(color: Colors.grey[300]),
                        const SizedBox(height: 24),
                        StreamBuilder<QuerySnapshot>(
                          stream: FirebaseFirestore.instance
                              .collection('baskets')
                              .doc(widget.basketId)
                              .collection('products')
                              .snapshots(),
                          builder: (context, snapshot) {
                            if (!snapshot.hasData) {
                              return const CircularProgressIndicator();
                            }

                            double subtotal = 0;
                            for (var doc in snapshot.data!.docs) {
                              final data = doc.data() as Map<String, dynamic>;
                              subtotal += (data['price'] as num).toDouble() *
                                  (data['quantity'] as int);
                            }

                            final tax = subtotal * 0.1;
                            final total = subtotal + tax;

                            return Column(
                              children: [
                                _buildScanner(),
                                const SizedBox(height: 10),
                                _buildSummaryRow('Subtotal:',
                                    'Rs ${subtotal.toStringAsFixed(2)}'),
                                _buildSummaryRow('Tax (10%):',
                                    'Rs ${tax.toStringAsFixed(2)}'),
                                const Divider(height: 20),
                                _buildSummaryRow(
                                    'Total:', 'Rs ${total.toStringAsFixed(2)}'),
                              ],
                            );
                          },
                        ),
                        const Spacer(),
                        _buildCheckoutButton(),
                      ],
                    ),
                  ),
                ),
              ],
            )
          : const Center(
              child: Text('Waiting for approval'),
            ),
    );
  }

  Widget _buildCartHeader() {
    return const Row(
      children: [
        Expanded(
          flex: 2,
          child: Text(
            'PRODUCT',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
        ),
        Expanded(
          child: Text(
            'QUANTITY',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
        ),
        Expanded(
          child: Text(
            'PRICE',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
        ),
        Expanded(
          child: Text(
            'TOTAL',
            style: TextStyle(
              color: Colors.black,
              fontWeight: FontWeight.w500,
              fontSize: 12,
            ),
          ),
        ),
        SizedBox(width: 40),
      ],
    );
  }

  Widget _buildCartItem(Product item, String documentId) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Row(
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Image.network(item.imageUrl, fit: BoxFit.cover),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.productName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      item.description,
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: Row(
            children: [
              _buildQuantityButton(
                icon: Icons.remove,
                onPressed: () => updateQuantity(documentId, false),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text('${item.quantity}'),
              ),
              _buildQuantityButton(
                icon: Icons.add,
                onPressed: () => updateQuantity(documentId, true),
              ),
            ],
          ),
        ),
        Expanded(
          child: Text(
            'Rs ${item.price.toStringAsFixed(2)}',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
        Expanded(
          child: Text(
            'Rs ${(item.price * item.quantity).toStringAsFixed(2)}',
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
        IconButton(
          onPressed: () => removeProductByBarcode(item.productID),
          icon: const Icon(Icons.close, color: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildQuantityButton({
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Icon(icon, size: 16),
      ),
    );
  }

  Widget _buildContinueShopping() {
    return Row(
      children: [
        ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) =>
                    RecommendationsPage(basketId: widget.basketId),
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            elevation: 0.0,
            backgroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            textStyle: const TextStyle(fontSize: 16),
          ),
          child: const Row(
            children: [
              Text('Show Recommendations'),
              Icon(Icons.arrow_right_alt)
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(fontSize: 16),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckoutButton() {
    return SizedBox(
      height: 50,
      width: MediaQuery.of(context).size.width * 0.4,
      child: ElevatedButton(
        onPressed: () async {
          // Fetch basket summary and calculate total
          List<Map<String, dynamic>> products =
              await fetchBasketSummary(widget.basketId);
          if (products.isEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Your cart is empty')),
            );
            return;
          }
          double total = calculateTotalAmount(products);

          showDialog(
            context: context,
            builder: (BuildContext context) {
              return ProductSummary(
                totalPrice: total,
                basketId: widget.basketId,
              );
            },
          );
        },
        style: ElevatedButton.styleFrom(
          foregroundColor: const Color(0xffffffff),
          backgroundColor: const Color(0xff1e1e1e),
          padding: const EdgeInsets.symmetric(vertical: 15),
          textStyle: const TextStyle(fontSize: 16, color: Color(0xffffffff)),
        ),
        child: const Text('Proceed to Checkout'),
      ),
    );
  }

  Widget _buildEmptyCart() {
    return const Center(
      child: Text(
        'Your cart is empty.',
        style: TextStyle(
          fontSize: 18,
          color: Colors.black,
        ),
      ),
    );
  }
}
