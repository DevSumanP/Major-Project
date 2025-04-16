import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if the email matches the admin email
        if (email === "suman-admin@gmail.com") {
            // Store authentication and role information in localStorage
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("role", "admin");

            // Navigate to the dashboard
            navigate("/dashboard");
        } else {
            // Optionally handle non-admin users or show an error
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("role", "user");

            navigate("/home");
        }
         // Check if the items are stored correctly
    console.log("isAuthenticated:", localStorage.getItem("isAuthenticated"));
    console.log("role:", localStorage.getItem("role"));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 pt-12">
            {/* Slack Logo */}


            {/* Form Content */}
            <div className="w-full max-w-md items-center">
                <h1 className="text-5xl text-center font-bold mb-4 tracking-tight">
                    First, enter your email address
                </h1>
                <p className="text-gray-600 text-lg mb-8 text-center">
                    We suggest using the <span className="font-medium">email address you use at work.</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@work-email.com"
                        className="w-full px-4 py-3 text-lg rounded-xl border-[1.5px] border-gray-300 mb-4 
                focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        required
                    />



                    <button
                        type="submit"
                        className="w-full bg-purple-700 text-white text-lg font-medium py-3 rounded-xl
                hover:bg-purple-800 transition-colors duration-200"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;