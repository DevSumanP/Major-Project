import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Add default values in case state is undefined
  const { userId = 'N/A', basketId = 'N/A' } = location.state || {};
  
  const profileData = {
    userId,
    basketId
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Check if required data is present
  const isValidData = userId !== 'N/A' && basketId !== 'N/A';

  return (
    <div className="bg-white min-h-screen text-black p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={handleBack} className="text-blue-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden mb-2">
          <img 
            src="https://ps.w.org/user-avatar-reloaded/assets/icon-256x256.png?rev=2540745"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <button className="text-blue-500 text-sm hover:underline">
          Change Profile Picture
        </button>
      </div>

      {/* Profile Information Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <ProfileItem label="User Id" value={profileData.userId} />
          <ProfileItem label="Basket Id" value={profileData.basketId} />
        </div>
      </div>

      {/* QR Code Section */}
      <div className="flex flex-col items-center mt-5">
        {isValidData ? (
          <>
            <QRCodeCanvas 
              value={`UserID: ${profileData.userId}\nBasketID: ${profileData.basketId}`} 
              size={230} 
              className="bg-white p-2 rounded-lg"
              level="H"
            />
            <p className="text-sm mt-3 text-black">
              Scan this QR code to access your basket
            </p>
          </>
        ) : (
          <p className="text-yellow-500 text-center">
            Unable to generate QR code. Required data is missing.
          </p>
        )}
      </div>

      {/* Close Account Button */}
      <div className="mt-8">
        <button className="text-red-500 w-full text-center hover:text-red-400 transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-300">
    <span className="text-gray-700">{label}</span>
    <div className="flex items-center">
      <span className="mr-2">{value}</span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  </div>
);

export default ProfilePage;
