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

    // Function to create a user and basket in Firestore with timing
    const createUserBasket = async (userId, name, phone) => {
        // Measure QR code generation time (assuming basketId generation as QR basis)
        const qrStartTime = performance.now();
        const basketId = 'basket_' + Math.random().toString(36).substr(2, 9);
        const qrEndTime = performance.now();
        console.log(`BasketId generation took: ${(qrEndTime - qrStartTime).toFixed(2)} ms`);
        setBasketId(basketId);

        try {
            // Measure database connection and creation time
            const dbStartTime = performance.now();

            // Create basket entry
            const basketPromise = setDoc(doc(db, 'baskets', basketId), {
                products: [],
                totalPrice: "0.00",
                status: 'Pending cashier approval',
                paymentService: 'None'
            });

            // Create user entry
            const userPromise = setDoc(doc(db, 'users', userId), {
                name,
                phone,
                basketId,
            });

            // Wait for both operations to complete
            await Promise.all([basketPromise, userPromise]);

            const dbEndTime = performance.now();
            console.log(`Database creation (user and basket) took: ${(dbEndTime - dbStartTime).toFixed(2)} ms`);

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

        // Measure total connection and operation time
        const connectionStartTime = performance.now();

        try {
            // Redirect based on user role
            if (name === "Admin" && phone === "9840121389") {
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("role", "admin");
                navigate("/dashboard");
            } else {
                localStorage.setItem("isAuthenticated", "true");
                localStorage.setItem("role", "user");

                const userId = `user_${Date.now()}`;
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
            const connectionEndTime = performance.now();
            console.log(`Total connection and operation time: ${(connectionEndTime - connectionStartTime).toFixed(2)} ms`);
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
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
                                isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
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