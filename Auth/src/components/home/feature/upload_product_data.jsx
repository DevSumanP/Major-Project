import React, { useState, useCallback } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import SideBar from '../sidebar';
import { HambergerMenu } from 'iconsax-react';

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Utility function to convert image URL to base64
const convertImageUrlToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Error converting image URL to base64: ${url}`, error);
    return "";
  }
};

const ExcelUploadModal = ({ isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [tableData, setTableData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const processExcelFile = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Read the Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setTableData(jsonData);

      // Process each product and convert ImageUrl to base64
      const totalProducts = jsonData.length;
      let processedCount = 0;

      for (const product of jsonData) {
        // Convert ImageUrl to base64
        const base64Image = await convertImageUrlToBase64(product.ImageUrl);
        if (!base64Image) {
          throw new Error(`Failed to convert image for product ${product.ProductID}`);
        }

        // Prepare the product data
        const productData = {
          category: product.Category,
          description: product.Description,
          imageUrl: base64Image,
          price: product.Price,
          productId: product.ProductID,
          productName: product.ProductName,
          quantity: product.Quantity,
        };

        // Add to Firestore
        await setDoc(doc(db, 'products', product.ProductID), productData);

        // Update progress
        processedCount += 1;
        setUploadProgress((processedCount / totalProducts) * 100);
      }

      setSuccessMessage('Products successfully uploaded to Firestore!');
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.message || 'Failed to process and upload the file.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file?.type === 'application/vnd.ms-excel') {
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      processExcelFile(file);
    }
  }, [processExcelFile]);
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="text-center mb-6 relative">
        <button 
          onClick={onClose}
          className="absolute right-0 top-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">Upload Excel File</h2>
        <p className="text-sm text-gray-600 mt-1">
          Drag and drop or select an Excel file to upload and process.
        </p>
      </div>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-gray-600 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gray-600" />
            )}
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-1">
            Drag and drop Excel file to upload
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Your file will be processed and displayed below
          </p>
          <label className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer inline-block">
            Select file
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      </div>

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Data Table */}
      {tableData && (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(tableData[0]).map((header) => (
                  <th 
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <td 
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-gray-500 mt-2">
            Showing first 5 rows of {tableData.length} total rows
          </p>
        </div>
      )}

      {/* Step-by-step guide */}
      <div className="mt-4 border rounded-md">
        <button
          className="w-full px-4 py-2 text-left text-sm font-medium flex justify-between items-center"
          onClick={() => setIsGuideOpen(!isGuideOpen)}
        >
          Step-by-step guide
          <svg
            className={`w-5 h-5 transform transition-transform ${isGuideOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isGuideOpen && (
          <div className="px-4 py-2 text-sm text-gray-600">
            <ol className="list-decimal pl-4 space-y-2">
              <li>Prepare your Excel file with proper column headers (QR Code, Category, Description, ImageUrl, Price, ProductID, ProductName, Quantity)</li>
              <li>Drag and drop the file into the upload area or click "Select file"</li>
              <li>Wait for the file to be processed and uploaded to Firestore</li>
              <li>Review the data in the preview table</li>
              <li>Click "Add to Firestore" to confirm the upload</li>
            </ol>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-6">
        <button 
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button 
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!tableData || isLoading}
          onClick={() => console.log("Data already uploaded to Firestore")}
        >
          Add to Firestore
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(true); // Open modal by default for demo

  return (
    <div className="flex min-h-screen bg-white font-inter">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        <HambergerMenu size={24} className="text-gray-600" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Fixed Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 h-screen bg-white border-r transform transition-transform duration-200 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ExcelUploadModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;