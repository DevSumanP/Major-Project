import React from 'react';
import { FaArrowRight } from 'react-icons/fa';

const ProfileMenu = ({ onTap = () => {}, title = "Demo Title", value = "Demo Value", icon = FaArrowRight }) => {
  return (
    <div className="py-3 flex items-center" onClick={onTap}>
      <div className="flex-3 text-sm text-gray-700 truncate">{title}</div>
      <div className="flex-5 text-sm text-gray-900 truncate">{value}</div>
      <div className="flex justify-end">
        <icon size={18} />
      </div>
    </div>
  );
};

export default ProfileMenu;
