import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import Papa from 'papaparse';

// Initialize Firebase (replace with your config)
const firebaseConfig = {
    apiKey: "AIzaSyAaN6l0gS39Xuh8Orf8tmuTYOJiBuFz7gE",
    authDomain: "smart-shopping-app-12cfd.firebaseapp.com",
    databaseURL: "https://smart-shopping-app-12cfd-default-rtdb.firebaseio.com",
    projectId: "smart-shopping-app-12cfd",
    storageBucket: "smart-shopping-app-12cfd.firebasestorage.app",
    messagingSenderId: "52215147179",
    appId: "1:52215147179:web:cb4feff245702bbd56a5ee",
    measurementId: "G-B7J8FNG28Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function ProductUpload() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const formattedProducts = results.data.map(item => ({
            category: item.Category,
            description: item.Description,
            imageUrl: item.ImageUrl,
            price: parseFloat(item.Price),
            productID: item.ProductID,
            productName: item.ProductName,
            quantity: parseInt(item.Quantity)
          })).filter(item => item.productID); // Filter out empty rows

          setProducts(formattedProducts);
          setMessage(`${formattedProducts.length} products loaded successfully`);
          setIsLoading(false);
        },
        error: (error) => {
          setMessage(`Error reading CSV: ${error}`);
          setIsLoading(false);
        }
      });
    }
  };

  const uploadToFirestore = async () => {
    if (products.length === 0) {
      setMessage('Please load CSV file first');
      return;
    }

    setIsLoading(true);
    setMessage('Uploading products...');

    try {
      for (const product of products) {
        await setDoc(doc(db, 'products', product.productID), product);
      }
      setMessage('Products uploaded successfully!');
    } catch (error) {
      setMessage(`Error uploading products: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Upload Products</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          <button
            onClick={uploadToFirestore}
            disabled={isLoading || products.length === 0}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isLoading || products.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? 'Processing...' : 'Upload to Firestore'}
          </button>

          {message && (
            <div className={`mt-2 text-sm ${
              message.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}>
              {message}
            </div>
          )}

          {products.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Preview:</h2>
              <div className="max-h-60 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.productID}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {product.productID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {product.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          ${product.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductUpload;