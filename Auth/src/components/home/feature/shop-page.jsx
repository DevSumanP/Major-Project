import React, { useState } from 'react';
import { Heart } from 'lucide-react';

// Product Card Component
const ProductCard = ({ name, price, image, isNew, isBestSeller, isHotPromo }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      {(isNew || isBestSeller || isHotPromo) && (
        <div className="absolute top-2 left-2 flex space-x-1">
          {isNew && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">NEW</span>}
          {isBestSeller && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">BEST SELLER</span>}
          {isHotPromo && <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">HOT PROMO</span>}
        </div>
      )}
      <button 
        onClick={() => setIsWishlisted(!isWishlisted)}
        className="absolute top-2 right-2 z-10"
      >
        <Heart 
          className={`w-6 h-6 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-300'}`} 
        />
      </button>
      <img 
        src={image} 
        alt={name} 
        className="w-full h-64 object-cover rounded-lg mb-4" 
      />
      <div className="text-center">
        <h3 className="font-medium text-sm mb-2">{name}</h3>
        <div className="flex justify-center items-center space-x-2">
          <span className="text-purple-600 font-bold">${price}</span>
          {price > 200 && (
            <span className="text-gray-400 line-through text-xs">${price}</span>
          )}
        </div>
        <button className="mt-3 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Sidebar Filter Component
const SidebarFilter = () => {
  return (
    <div className="w-64 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Filter by:</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Type</h3>
        <div className="space-y-2">
          {['Basic', 'Pattern', 'Hoodie', 'Zipper'].map(type => (
            <label key={type} className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Colour</h3>
        <div className="grid grid-cols-5 gap-2">
          {['Black', 'Red', 'Blue', 'Grey', 'Multicolour'].map(color => (
            <div 
              key={color} 
              className="w-8 h-8 rounded-full border"
              style={{
                backgroundColor: 
                  color === 'Black' ? 'black' : 
                  color === 'Red' ? 'red' : 
                  color === 'Blue' ? 'blue' : 
                  color === 'Grey' ? 'grey' : 
                  'white'
              }}
            />
          ))}
        </div>
      </div>

      <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition">
        Apply
      </button>
    </div>
  );
};

// Main Page Component
const SweatshirtPage = () => {
  const products = [
    { 
      name: 'Line-Pattern Zipper Sweatshirt', 
      price: 200, 
      image: '/api/placeholder/300/400', 
      isNew: true 
    },
    { 
      name: 'Black Fantasy Sweatshirt', 
      price: 200, 
      image: '/api/placeholder/300/400', 
      isBestSeller: true 
    },
    { 
      name: 'Brooklyn-NYC Sweatshirt', 
      price: 200, 
      image: '/api/placeholder/300/400' 
    },
    { 
      name: 'Basic Plain Shirt', 
      price: 200, 
      image: '/api/placeholder/300/400', 
      isHotPromo: true 
    },
    { 
      name: 'Basic Orange Sweatshirt', 
      price: 200, 
      image: '/api/placeholder/300/400', 
      isNew: true 
    },
    { 
      name: 'Alui Sweatshirt X Avent G', 
      price: 200, 
      image: '/api/placeholder/300/400' 
    },
    { 
      name: 'Flowers Printed Sweatshirt', 
      price: 200, 
      image: '/api/placeholder/300/400', 
      isHotPromo: true 
    },
    { 
      name: 'Relaxed Fit Printed Sweatshirt', 
      price: 200, 
      image: '/api/placeholder/300/400', 
      isNew: true 
    },
    { 
      name: 'Letter Pattern Knitted Vest', 
      price: 200, 
      image: '/api/placeholder/300/400' 
    }
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Sweatshirt</h1>
          <nav className="text-sm text-gray-500 mt-2">
            Main Page {'>'} Category {'>'} Sweatshirt
          </nav>
        </header>

        <div className="flex space-x-6">
          <SidebarFilter />
          
          <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-600">Showing 1-9 of 24 results</div>
              <select className="border rounded px-4 py-2">
                <option>Sort: Most Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {products.map((product, index) => (
                <ProductCard 
                  key={index}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  isNew={product.isNew}
                  isBestSeller={product.isBestSeller}
                  isHotPromo={product.isHotPromo}
                />
              ))}
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {[1, 2, 3, 4, 5].map(page => (
                <button 
                  key={page} 
                  className={`px-4 py-2 rounded ${
                    page === 3 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-600 border'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SweatshirtPage;