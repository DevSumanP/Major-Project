import React, { useState, useEffect, useRef } from 'react';
import {
  HambergerMenu,
  ShoppingCart
} from 'iconsax-react';
import { onSnapshot, getDocs, collection, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { MoreHorizontal, ChevronRight, ChevronDown} from 'lucide-react';
import SideBar from './sidebar';

const MetricCard = ({ title, value, percentage, isPositive, iconBgColor }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium mb-1">{title}</span>
          <h3 className="text-lg font-semibold">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${iconBgColor}`}>
          <ShoppingCart size={20} className="text-gray-700" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'} text-sm`}>
            <svg
              className={`lucide lucide-trending-up w-4 h-4 mr-1 ${isPositive ? 'rotate-0' : 'rotate-180'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            {percentage}
          </span>
          <button className="text-xs text-gray-500 hover:text-gray-700 underline font-semibold">
            View Report
          </button>
        </div>
      </div>
    </div>
  );
};

const PaymentsTable = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const basketsRef = collection(db, "baskets");

    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const unsubscribeBaskets = onSnapshot(basketsRef, async (basketSnapshot) => {
        const basketList = await Promise.all(
          basketSnapshot.docs.map(async (docSnap) => {
            const basketData = {
              id: docSnap.id,
              ...docSnap.data(),
            };

            const productsRef = collection(db, "baskets", docSnap.id, "products");
            onSnapshot(productsRef, (productsSnapshot) => {
              basketData.products = productsSnapshot.docs.map((doc) => doc.data());
              setUsers((prevUsers) =>
                prevUsers.map((user) =>
                  user.basketId === basketData.id
                    ? { ...user, basket: basketData }
                    : user
                )
              );
            });

            return basketData;
          })
        );

        const updatedUsers = usersList.map((user) => {
          const basket = basketList.find((basket) => basket.id === user.basketId);
          return { ...user, basket: basket || {} };
        });

        setUsers(updatedUsers);
      });
    });

    return () => unsubscribeUsers();
  }, []);

  const handleMoreClick = (user, e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPosition({ x: rect.right, y: rect.bottom + window.scrollX });
    setSelectedUser(user);
    setShowDropdown(true);
  };

  const handleApproveClick = async (user, e) => {
    e.preventDefault();
    if (!user.basketId) return;

    try {
      const basketRef = doc(db, "baskets", user.basketId);
      await updateDoc(basketRef, { status: 'Active' });

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === user.id ? { ...u, basket: { ...u.basket, status: 'Active' } } : u
        )
      );
      addNotification('Basket approved successfully!', 'success');
    } catch (error) {
      console.error("Error updating status:", error);
      addNotification('Approval failed!', 'error');
    }
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const StatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'Active':
          return 'bg-white border border-gray-200';
        case 'Pending admin approval':
          return 'bg-white border border-gray-200';
        case 'Pending verification':
          return 'bg-white border border-gray-200';
        case 'Inactive':
          return 'bg-gray-100';
        default:
          return 'bg-white border border-gray-200';
      }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle()}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="bg-white rounded-lg">
        {/* <div className="py-[10px] flex justify-end items-center">
          <div className="relative flex-1 max-w-md px-2">
            <Search className="absolute left-3 text-gray-400" style={{ top: '0.7rem', left: '1.2rem' }} size={14} />
            <input
              type="text"
              placeholder="Search for customers..."
              className="pl-10 pr-4 py-2 w-full border text-sm rounded-full bg-purple-50"
            />
          </div>
          <div className="flex gap-2"> 
            <button className="px-3 py-2 border rounded-full text-sm flex items-center gap-1.5">
              <Filter size={14} />
              Filters
            </button>
          </div>
        </div> */}

        <div className="w-full bg-white rounded-lg shadow-sm  border-gray-200 mt-2">
          <div className="px-4 pb-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="py-3 px-2 font-medium">
                    <div className="flex items-center gap-1">
                      Name <ChevronDown size={16} />
                    </div>
                  </th>
                  <th className="py-3 px-2 font-medium">
                    <div className="flex items-center gap-1">
                      Payment Service <ChevronDown size={16} />
                    </div>
                  </th>
                  <th className="py-3 px-2 font-medium">Cart Information</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                  <th className="py-3 px-2 font-medium">View</th>
                  <th className="py-3 px-2"></th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(user => user.basket.status !== 'Completed')
                  .map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <ChevronRight size={16} className="text-gray-400" />
                          <div>
                            <div>{user.name}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-xs">💲</span>
                          </div>
                          <div className='text-sm'>
                            {user.basket.paymentService}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-col gap-0.5">
                          <div className="text-sm text-gray-600">
                            {user.basketId}
                            <br />
                            Total Price : Rs {user.basket.totalPrice}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={user.basket.status} />
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm text-gray-500">Items : {user.basket.products.length}</div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-4">
                          {user.basket.status === 'Pending cashier approval' && (
                            <button onClick={(e) => handleApproveClick(user, e)} className="px-4 py-1 border rounded-full text-sm">
                              Approve
                            </button>
                          )}
                          <button onClick={(e) => handleMoreClick(user, e)}>
                            <MoreHorizontal className="text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {showDropdown && (
          <>
            <div
              className="fixed inset-0"
              onClick={() => setShowDropdown(false)}
            />
            <div
              className="absolute bg-white shadow-lg rounded-lg py-1 w-48"
              style={{ top: dropdownPosition.y + 10, left: dropdownPosition.x - 192 }}
            >
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50">
                Edit profile
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50">
                Reset basket
              </button>
              <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600">
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const metrics = [
    { title: 'Net Sales', value: '$25.1k', percentage: '+15%', isPositive: true, iconBgColor: 'bg-green-50' },
    { title: 'Returns', value: '$25.1k', percentage: '+15%', isPositive: false, iconBgColor: 'bg-blue-50' },
    { title: 'Gross Sell', value: '$25.1k', percentage: '+15%', isPositive: true, iconBgColor: 'bg-purple-50' },
    { title: 'Transactions', value: '$25.1k', percentage: '+15%', isPositive: false, iconBgColor: 'bg-violet-50' },
  ];

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
        className={`fixed inset-y-0 left-0 z-40 w-64 h-screen bg-white border-r transform transition-transform duration-200 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              percentage={metric.percentage}
              isPositive={metric.isPositive}
              iconBgColor={metric.iconBgColor}
            />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <PaymentsTable />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;