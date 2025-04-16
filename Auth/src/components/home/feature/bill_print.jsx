import React, { useState, useRef } from 'react';
import { Printer } from 'lucide-react';

const PrintStyles = () => (
    <style>
        {`
        @media print {
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
  
  .receipt-container {
    width: 80mm !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  @page {
    size: auto;
    margin: 0mm;
  }
}
      `}
    </style>
);


const BillTemplate = React.forwardRef(({ items, customerInfo, totals, paymentMode }, ref) => {
    const { subtotal, tax, discount, grandTotal } = totals;
    const { name, phone } = customerInfo;

    const formatCurrency = (amount) => amount.toFixed(2);
    const convertToWords = (num) => {
        return `Rs. ${num.toFixed(2)} Rupees only`;
    };

    return (
        <div ref={ref} className="w-[80mm] mx-auto bg-white p-4 font-mono text-sm leading-tight print:p-0 print:max-w-full">
            <div className="text-center mb-4">
                <h2 className="font-bold text-base">Best Kinmel Mart Pvt. Ltd.</h2>
                <p>Buddhanagar-10, Kathmandu</p>
                <p>PH: 9803828612</p>
                <p>VAT No: 609651702</p>
                <p className="font-bold mt-2">ABBREVIATED TAX INVOICE</p>
            </div>

            <div className="mb-4">
                <p>Bill #: SI-{Math.floor(Math.random() * 1000)}-BKM-{new Date().getFullYear()}</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Payment Mode: {paymentMode || 'Cash'}</p>
                {name && <p>Customer: {name}</p>}
                {phone && <p>Phone: {phone}</p>}
            </div>

            <div className="border-t border-b border-dashed py-2">
                <div className="grid grid-cols-12 gap-1 mb-1 font-bold">
                    <div className="col-span-1">SN</div>
                    <div className="col-span-5">Details</div>
                    <div className="col-span-2 text-center">QTY</div>
                    <div className="col-span-2 text-right">Rate</div>
                    <div className="col-span-2 text-right">Amount</div>
                </div>

                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-1">
                        <div className="col-span-1">{index + 1}</div>
                        <div className="col-span-5">{item.name}</div>
                        <div className="col-span-2 text-center">{item.quantity}</div>
                        <div className="col-span-2 text-right">{formatCurrency(item.price)}</div>
                        <div className="col-span-2 text-right">{formatCurrency(item.price * item.quantity)}</div>
                    </div>
                ))}
            </div>

            <div className="border-b border-dashed py-2">
                <div className="flex justify-between">
                    <span>Gross Amount:</span>
                    <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Net Discount:</span>
                    <span>{formatCurrency((subtotal * discount) / 100)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Round Off:</span>
                    <span>0.00</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>
            </div>

            <div className="border-b border-dashed py-2">
                <div className="flex justify-between">
                    <span>Tender:</span>
                    <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Change:</span>
                    <span>0.00</span>
                </div>
            </div>

            <div className="mt-2">
                <div className="flex justify-between">
                    <span>Total Qty:</span>
                    <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
            </div>

            <p className="text-center mt-2">{convertToWords(grandTotal)}</p>

            <div className="text-center mt-4">
                <p>Thank you for visiting us.</p>
                <p>Hope to see you again.</p>
            </div>
        </div>
    );
});

const App = () => {
    const componentRef = useRef();
    const [items, setItems] = useState([
        {
            name: "Organic Rice (1kg)",
            quantity: 2,
            price: 120.00
        },
        {
            name: "Fresh Milk (1L)",
            quantity: 3,
            price: 85.50
        },
        {
            name: "Whole Wheat Bread",
            quantity: 1,
            price: 45.00
        },
        {
            name: "Farm Eggs (12pc)",
            quantity: 2,
            price: 180.00
        },
        {
            name: "Cooking Oil (1L)",
            quantity: 1,
            price: 250.00
        }
    ]);

    const [customerInfo, setCustomerInfo] = useState({
        name: 'John Doe',
        phone: '9876543210'
    });

    const [paymentMode, setPaymentMode] = useState('Cash');

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 0;
    const discount = 5; // 5% discount
    const grandTotal = subtotal - (subtotal * discount / 100) + tax;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-4xl mx-auto p-6 print:p-0 print:max-w-full">
            <PrintStyles />
            <div className="mb-6 flex justify-between items-center print:hidden">
                <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="p-2 border rounded-md"
                >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                </select>

                <button
                    onClick={handlePrint}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-600 transition-colors"
                >
                    <Printer size={16} />
                    Print Invoice
                </button>
            </div>

            <BillTemplate
                ref={componentRef}
                items={items}
                customerInfo={customerInfo}
                totals={{
                    subtotal,
                    tax,
                    discount,
                    grandTotal
                }}
                paymentMode={paymentMode}
            />
        </div>
    );
};

export default App;