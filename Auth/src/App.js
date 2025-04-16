import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import Login from "./components/auth/login/user-login";
import Home from "./components/home/user-section";
import Cart from "./components/home/cart";
import LabelGenerator from "./components/home/feature/barcode_print";
import Dashboard from "./components/home/dashboard";
import LoginPage from "./components/auth/login/admin-login";
import Bill from "./components/home/feature/bill_print";
import UploadProductData from "./components/home/feature/upload_product_data";
import Shop from "./components/home/feature/shop-page";

// Dummy authentication & role check
const isAuthenticated = () => {
  return localStorage.getItem("isAuthenticated") === "true";
};

const getUserRole = () => {
  return localStorage.getItem("role"); // Example: "admin" or "user"
};

// Protected Route Component
function ProtectedRoute({ element, requiredRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole && getUserRole() !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return element;
}

function App() {
  const routesArray = [
    { path: "/dashboard", element: <ProtectedRoute element={<Dashboard />} requiredRole="admin" /> },
    { path: "/cart", element: <ProtectedRoute element={<Cart />} /> }, // Allow all authenticated users
    { path: "/login", element: <Login /> },
    { path: "/login-page", element: <LoginPage /> },
    { path: "/home", element: <Home /> },
    { path: "/upload", element: <ProtectedRoute element={<UploadProductData />} requiredRole="admin" /> },
    { path: "/print", element: <ProtectedRoute element={<LabelGenerator />} requiredRole="admin" /> },
    { path: "/bill", element: <ProtectedRoute element={<Bill />} requiredRole="admin" /> },
    { path: "/shop", element: <Shop /> },
    // Redirect to home if route not found
    { path: "*", element: <Navigate to={isAuthenticated() ? "/dashboard" : "/login-page"} replace /> },
  ];

  return <div className="w-full h-screen flex flex-col">{useRoutes(routesArray)}</div>;
}

export default App;
