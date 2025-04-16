import React, { useState } from 'react';
import {
    Home,
    Diagram,
    ReceiptItem,
    TransmitSquare,
    DollarSquare,
    Calendar2,
    DocumentText1,
    ShoppingBag,
    ShoppingCart,
    Profile2User,
    More,
    ChartCircle,
    Import,
    Setting,
    HambergerMenu
} from 'iconsax-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';
import Sidebar from '../home/sidebar';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Menu Data Configuration
const menuItems = [
    { icon: Home, label: 'Home', id: 'home' },
    {
        icon: Diagram,
        label: 'Reports',
        id: 'reports',
        hasDropdown: true,
        subItems: ['Daily Reports', 'Weekly Reports', 'Monthly Reports']
    },
    {
        icon: ReceiptItem,
        label: 'Invoices',
        id: 'invoices',
        hasDropdown: true,
        subItems: ['All Invoices', 'Pending', 'Paid']
    },
    { icon: TransmitSquare, label: 'Transactions', id: 'transactions' },
    { icon: DollarSquare, label: 'Balance', id: 'balance' },
    {
        icon: Calendar2,
        label: 'Schedule',
        id: 'schedule',
        hasDropdown: true,
        subItems: ['Calendar', 'Timeline', 'Events']
    },
    { icon: DocumentText1, label: 'Item', id: 'item' },
    {
        icon: ShoppingBag,
        label: 'Order',
        id: 'order',
        hasDropdown: true,
        subItems: ['New Orders', 'Processing', 'Completed']
    },
    { icon: Setting, label: 'Account & Setting', id: 'settings' }
];

// Submenu Component
const SubMenuItem = ({ label }) => (
    <div className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors">
        {label}
    </div>
);

// Menu Item Component
const MenuItem = ({ icon: Icon, label, hasDropdown, isActive, children, isOpen, onClick }) => (
    <div className="flex flex-col">
        <div
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-purple-50' : 'hover:bg-gray-50'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon
                    size={24}
                    variant="Outline"
                    className={isActive ? 'text-purple-600' : 'text-gray-500'}
                />
                <span className={`text-base ${isActive ? 'text-purple-600' : 'text-gray-500'}`}>
                    {label}
                </span>
            </div>
            {hasDropdown && (
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                        }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
        {hasDropdown && (
            <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? 'max-h-48' : 'max-h-0'
                    }`}
            >
                <div className="pl-12 pr-4 py-2 space-y-2">{children}</div>
            </div>
        )}
    </div>
);


// Metric Card Component
const MetricCard = ({ title, value, percentage, isPositive, iconBgColor }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-medium mb-1">{title}</span>
                <h3 className="text-xl font-semibold">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${iconBgColor}`}>
                <ShoppingCart size={20} className="text-gray-700" />
            </div>
        </div>
        <div className="flex items-center justify-between">
            <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'} text-sm`}>
                <svg
                    className={`w-4 h-4 mr-1 ${isPositive ? 'rotate-0' : 'rotate-180'}`}
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
            <button className="text-gray-500 hover:text-gray-700 text-xs underline font-semibold">
                View Report
            </button>
        </div>
    </div>
);

// Customer Metrics Component
const CustomerMetrics = () => {
    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Customers',
                data: [50, 80, 65, 90, 48, 56, 100],
                fill: true,
                borderColor: '#8884FF',
                backgroundColor: 'rgba(136, 132, 255, 0.1)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#8884FF'
            }
        ]
    };

    return (
        <div className="w-full p-6 border bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium">Customers</h2>
                <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">10 Sep</button>
            </div>
            <div className="h-32 mb-4">
                <Line
                    data={lineData}
                    options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { x: { display: false }, y: { display: false } }
                    }}
                />
            </div>
            {[
                { icon: Profile2User, label: 'Total Customers', value: '45%' },
                { icon: Profile2User, label: 'Returning Customers', value: '100%' },
                { icon: ChartCircle, label: 'Avg. Visits Customers', value: '45%' },
                { icon: Import, label: 'Avg. Spent Per Visit', value: '45%' },
                { icon: ShoppingCart, label: 'Feedback', value: '45%' }
            ].map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-3xl">
                            <metric.icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium">{metric.label}</span>
                    </div>
                    <span className="text-gray-500">{metric.value}</span>
                </div>
            ))}
        </div>
    );
};

// Payment Types Component
const PaymentTypes = () => {
    const pieData = {
        labels: ['Cash', 'Check', 'Card', 'Others'],
        datasets: [{
            data: [1254.25, 1254.25, 1254.25, 1254.25],
            backgroundColor: ['#4D7CFE', '#69C0FF', '#4CD964', '#FFD426']
        }]
    };

    return (
        <div className="w-full p-6 border bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Payments Types</h2>
                <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">10 Sep</button>
            </div>
            <div className="relative h-64">
                <Pie
                    data={pieData}
                    options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        cutout: '65%'
                    }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold">$ 6254.5k</div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                {pieData.labels.map((label, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: pieData.datasets[0].backgroundColor[index] }}
                        />
                        <div className="text-sm text-gray-600">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Sales Categories Component
const SalesCategories = () => {
    const barData = {
        labels: ['Sun', 'Mon', 'Tue', 'Wed'],
        datasets: [{
            data: [50, 80, 60, 40],
            backgroundColor: '#f3f2ff',
            borderRadius: 8,
            maxBarThickness: 40
        }]
    };

    return (
        <div className="w-full p-6 border bg-white rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Categories</h2>
                <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">Sales</button>
            </div>
            <div className="mb-6">
                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="text-2xl font-bold">$25.1k</h3>
                        <p className="text-sm text-gray-500">Last 30 days</p>
                    </div>
                    <div className="flex items-center text-green-500 text-sm">
                        <svg
                            className="w-4 h-4 mr-1"
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
                        +8.20% vs prev 30 days
                    </div>
                </div>
            </div>
            <div className="h-56">
                <Bar
                    data={barData}
                    options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { x: { grid: { display: false } }, y: { display: false } }
                    }}
                />
            </div>
        </div>
    );
};

// Payments Table Component
const PaymentsTable = () => {
    const tableData = [
        {
            id: 1,
            product: "Magic mouse",
            price: 684.73,
            quantity: "35 piece",
            avgSale: 459.73,
            date: "1 Feb, 2023",
            status: "STOCK",
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
        },
        // Add other table data entries...
    ];

    return (
        <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center p-4">
                <h2 className="text-lg font-medium">Payments Types</h2>
                <div className="flex gap-4">
                    <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">150 Item</button>
                    <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50">Show All</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="border-b bg-blue-50">
                        <tr>
                            {['PRODUCT', 'PRICE', 'QUANTITY', 'AVG. SALE', 'DATE', 'STATUS', 'ACTION'].map((header, index) => (
                                <th key={index} className="text-left py-3 px-4 text-sm text-gray-600 font-medium">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 text-sm">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} alt={item.product} className="w-8 h-8 rounded-3xl object-cover" />
                                        <span className="font-medium">{item.product}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">${item.price.toLocaleString()}</td>
                                <td className="py-4 px-4">{item.quantity}</td>
                                <td className="py-4 px-4 font-semibold">${item.avgSale.toLocaleString()}</td>
                                <td className="py-4 px-4">{item.date}</td>
                                <td className="py-4 px-4">
                                    <span className={`px-3 py-1 rounded-md text-xs ${item.status === 'STOCK' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <button className="hover:bg-gray-100 p-1 rounded">
                                        <More className="w-5 h-5 text-gray-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Main Dashboard Component
const Dashboard = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const metrics = [
        { title: "Net Sales", value: "$25.1k", percentage: "+15%", isPositive: true, iconBgColor: "bg-green-50" },
        { title: "Returns", value: "$25.1k", percentage: "+15%", isPositive: false, iconBgColor: "bg-blue-50" },
        { title: "Gross Sell", value: "$25.1k", percentage: "+15%", isPositive: true, iconBgColor: "bg-purple-50" },
        { title: "Transactions", value: "$25.1k", percentage: "+15%", isPositive: false, iconBgColor: "bg-violet-50" },
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
        <Sidebar />
      </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 p-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 mb-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 mb-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    <CustomerMetrics />
                    <PaymentTypes />
                    <SalesCategories />
                </div>

                {/* Payments Table */}
                <PaymentsTable />
            </div>
        </div>
    );
};

export default Dashboard;
