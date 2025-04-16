import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';

const Login = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [basketId, setBasketId] = useState('');
    const navigate = useNavigate();

    // Function to create a user and basket in Firestore
    const createUserBasket = async (userId, name, phone) => {
        const basketId = 'basket_' + Math.random().toString(36).substr(2, 9);
        setBasketId(basketId);

        try {
            // Create basket entry
            await setDoc(doc(db, 'baskets', basketId), {
                products: [], // Initial empty product list
                totalPrice: "0.00",
                status: 'Pending cashier approval',
                paymentService: 'None'
            });

            // Create user entry
            await setDoc(doc(db, 'users', userId), {
                name,
                phone,
                basketId,
            });

            return basketId;
        } catch (error) {
            throw new Error('Failed to create user and basket: ' + error.message);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (isRegistering) return;

        if (!name || !phone) {
            setErrorMessage("Name and phone number are required.");
            return;
        }

        setIsRegistering(true);
        try {
            // Redirect based on user role
            // Check if the email matches the admin email
        if (name === "Admin" && phone === "9840121389") {
            // Store authentication and role information in localStorage
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("role", "admin");

            // Navigate to the dashboard
            navigate("/dashboard");
        } else {
            // Optionally handle non-admin users or show an error
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("role", "user");

                // Generate a unique user ID
                const userId = `user_${Date.now()}`;

                // Create user and basket in Firestore
                const basketId = await createUserBasket(userId, name, phone);

                if (!basketId) {
                    throw new Error("Failed to create basket. Please try again.");
                }
                navigate("/home", { state: { userId, basketId } });
            }
        } catch (error) {
            setErrorMessage(error.message || "An unexpected error occurred.");
        } finally {
            setIsRegistering(false);
        }
    };


    return (
        <div>
            <main className="w-full h-screen flex self-center place-content-center place-items-center">
                <div className="w-96 space-y-5 p-4">
                    <div className="text-center">
                        <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Welcome</h3>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Phone no.</label>
                            <input
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                            />
                        </div>

                        {errorMessage && (
                            <span className="text-red-600 font-bold">{errorMessage}</span>
                        )}

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {isRegistering ? 'Creating...' : 'Sign Up'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Login;
