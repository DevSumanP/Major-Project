import 'dart:convert';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:smart_cart/models/cart_item.dart';

class RecommendationsPage extends StatefulWidget {
  final String basketId;

  const RecommendationsPage({super.key, required this.basketId});

  @override
  State<RecommendationsPage> createState() => _RecommendationsPageState();
}

class _RecommendationsPageState extends State<RecommendationsPage> {
  Future<List<Product>> fetchProducts() async {
    try {
      QuerySnapshot snapshot =
          await FirebaseFirestore.instance.collection('products').get();
      return snapshot.docs
          .map((doc) =>
              Product.fromMap(doc.data() as Map<String, dynamic>, doc.id))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        print("Error fetching products: $e");
      }
      return [];
    }
  }

  Future<List<Product>> fetchBasketProducts(String basketId) async {
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
      return products;
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching basket products: $e');
      }
      return [];
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

  double calculateCosineSimilarity(List<double> vectorA, List<double> vectorB) {
    if (vectorA.length != vectorB.length) {
      throw Exception("Vectors must have the same length");
    }

    double dotProduct = 0.0;
    double normA = 0.0;
    double normB = 0.0;

    for (int i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = sqrt(normA);
    normB = sqrt(normB);

    if (normA == 0 || normB == 0) {
      return 0.0;
    }

    return dotProduct / (normA * normB);
  }

  Future<List<Map<String, dynamic>>> getRecommendations() async {
    final userPreferences = await computeUserPreferences(widget.basketId);
    final allProducts = await fetchProducts();

    final basketProducts = await fetchBasketProducts(widget.basketId);
    final basketProductIds = basketProducts.map((p) => p.productID).toSet();
    final recommendationPool = allProducts
        .where((product) => !basketProductIds.contains(product.productID))
        .toList();

    // Determine the dominant category in the user’s basket
    final categoryCounts = <String, int>{};
    for (var product in basketProducts) {
      categoryCounts[product.category.toLowerCase()] =
          (categoryCounts[product.category.toLowerCase()] ?? 0) + 1;
    }
    String dominantCategory =
        categoryCounts.entries.reduce((a, b) => a.value > b.value ? a : b).key;

    // Filter recommendation pool to prioritize the dominant category
    final sameCategoryProducts = recommendationPool
        .where((product) => product.category.toLowerCase() == dominantCategory)
        .toList();
    final otherCategoryProducts = recommendationPool
        .where((product) => product.category.toLowerCase() != dominantCategory)
        .toList();

    // Calculate similarities for same-category products
    List<Map<String, dynamic>> recommendations = [];
    for (var product in sameCategoryProducts) {
      double similarity =
          calculateCosineSimilarity(product.features, userPreferences);
      recommendations.add({"product": product, "similarity": similarity});
    }

    // If fewer than 5 recommendations, add from other categories
    if (recommendations.length < 5) {
      for (var product in otherCategoryProducts) {
        double similarity =
            calculateCosineSimilarity(product.features, userPreferences);
        recommendations.add({"product": product, "similarity": similarity});
      }
    }

    // Sort by similarity in descending order
    recommendations.sort((a, b) => b["similarity"].compareTo(a["similarity"]));

    return recommendations;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recommended Products'),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: getRecommendations(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("No recommendations available."));
          }

          final recommendations = snapshot.data!;

          return ListView.builder(
            itemCount: recommendations.length,
            itemBuilder: (context, index) {
              var rec = recommendations[index];
              var product = rec['product'] as Product;
              return ListTile(
                // leading: Image.memory(
                //   base64Decode(product.imageUrl.split(',').last),
                //   width: 50,
                //   height: 50,
                //   fit: BoxFit.cover,
                // ),
                title: Text(product.productName),
                subtitle: Text(
                    "Category: ${product.category}\nPrice: ${product.price}\nSimilarity: ${rec['similarity'].toStringAsFixed(2)}"),
              );
            },
          );
        },
      ),
    );
  }
}
