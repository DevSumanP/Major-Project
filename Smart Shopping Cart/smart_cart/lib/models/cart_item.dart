class Product {
  final String category;
  final String description;
  final String imageUrl;
  final double price;
  final String productID;
  final String productName;
  final int quantity;
  final List<double> features;

  Product({
    required this.category,
    required this.description,
    required this.imageUrl,
    required this.price,
    required this.productID,
    required this.productName,
    required this.quantity,
    required this.features,
  });

  factory Product.fromMap(Map<String, dynamic> data, String productID) {
    List<double> features = [
      _categoryToFeature(data['category'] ?? ''),
      (data['price'] as num? ?? 0).toDouble() / 1000,
      (data['quantity'] as num? ?? 1).toDouble() / 100,
    ];

    return Product(
      category: data['category'] as String? ?? '',
      description: data['description'] as String? ?? '',
      imageUrl: data['imageUrl'] as String? ?? '',
      price: (data['price'] as num? ?? 0).toDouble(),
      productID: data['productId'] as String? ?? productID,
      productName: data['productName'] as String? ?? '',
      quantity: (data['quantity'] as num? ?? 1).toInt(),
      features: features,
    );
  }
}

double _categoryToFeature(String category) {
  switch (category.toLowerCase()) {
    case 'dairy':
      return 1.0;
    case 'beverages':
      return 2.0;
    case 'snacks':
      return 3.0;
    case 'groceries':
      return 4.0;
    case 'fresh produce':
      return 5.0;
    case 'personal care':
      return 6.0;
    case 'household':
      return 7.0;
    case 'canned goods':
      return 8.0;
    default:
      return 0.0;
  }
}
